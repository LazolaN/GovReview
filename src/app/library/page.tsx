"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE_LABELS } from "@/types/document";
import type { DocumentType } from "@/types/document";
import type { ReviewSummary } from "@/types/review";
import {
  FileSearch,
  Inbox,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

type FilterTab = "all" | "ai_governance" | "data_governance" | "it_governance";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All Reviews" },
  { key: "ai_governance", label: "AI Governance" },
  { key: "data_governance", label: "Data Governance" },
  { key: "it_governance", label: "IT Governance" },
];

function matchesFilter(docType: DocumentType, filter: FilterTab): boolean {
  if (filter === "all") return true;
  if (filter === "ai_governance")
    return docType === "ai_policy" || docType === "ai_governance";
  if (filter === "data_governance")
    return docType === "data_policy" || docType === "data_framework";
  if (filter === "it_governance") return docType === "it_governance";
  return true;
}

const statusBadge: Record<
  string,
  { variant: "default" | "governance" | "success" | "risk"; label: string }
> = {
  uploaded: { variant: "default", label: "Uploaded" },
  analyzing: { variant: "governance", label: "Analysing" },
  complete: { variant: "success", label: "Complete" },
  error: { variant: "risk", label: "Error" },
};

export default function LibraryPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data: ReviewSummary[] = await res.json();
          setReviews(data);
        }
      } catch {
        // Silently fail; empty state will show
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const filtered = reviews.filter((r) =>
    matchesFilter(r.documentType, activeFilter)
  );

  return (
    <Shell>
      <Header
        title="Review Library"
        subtitle="Browse and manage your governance reviews"
        action={
          <Link href="/review">
            <Button size="sm">
              <FileSearch className="w-3.5 h-3.5" />
              New Review
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        {/* Filter tabs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "px-4 py-2 text-xs border rounded-lg transition-colors text-center",
                activeFilter === tab.key
                  ? "bg-accent-governance/10 text-accent-governance border-accent-governance/30"
                  : "bg-bg-secondary text-text-secondary border-border hover:border-border-hover hover:text-text-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-text-tertiary" />
              </div>
              <h3 className="font-display text-lg text-text-primary">
                {reviews.length === 0
                  ? "No reviews yet"
                  : "No matching reviews"}
              </h3>
              <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
                {reviews.length === 0
                  ? "Start your first governance review by uploading a policy document, framework, or governance manual. Your review history will appear here."
                  : "No reviews match the selected filter. Try a different category or start a new review."}
              </p>
              {reviews.length === 0 && (
                <Link href="/review" className="inline-block mt-6">
                  <Button>
                    <FileSearch className="w-4 h-4" />
                    Start First Review
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((review) => {
              const status = statusBadge[review.status] ?? statusBadge.uploaded;
              return (
                <Link key={review.id} href={`/review/${review.id}`}>
                  <Card className="hover:border-border-hover transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="space-y-4">
                      {/* Title and badges */}
                      <div className="space-y-2">
                        <h3 className="font-display text-sm text-text-primary line-clamp-1">
                          {review.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="governance">
                            {DOCUMENT_TYPE_LABELS[review.documentType] ??
                              review.documentType}
                          </Badge>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {review.documentCount}{" "}
                          {review.documentCount === 1 ? "document" : "documents"}
                        </span>
                        <span className="flex items-center gap-1">
                          {review.agentsComplete === review.agentsTotal ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-success" />
                          ) : review.agentsComplete > 0 ? (
                            <Loader2 className="w-3.5 h-3.5 text-accent-governance" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-text-tertiary" />
                          )}
                          {review.agentsComplete}/{review.agentsTotal} agents
                        </span>
                      </div>

                      {/* Agent progress bar */}
                      <div className="w-full bg-bg-tertiary rounded-full h-1.5">
                        <div
                          className="bg-accent-governance h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${(review.agentsComplete / review.agentsTotal) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Date */}
                      <p className="text-xs text-text-tertiary">
                        {formatDate(review.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
