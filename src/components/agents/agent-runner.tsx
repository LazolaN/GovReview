"use client";

import { AgentCard } from "./agent-card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { useReviewStore } from "@/stores/review-store";
import { useAgent } from "@/hooks/use-agent";
import type { AgentId } from "@/types/agent";

const AGENT_ORDER: AgentId[] = [
  "lead_consultant",
  "data_ai_analyst",
  "project_manager",
];

export function AgentRunner() {
  const {
    documents,
    status,
    agentStatuses,
    agentResults,
    agentStreams,
    activeAgent,
    reset,
  } = useReviewStore();
  const { runAllAgents } = useAgent();

  const hasDocuments = documents.length > 0;
  const isRunning = status === "analyzing";
  const isComplete = status === "complete";
  const allIdle = Object.values(agentStatuses).every((s) => s === "idle");

  return (
    <div className="space-y-4">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-text-primary">
            Agent Analysis
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Three specialist agents will analyse your governance document
            sequentially
          </p>
        </div>

        <div className="flex gap-2">
          {isComplete && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="w-3.5 h-3.5" />
              New Review
            </Button>
          )}
          <Button
            size="sm"
            disabled={!hasDocuments || isRunning}
            onClick={runAllAgents}
          >
            <Play className="w-3.5 h-3.5" />
            {allIdle ? "Start Analysis" : isRunning ? "Analysing..." : "Re-run"}
          </Button>
        </div>
      </div>

      {/* Agent cards */}
      <div className="space-y-3">
        {AGENT_ORDER.map((agentId) => (
          <AgentCard
            key={agentId}
            agentId={agentId}
            status={agentStatuses[agentId]}
            result={agentResults[agentId]}
            streamContent={agentStreams[agentId]}
            isActive={activeAgent === agentId}
          />
        ))}
      </div>
    </div>
  );
}
