"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadProgress } from "@/types/document";

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  progress: UploadProgress | null;
  disabled?: boolean;
}

const stageLabels = {
  uploading: "Uploading file...",
  extracting: "Extracting text content...",
  classifying: "Classifying document type...",
  complete: "Processing complete",
  error: "Upload failed",
};

export function UploadZone({ onFileAccepted, progress, disabled }: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    disabled: disabled || progress?.stage === "uploading" || progress?.stage === "extracting",
  });

  const isProcessing =
    progress &&
    progress.stage !== "complete" &&
    progress.stage !== "error";

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300",
        isDragActive
          ? "border-accent-governance bg-accent-governance/5 scale-[1.01]"
          : "border-border hover:border-border-hover hover:bg-bg-secondary/50",
        disabled && "opacity-50 cursor-not-allowed",
        isProcessing && "pointer-events-none"
      )}
    >
      <input {...getInputProps()} />

      {isProcessing ? (
        <div className="space-y-4 animate-fade-in">
          <Loader2 className="w-10 h-10 text-accent-governance mx-auto animate-spin" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {stageLabels[progress.stage]}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {progress.filename}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-64 mx-auto h-1 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-governance rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      ) : progress?.stage === "complete" ? (
        <div className="space-y-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-accent-success/10 flex items-center justify-center mx-auto">
            <Check className="w-5 h-5 text-accent-success" />
          </div>
          <p className="text-sm text-accent-success font-medium">
            Document uploaded successfully
          </p>
          <p className="text-xs text-text-secondary">
            Drop another file or click to replace
          </p>
        </div>
      ) : progress?.stage === "error" ? (
        <div className="space-y-3 animate-fade-in">
          <AlertCircle className="w-10 h-10 text-accent-risk mx-auto" />
          <p className="text-sm text-accent-risk font-medium">{progress.error}</p>
          <p className="text-xs text-text-secondary">Click or drop to try again</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center mx-auto">
            {isDragActive ? (
              <FileText className="w-6 h-6 text-accent-governance" />
            ) : (
              <Upload className="w-6 h-6 text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {isDragActive
                ? "Drop your governance document here"
                : "Upload a governance document"}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              PDF, DOCX, TXT, or MD up to 20MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
