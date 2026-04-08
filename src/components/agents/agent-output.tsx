"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { MaturityScore } from "@/types/agent";

interface AgentOutputProps {
  content: string;
  isStreaming: boolean;
  maturityScores?: MaturityScore[];
}

export function AgentOutput({
  content,
  isStreaming,
  maturityScores,
}: AgentOutputProps) {
  return (
    <div className="space-y-4">
      {/* Maturity scores summary bar */}
      {maturityScores && maturityScores.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-4">
          {maturityScores.map((score) => (
            <div
              key={score.dimension}
              className="flex items-center gap-2 bg-bg-primary rounded-lg px-3 py-2 border border-border"
            >
              <span className="text-xs text-text-secondary">
                {score.dimension}
              </span>
              <span
                className={cn(
                  "text-sm font-mono font-bold",
                  score.score >= 4
                    ? "text-accent-success"
                    : score.score >= 3
                      ? "text-accent-ai"
                      : score.score >= 2
                        ? "text-accent-governance"
                        : "text-accent-risk"
                )}
              >
                {score.score}/5
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Markdown content */}
      <div
        className={cn(
          "prose prose-invert prose-sm max-w-none",
          "prose-headings:font-display prose-headings:text-text-primary prose-headings:border-b prose-headings:border-border prose-headings:pb-2 prose-headings:mb-3",
          "prose-h3:text-base prose-h4:text-sm",
          "prose-p:text-text-secondary prose-p:leading-relaxed",
          "prose-li:text-text-secondary",
          "prose-strong:text-text-primary",
          "prose-table:text-xs",
          "prose-th:bg-bg-tertiary prose-th:px-3 prose-th:py-2 prose-th:text-text-secondary prose-th:font-medium prose-th:text-left",
          "prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-border prose-td:text-text-secondary",
          "prose-code:text-accent-governance prose-code:bg-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
          isStreaming && "after:content-['_'] after:inline-block after:w-2 after:h-4 after:bg-accent-governance after:animate-pulse-glow after:ml-0.5"
        )}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
