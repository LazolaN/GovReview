"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentOutput } from "@/components/agents/agent-output";
import { MaturityRadar } from "@/components/review/maturity-radar";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import { DOCUMENT_TYPE_LABELS } from "@/types/document";
import type { DocumentType } from "@/types/document";
import type { AgentId, MaturityScore } from "@/types/agent";
import { AGENTS } from "@/types/agent";
import {
  ShieldCheck,
  Database,
  GanttChart,
  CheckCircle2,
  Circle,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  FileOutput,
} from "lucide-react";

const agentIcons: Record<AgentId, typeof ShieldCheck> = {
  lead_consultant: ShieldCheck,
  data_ai_analyst: Database,
  project_manager: GanttChart,
};

const agentVariants: Record<AgentId, "governance" | "data" | "ai"> = {
  lead_consultant: "governance",
  data_ai_analyst: "data",
  project_manager: "ai",
};

interface ReviewDetailData {
  id: string;
  title: string;
  documentType: string;
  status: string;
  documents: Array<{
    id: string;
    reviewId: string;
    filename: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    charCount: number;
    documentType: string;
    createdAt: string;
  }>;
  agentResults: Array<{
    id: string;
    reviewId: string;
    agentId: string;
    status: string;
    resultText: string;
    maturityScores: MaturityScore[];
    risks: Array<Record<string, unknown>>;
    tokensUsed: number;
    durationMs: number;
    model: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const [review, setReview] = useState<ReviewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchReview() {
      try {
        const res = await fetch(`/api/reviews/${params.id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Review not found" : "Failed to load review");
          return;
        }
        const data: ReviewDetailData = await res.json();
        setReview(data);
      } catch {
        setError("Failed to load review");
      } finally {
        setLoading(false);
      }
    }
    fetchReview();
  }, [params.id]);

  function toggleAgent(agentId: string) {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }

  // Collect all maturity scores from lead consultant results
  const maturityScores: MaturityScore[] =
    review?.agentResults.find((r) => r.agentId === "lead_consultant")
      ?.maturityScores ?? [];

  if (loading) {
    return (
      <Shell>
        <Header title="Loading Review..." />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
        </div>
      </Shell>
    );
  }

  if (error || !review) {
    return (
      <Shell>
        <Header title="Review Not Found" />
        <div className="p-8">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 text-accent-risk mx-auto mb-4" />
              <h3 className="font-display text-lg text-text-primary">
                {error ?? "Review not found"}
              </h3>
              <p className="text-sm text-text-secondary mt-2">
                This review may have been removed or the link is incorrect.
              </p>
              <Link href="/library" className="inline-block mt-6">
                <Button>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Library
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  const completedAgents = review.agentResults.filter(
    (r) => r.status === "complete"
  ).length;

  return (
    <Shell>
      <Header
        title={review.title}
        subtitle={`Review created ${formatDate(review.createdAt)}`}
        action={
          <div className="flex items-center gap-3">
            <Badge
              variant={
                review.status === "complete"
                  ? "success"
                  : review.status === "analyzing"
                    ? "governance"
                    : review.status === "error"
                      ? "risk"
                      : "default"
              }
            >
              {review.status === "complete"
                ? "Analysis complete"
                : review.status === "analyzing"
                  ? "Analysis in progress"
                  : review.status}
            </Badge>
            {completedAgents === 3 && (
              <Link href={`/reports/${review.id}`}>
                <Button size="sm">
                  <FileOutput className="w-3.5 h-3.5" />
                  Generate Report
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main content */}
          <div className="col-span-9 space-y-6">
            {/* Documents */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Documents
              </h3>
              {review.documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center">
                        <FileText className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {doc.charCount.toLocaleString()} characters
                        </p>
                      </div>
                    </div>
                    <Badge variant="governance">
                      {DOCUMENT_TYPE_LABELS[doc.documentType as DocumentType] ??
                        doc.documentType}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Agent results */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Agent Analysis
              </h3>
              {(["lead_consultant", "data_ai_analyst", "project_manager"] as AgentId[]).map(
                (agentId) => {
                  const agent = AGENTS[agentId];
                  const result = review.agentResults.find(
                    (r) => r.agentId === agentId
                  );
                  const Icon = agentIcons[agentId];
                  const isExpanded = expandedAgents.has(agentId);
                  const isComplete = result?.status === "complete";

                  return (
                    <Card
                      key={agentId}
                      accentColor={agent.accentColor}
                    >
                      <button
                        onClick={() => result && toggleAgent(agentId)}
                        disabled={!result}
                        className={cn(
                          "w-full px-6 py-4 flex items-center justify-between text-left",
                          result && "cursor-pointer hover:bg-bg-tertiary/30"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isComplete
                                ? "bg-accent-governance/20"
                                : "bg-bg-tertiary"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5",
                                isComplete
                                  ? "text-accent-governance"
                                  : "text-text-secondary"
                              )}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-text-primary">
                                {agent.name}
                              </h3>
                              <Badge variant={agentVariants[agentId]}>
                                {agent.title}
                              </Badge>
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {agent.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {result?.durationMs ? (
                            <span className="text-xs text-text-tertiary flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {formatDuration(result.durationMs)}
                            </span>
                          ) : null}

                          <div
                            className={cn(
                              "flex items-center gap-1.5",
                              isComplete
                                ? "text-accent-success"
                                : "text-text-tertiary"
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                            <span className="text-xs font-medium">
                              {isComplete ? "Complete" : "Not run"}
                            </span>
                          </div>

                          {result && (
                            <div className="text-text-tertiary">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {isExpanded && result && (
                        <CardContent className="border-t border-border animate-fade-in">
                          <AgentOutput
                            content={result.resultText}
                            isStreaming={false}
                            maturityScores={
                              result.maturityScores as MaturityScore[]
                            }
                          />
                        </CardContent>
                      )}
                    </Card>
                  );
                }
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium text-text-primary">
                  Review Summary
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Type</span>
                  <span className="text-text-primary">
                    {DOCUMENT_TYPE_LABELS[
                      review.documentType as DocumentType
                    ] ?? review.documentType}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Documents</span>
                  <span className="text-text-primary">
                    {review.documents.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Agents</span>
                  <span className="text-text-primary">
                    {completedAgents}/3 complete
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Created</span>
                  <span className="text-text-primary">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Maturity radar */}
            {maturityScores.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium text-text-primary">
                    Maturity Overview
                  </h3>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <MaturityRadar scores={maturityScores} size={240} />
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="space-y-3">
                <Link href="/library" className="block">
                  <Button size="sm" className="w-full justify-center">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Library
                  </Button>
                </Link>
                {completedAgents === 3 && (
                  <Link href={`/reports/${review.id}`} className="block">
                    <Button size="sm" className="w-full justify-center">
                      <FileOutput className="w-3.5 h-3.5" />
                      Generate Report
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
