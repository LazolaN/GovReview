"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { truncate } from "@/lib/utils";
import type { AgentResult } from "@/types/agent";

interface ReviewData {
  id: string;
  title: string;
  agentResults: AgentResult[];
}

const REPORT_SECTIONS = [
  { id: "cover", label: "Cover Page", description: "Title, client name, date, confidentiality notice" },
  { id: "toc", label: "Table of Contents", description: "Auto-generated contents page" },
  { id: "executive_summary", label: "Executive Summary", description: "High-level findings from the Project Manager" },
  { id: "current_state", label: "Current State Assessment", description: "Full assessment from the Lead Consultant" },
  { id: "maturity_assessment", label: "Maturity Assessment", description: "Scored maturity table across governance dimensions" },
  { id: "gap_analysis", label: "Gap Analysis & Risk Register", description: "Gaps and risks from the Data & AI Analyst" },
  { id: "standards_alignment", label: "Standards Alignment Matrix", description: "Framework alignment scoring" },
  { id: "remediation_roadmap", label: "Remediation Roadmap", description: "Phased implementation plan with ZAR estimates" },
  { id: "raci_matrix", label: "RACI Matrix", description: "Responsibility assignment for remediation tasks" },
  { id: "appendices", label: "Appendices", description: "Full agent outputs for reference" },
] as const;

const AGENT_LABELS: Record<string, { label: string; variant: "governance" | "data" | "ai" }> = {
  lead_consultant: { label: "Lead Consultant", variant: "governance" },
  data_ai_analyst: { label: "Data & AI Analyst", variant: "data" },
  project_manager: { label: "Project Manager", variant: "ai" },
};

export default function ReportBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(REPORT_SECTIONS.map((s) => s.id))
  );
  const [title, setTitle] = useState("ICT Governance Review Report");
  const [clientName, setClientName] = useState("");
  const [format, setFormat] = useState<"docx" | "pdf">("docx");
  const [generating, setGenerating] = useState(false);

  const fetchReview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load review: ${res.statusText}`);
      }
      const data: ReviewData = await res.json();
      setReview(data);

      if (data.title) {
        setTitle(`${data.title} - Governance Review Report`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  function toggleSection(sectionId: string) {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedSections(new Set(REPORT_SECTIONS.map((s) => s.id)));
  }

  function selectNone() {
    setSelectedSections(new Set());
  }

  async function handleGenerate() {
    if (!review || selectedSections.size === 0) return;

    setGenerating(true);
    try {
      const body = {
        reviewId: id,
        format,
        title,
        clientName: clientName || undefined,
        sections: Array.from(selectedSections),
        agentResults: review.agentResults.map((r) => ({
          agentId: r.agentId,
          resultText: r.resultText,
          maturityScores: r.maturityScores,
        })),
      };

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || `Export failed: ${res.statusText}`
        );
      }

      // Download the file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `governance-review-${id}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  const completedAgents =
    review?.agentResults.filter((r) => r.status === "complete") || [];

  return (
    <Shell>
      <Header
        title="Report Builder"
        subtitle={review?.title || "Loading review..."}
      />

      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent-governance/30 border-t-accent-governance rounded-full animate-spin" />
              <p className="text-sm text-text-secondary font-body">
                Loading review data...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 py-4">
                <div className="w-8 h-8 rounded-full bg-accent-risk/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-accent-risk"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-accent-risk font-medium font-body">
                    {error}
                  </p>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchReview();
                    }}
                    className="text-xs text-text-secondary hover:text-text-primary mt-1 cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main content */}
        {!loading && review && (
          <>
            {/* Agent status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-primary font-body">
                    Agent Results
                  </h3>
                  <span className="text-xs text-text-secondary font-body">
                    {completedAgents.length} of 3 agents complete
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(["lead_consultant", "data_ai_analyst", "project_manager"] as const).map(
                    (agentId) => {
                      const result = review.agentResults.find(
                        (r) => r.agentId === agentId
                      );
                      const info = AGENT_LABELS[agentId];
                      const isComplete = result?.status === "complete";

                      return (
                        <Badge
                          key={agentId}
                          variant={isComplete ? info.variant : "default"}
                        >
                          {isComplete ? "\u2713" : "\u2022"} {info.label}
                        </Badge>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Configuration */}
              <div className="lg:col-span-1 space-y-6">
                {/* Report details */}
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-medium text-text-primary font-body">
                      Report Details
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="report-title"
                          className="block text-xs text-text-secondary font-body mb-1.5"
                        >
                          Report Title
                        </label>
                        <input
                          id="report-title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full h-9 px-3 text-sm bg-bg-tertiary border border-border rounded-lg text-text-primary font-body placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-governance/50"
                          placeholder="Report title"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="client-name"
                          className="block text-xs text-text-secondary font-body mb-1.5"
                        >
                          Client Name
                        </label>
                        <input
                          id="client-name"
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full h-9 px-3 text-sm bg-bg-tertiary border border-border rounded-lg text-text-primary font-body placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-governance/50"
                          placeholder="e.g. GEPF, Old Mutual"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Format selector */}
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-medium text-text-primary font-body">
                      Export Format
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormat("docx")}
                        className={`flex-1 h-10 rounded-lg text-sm font-body font-medium transition-all cursor-pointer ${
                          format === "docx"
                            ? "bg-accent-governance/10 text-accent-governance border border-accent-governance/30"
                            : "bg-bg-tertiary text-text-secondary border border-border hover:border-border"
                        }`}
                      >
                        DOCX
                      </button>
                      <button
                        type="button"
                        disabled
                        className="flex-1 h-10 rounded-lg text-sm font-body font-medium bg-bg-tertiary text-text-secondary/40 border border-border cursor-not-allowed"
                        title="PDF export coming soon"
                      >
                        PDF
                      </button>
                    </div>
                    {format === "docx" && (
                      <p className="text-[10px] text-text-secondary/60 mt-2 font-body">
                        Microsoft Word format. Compatible with Word 2016+, Google Docs, and LibreOffice.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Generate button */}
                <Button
                  size="lg"
                  className="w-full"
                  disabled={
                    generating ||
                    selectedSections.size === 0 ||
                    completedAgents.length === 0
                  }
                  onClick={handleGenerate}
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Generate Report
                    </>
                  )}
                </Button>

                {completedAgents.length === 0 && (
                  <p className="text-xs text-text-secondary/60 text-center font-body">
                    At least one agent must complete before generating a report.
                  </p>
                )}
              </div>

              {/* Right column: Section selection + preview */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-text-primary font-body">
                        Report Sections
                      </h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-[10px] text-accent-governance hover:underline cursor-pointer font-body"
                        >
                          Select all
                        </button>
                        <span className="text-text-secondary/30">|</span>
                        <button
                          type="button"
                          onClick={selectNone}
                          className="text-[10px] text-text-secondary hover:text-text-primary cursor-pointer font-body"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {REPORT_SECTIONS.map((section) => {
                        const isSelected = selectedSections.has(section.id);
                        return (
                          <label
                            key={section.id}
                            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-accent-governance/5"
                                : "hover:bg-bg-tertiary/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSection(section.id)}
                              className="mt-0.5 w-4 h-4 rounded border-border bg-bg-tertiary accent-accent-governance"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-text-primary font-body font-medium">
                                {section.label}
                              </span>
                              <p className="text-[11px] text-text-secondary/70 font-body mt-0.5">
                                {section.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview of agent outputs */}
                {completedAgents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-medium text-text-primary font-body">
                        Content Preview
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {completedAgents.map((result) => {
                          const info = AGENT_LABELS[result.agentId];
                          if (!info) return null;

                          return (
                            <div
                              key={result.agentId}
                              className="border border-border/50 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={info.variant} className="text-[10px]">
                                  {info.label}
                                </Badge>
                                {result.maturityScores.length > 0 && (
                                  <span className="text-[10px] text-text-secondary font-body">
                                    {result.maturityScores.length} maturity scores
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary font-body leading-relaxed whitespace-pre-wrap">
                                {truncate(result.resultText, 400)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
