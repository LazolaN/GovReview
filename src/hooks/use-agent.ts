"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReviewStore } from "@/stores/review-store";
import { createOrchestrator } from "@/lib/agents/orchestrator";

export function useAgent() {
  const {
    reviewId,
    documents,
    setStatus,
    setAgentStatus,
    setAgentResult,
    appendAgentStream,
    setActiveAgent,
    clearAgentStream,
  } = useReviewStore();

  const abortRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount (navigation away)
  useEffect(() => {
    return () => {
      abortRef.current?.();
    };
  }, []);

  const runAllAgents = useCallback(async () => {
    if (documents.length === 0) return;

    // Abort any previous run
    abortRef.current?.();

    const documentText = documents.map((d) => d.extractedText).join("\n\n");
    const orchestrator = createOrchestrator();
    abortRef.current = orchestrator.abort;

    setStatus("analyzing");

    await orchestrator.run(reviewId, documentText, {
      onAgentStart: (agentId) => {
        setAgentStatus(agentId, "running");
        setActiveAgent(agentId);
        clearAgentStream(agentId);
      },
      onAgentStream: (agentId, chunk) => {
        appendAgentStream(agentId, chunk);
      },
      onAgentComplete: (result) => {
        setAgentResult(result);
      },
      onAgentError: (agentId, error) => {
        setAgentStatus(agentId, "error");
        appendAgentStream(agentId, `\n\nError: ${error}`);
      },
      onAgentRetry: (agentId) => {
        clearAgentStream(agentId);
      },
      onAllComplete: () => {
        setStatus("complete");
        setActiveAgent(null);
        abortRef.current = null;
      },
    });
  }, [
    reviewId,
    documents,
    setStatus,
    setAgentStatus,
    setAgentResult,
    appendAgentStream,
    setActiveAgent,
    clearAgentStream,
  ]);

  const abort = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    setStatus("error");
    setActiveAgent(null);
  }, [setStatus, setActiveAgent]);

  return { runAllAgents, abort };
}
