"use client";

import { useCallback } from "react";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { AgentRunner } from "@/components/agents/agent-runner";
import { ReviewTimeline } from "@/components/review/review-timeline";
import { MaturityRadar } from "@/components/review/maturity-radar";
import { useReviewStore } from "@/stores/review-store";
import { useUpload } from "@/hooks/use-upload";
import type { UploadedDocument } from "@/types/document";

export default function ReviewPage() {
  const {
    documents,
    addDocument,
    agentResults,
    status,
  } = useReviewStore();
  const { upload, progress } = useUpload();

  const handleFileAccepted = useCallback(
    async (file: File) => {
      const doc = await upload(file);
      if (doc) {
        addDocument(doc as UploadedDocument);
      }
    },
    [upload, addDocument]
  );

  // Collect maturity scores from lead consultant
  const maturityScores =
    agentResults.lead_consultant?.maturityScores ?? [];

  return (
    <Shell>
      <Header
        title="New Review"
        subtitle="Upload a governance document to begin analysis"
        action={
          status !== "uploaded" && (
            <Badge
              variant={
                status === "analyzing"
                  ? "governance"
                  : status === "complete"
                    ? "success"
                    : "risk"
              }
            >
              {status === "analyzing"
                ? "Analysis in progress"
                : status === "complete"
                  ? "Analysis complete"
                  : status}
            </Badge>
          )
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main content area */}
          <div className="col-span-9 space-y-6">
            {/* Upload section */}
            <UploadZone
              onFileAccepted={handleFileAccepted}
              progress={progress}
              disabled={status === "analyzing"}
            />

            {/* Document preview */}
            {documents.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-secondary">
                  Uploaded Documents
                </h3>
                {documents.map((doc) => (
                  <DocumentPreview key={doc.id} document={doc} />
                ))}
              </div>
            )}

            {/* Agent analysis section */}
            {documents.length > 0 && <AgentRunner />}
          </div>

          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Progress timeline */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium text-text-primary">
                  Review Progress
                </h3>
              </CardHeader>
              <CardContent>
                <ReviewTimeline />
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

            {/* Quick info */}
            <Card>
              <CardContent className="space-y-3">
                <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  How it works
                </h4>
                <ol className="space-y-2 text-xs text-text-secondary">
                  <li className="flex gap-2">
                    <span className="text-accent-governance font-mono font-bold">
                      1.
                    </span>
                    Upload your governance document (PDF, DOCX, TXT)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-governance font-mono font-bold">
                      2.
                    </span>
                    Three specialist agents analyse sequentially
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-governance font-mono font-bold">
                      3.
                    </span>
                    Review findings, maturity scores, and risk register
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-governance font-mono font-bold">
                      4.
                    </span>
                    Generate a comprehensive DOCX report
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
