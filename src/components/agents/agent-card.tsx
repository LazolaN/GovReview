"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Database,
  GanttChart,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import type { AgentId, AgentStatus, AgentResult } from "@/types/agent";
import { AGENTS } from "@/types/agent";
import { AgentOutput } from "./agent-output";

const agentIcons: Record<AgentId, typeof ShieldCheck> = {
  lead_consultant: ShieldCheck,
  data_ai_analyst: Database,
  project_manager: GanttChart,
};

const statusConfig: Record<
  AgentStatus,
  { icon: typeof Circle; label: string; className: string }
> = {
  idle: { icon: Circle, label: "Waiting", className: "text-text-tertiary" },
  pending: { icon: Clock, label: "Queued", className: "text-text-secondary" },
  running: {
    icon: Loader2,
    label: "Analysing",
    className: "text-accent-governance",
  },
  complete: {
    icon: CheckCircle2,
    label: "Complete",
    className: "text-accent-success",
  },
  error: { icon: AlertCircle, label: "Error", className: "text-accent-risk" },
};

interface AgentCardProps {
  agentId: AgentId;
  status: AgentStatus;
  result: AgentResult | null;
  streamContent: string;
  isActive: boolean;
}

export function AgentCard({
  agentId,
  status,
  result,
  streamContent,
  isActive,
}: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const agent = AGENTS[agentId];
  const Icon = agentIcons[agentId];
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const hasContent = status === "running" ? streamContent.length > 0 : result !== null;
  const displayText = status === "running" ? streamContent : result?.resultText ?? "";

  return (
    <Card
      accentColor={agent.accentColor}
      glow={isActive}
      className={cn(
        "transition-all duration-300",
        isActive && "ring-1 ring-accent-governance/30"
      )}
    >
      {/* Header */}
      <button
        onClick={() => hasContent && setExpanded(!expanded)}
        disabled={!hasContent}
        className={cn(
          "w-full px-6 py-4 flex items-center justify-between text-left",
          hasContent && "cursor-pointer hover:bg-bg-tertiary/30"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Agent icon with glow effect */}
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
              isActive
                ? "bg-accent-governance/20 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                : "bg-bg-tertiary"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-accent-governance" : "text-text-secondary"
              )}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-text-primary">
                {agent.name}
              </h3>
              <Badge
                variant={
                  agentId === "lead_consultant"
                    ? "governance"
                    : agentId === "data_ai_analyst"
                      ? "data"
                      : "ai"
                }
              >
                {agent.title}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {agent.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Duration */}
          {result?.durationMs && (
            <span className="text-xs text-text-tertiary flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {formatDuration(result.durationMs)}
            </span>
          )}

          {/* Status */}
          <div
            className={cn(
              "flex items-center gap-1.5",
              statusInfo.className
            )}
          >
            <StatusIcon
              className={cn(
                "w-4 h-4",
                status === "running" && "animate-spin"
              )}
            />
            <span className="text-xs font-medium">{statusInfo.label}</span>
          </div>

          {/* Expand toggle */}
          {hasContent && (
            <div className="text-text-tertiary">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </button>

      {/* Streaming/result content */}
      {(expanded || (status === "running" && streamContent.length > 0)) && (
        <CardContent className="border-t border-border animate-fade-in">
          <AgentOutput
            content={displayText}
            isStreaming={status === "running"}
            maturityScores={result?.maturityScores}
          />
        </CardContent>
      )}
    </Card>
  );
}
