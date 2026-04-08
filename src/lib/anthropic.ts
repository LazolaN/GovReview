/**
 * Server-side Claude API client wrapper.
 * Only use in API routes, never import on the client side.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeStreamOptions {
  system: string;
  messages: ClaudeMessage[];
  model?: string;
  maxTokens?: number;
}

/**
 * Creates a streaming response from Claude API.
 * Returns a ReadableStream suitable for SSE responses.
 */
export async function streamClaude({
  system,
  messages,
  model = "claude-sonnet-4-20250514",
  maxTokens = 4096,
}: ClaudeStreamOptions): Promise<ReadableStream> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream from Claude API");
  }

  const decoder = new TextDecoder();
  let totalTokens = 0;

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: "usage", tokens: totalTokens })}\n\ndata: [DONE]\n\n`
            )
          );
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);

            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta"
            ) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ type: "text", content: event.delta.text })}\n\n`
                )
              );
            } else if (event.type === "message_delta" && event.usage) {
              totalTokens = event.usage.output_tokens;
            } else if (event.type === "message_start" && event.message?.usage) {
              totalTokens += event.message.usage.input_tokens;
            } else if (event.type === "error") {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ type: "error", content: event.error?.message || "Stream error" })}\n\n`
                )
              );
            }
          } catch {
            // Partial JSON from stream, skip
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Stream read failed";
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ type: "error", content: message })}\n\ndata: [DONE]\n\n`
          )
        );
        controller.close();
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
