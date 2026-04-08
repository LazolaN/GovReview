"use client";

import { FileText, Hash, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatFileSize, formatDate, truncate } from "@/lib/utils";
import { DOCUMENT_TYPE_LABELS } from "@/types/document";
import type { UploadedDocument } from "@/types/document";

interface DocumentPreviewProps {
  document: UploadedDocument;
}

function getDocumentBadgeVariant(type: string) {
  if (type.includes("ai")) return "ai" as const;
  if (type.includes("data")) return "data" as const;
  if (type.includes("it")) return "governance" as const;
  return "default" as const;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {document.filename}
              </p>
              <p className="text-xs text-text-secondary">
                {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>
          <Badge variant={getDocumentBadgeVariant(document.documentType)}>
            {DOCUMENT_TYPE_LABELS[document.documentType]}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {document.charCount.toLocaleString()} chars
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(document.createdAt)}
          </span>
        </div>

        {/* Text preview */}
        <div className="bg-bg-primary rounded-lg p-3 border border-border">
          <p className="text-xs text-text-secondary font-mono leading-relaxed">
            {truncate(document.extractedText, 500)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
