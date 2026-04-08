"use client";

import {
  Upload,
  ShieldCheck,
  Database,
  GanttChart,
  FileOutput,
  Check,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReviewStore } from "@/stores/review-store";

interface TimelineStep {
  id: string;
  label: string;
  icon: typeof Upload;
  status: "pending" | "active" | "complete";
}

export function ReviewTimeline() {
  const { documents, agentStatuses, status } = useReviewStore();

  const steps: TimelineStep[] = [
    {
      id: "upload",
      label: "Document Upload",
      icon: Upload,
      status: documents.length > 0 ? "complete" : "active",
    },
    {
      id: "lead",
      label: "Lead Consultant",
      icon: ShieldCheck,
      status:
        agentStatuses.lead_consultant === "complete"
          ? "complete"
          : agentStatuses.lead_consultant === "running"
            ? "active"
            : "pending",
    },
    {
      id: "analyst",
      label: "Data & AI Analyst",
      icon: Database,
      status:
        agentStatuses.data_ai_analyst === "complete"
          ? "complete"
          : agentStatuses.data_ai_analyst === "running"
            ? "active"
            : "pending",
    },
    {
      id: "pm",
      label: "Project Manager",
      icon: GanttChart,
      status:
        agentStatuses.project_manager === "complete"
          ? "complete"
          : agentStatuses.project_manager === "running"
            ? "active"
            : "pending",
    },
    {
      id: "report",
      label: "Generate Report",
      icon: FileOutput,
      status: status === "complete" ? "active" : "pending",
    },
  ];

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                  step.status === "complete" &&
                    "bg-accent-success/10 text-accent-success",
                  step.status === "active" &&
                    "bg-accent-governance/10 text-accent-governance ring-2 ring-accent-governance/30",
                  step.status === "pending" &&
                    "bg-bg-tertiary text-text-tertiary"
                )}
              >
                {step.status === "complete" ? (
                  <Check className="w-4 h-4" />
                ) : step.status === "active" ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-px h-6 transition-colors",
                    step.status === "complete"
                      ? "bg-accent-success/30"
                      : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-1.5">
              <p
                className={cn(
                  "text-xs font-medium transition-colors",
                  step.status === "complete" && "text-accent-success",
                  step.status === "active" && "text-text-primary",
                  step.status === "pending" && "text-text-tertiary"
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
