import type { AgentId, AgentResult } from "@/types/agent";
import { parseAgentOutput } from "./parser";
import { getSystemPrompt, getUserPrompt } from "./prompts";

const AGENT_ORDER: AgentId[] = [
  "lead_consultant",
  "data_ai_analyst",
  "project_manager",
];

const MAX_RETRIES = 2;

interface OrchestratorCallbacks {
  onAgentStart: (agentId: AgentId) => void;
  onAgentStream: (agentId: AgentId, chunk: string) => void;
  onAgentComplete: (result: AgentResult) => void;
  onAgentError: (agentId: AgentId, error: string) => void;
  onAllComplete: (results: AgentResult[]) => void;
  /** Called before a retry to allow clearing previous partial stream */
  onAgentRetry?: (agentId: AgentId, attempt: number) => void;
}

/**
 * Calls the analyze API route which proxies to Claude.
 * Handles streaming and returns the full result text.
 */
async function runSingleAgent(
  reviewId: string,
  agentId: AgentId,
  documentText: string,
  upstreamResults: AgentResult[],
  onStream: (chunk: string) => void,
  signal?: AbortSignal
): Promise<{ text: string; tokensUsed: number; durationMs: number }> {
  const startTime = Date.now();

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewId,
      agentId,
      documentText,
      upstreamResults: upstreamResults.map((r) => ({
        agentId: r.agentId,
        resultText: r.resultText,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Agent ${agentId} failed: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream available");
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let tokensUsed = 0;

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        throw new Error("Analysis cancelled");
      }

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text") {
              fullText += parsed.content;
              onStream(parsed.content);
            } else if (parsed.type === "usage") {
              tokensUsed = parsed.tokens;
            }
          } catch {
            // Partial JSON, continue
          }
        }
      }
    }
  } catch (error) {
    reader.cancel();
    throw error;
  }

  return {
    text: fullText,
    tokensUsed,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Orchestrates sequential execution of all three agents.
 * Each downstream agent receives upstream results as additional context.
 * Returns an AbortController to allow cancellation.
 */
export function createOrchestrator() {
  const abortController = new AbortController();

  const run = async (
    reviewId: string,
    documentText: string,
    callbacks: OrchestratorCallbacks
  ): Promise<AgentResult[]> => {
    const completedResults: AgentResult[] = [];

    for (const agentId of AGENT_ORDER) {
      if (abortController.signal.aborted) break;

      callbacks.onAgentStart(agentId);

      let lastError: string | null = null;
      let success = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (abortController.signal.aborted) break;

        // Clear stream on retry so partial content doesn't accumulate
        if (attempt > 0) {
          callbacks.onAgentRetry?.(agentId, attempt);
        }

        try {
          const { text, tokensUsed, durationMs } = await runSingleAgent(
            reviewId,
            agentId,
            documentText,
            completedResults,
            (chunk) => callbacks.onAgentStream(agentId, chunk),
            abortController.signal
          );

          const { maturityScores, risks } = parseAgentOutput(agentId, text);

          const result: AgentResult = {
            id: crypto.randomUUID(),
            reviewId,
            agentId,
            status: "complete",
            resultText: text,
            maturityScores,
            risks,
            tokensUsed,
            durationMs,
            model: "claude-sonnet-4-20250514",
            createdAt: new Date().toISOString(),
          };

          completedResults.push(result);
          callbacks.onAgentComplete(result);
          success = true;
          break;
        } catch (error) {
          if (abortController.signal.aborted) break;
          lastError =
            error instanceof Error ? error.message : "Unknown error occurred";
          if (attempt < MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (attempt + 1))
            );
          }
        }
      }

      if (!success && !abortController.signal.aborted) {
        callbacks.onAgentError(agentId, lastError ?? "Max retries exceeded");
      }
    }

    callbacks.onAllComplete(completedResults);
    return completedResults;
  };

  return { run, abort: () => abortController.abort() };
}

/**
 * Legacy function for backwards compatibility.
 */
export async function runOrchestrator(
  reviewId: string,
  documentText: string,
  callbacks: OrchestratorCallbacks
): Promise<AgentResult[]> {
  const orchestrator = createOrchestrator();
  return orchestrator.run(reviewId, documentText, callbacks);
}

/**
 * Builds the system prompt for direct API calls (used in API route).
 */
export function buildAgentMessages(
  agentId: AgentId,
  documentText: string,
  upstreamResults: AgentResult[] = []
): { system: string; user: string } {
  return {
    system: getSystemPrompt(agentId, upstreamResults),
    user: getUserPrompt(documentText),
  };
}

export { AGENT_ORDER };
