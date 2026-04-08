import { NextRequest } from "next/server";
import { z } from "zod";
import { buildAgentMessages } from "@/lib/agents/orchestrator";
import { streamClaude } from "@/lib/anthropic";
import { chunkDocument, createChunkPrefix } from "@/lib/documents/chunk";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AgentId } from "@/types/agent";

const analyzeSchema = z.object({
  reviewId: z.string().uuid(),
  agentId: z.enum(["lead_consultant", "data_ai_analyst", "project_manager"]),
  documentText: z.string().min(1, "Document text is required"),
  upstreamResults: z
    .array(
      z.object({
        agentId: z.string(),
        resultText: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 analyses per hour per IP
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateCheck = checkRateLimit(`analyze:${clientIp}`, 10);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Maximum 10 analyses per hour.",
          resetAt: new Date(rateCheck.resetAt).toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(
              Math.ceil((rateCheck.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { agentId, documentText, upstreamResults } = parsed.data;

    // Handle large documents by chunking
    const chunks = chunkDocument(documentText);
    let processedText = documentText;

    if (chunks.length > 1) {
      // For chunked documents, prepend chunk info
      processedText = chunks
        .map(
          (chunk, i) => `${createChunkPrefix(i, chunks.length)}${chunk}`
        )
        .join("\n\n");
    }

    // Build messages for Claude
    const { system, user } = buildAgentMessages(
      agentId as AgentId,
      processedText,
      upstreamResults.map((r) => ({
        id: "",
        reviewId: "",
        agentId: r.agentId as AgentId,
        status: "complete" as const,
        resultText: r.resultText,
        maturityScores: [],
        risks: [],
        tokensUsed: 0,
        durationMs: 0,
        model: "",
        createdAt: "",
      }))
    );

    const stream = await streamClaude({
      system,
      messages: [{ role: "user", content: user }],
      maxTokens: 4096,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
