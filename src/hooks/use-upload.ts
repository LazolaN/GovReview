"use client";

import { useCallback, useState } from "react";
import type { UploadedDocument, UploadProgress } from "@/types/document";

export function useUpload() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadedDocument | null> => {
    setError(null);
    setProgress({
      filename: file.name,
      progress: 0,
      stage: "uploading",
    });

    try {
      setProgress({
        filename: file.name,
        progress: 30,
        stage: "uploading",
      });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress({
        filename: file.name,
        progress: 60,
        stage: "extracting",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      setProgress({
        filename: file.name,
        progress: 80,
        stage: "classifying",
      });

      const document: UploadedDocument = await response.json();

      setProgress({
        filename: file.name,
        progress: 100,
        stage: "complete",
      });

      // Clear progress after a brief delay
      setTimeout(() => setProgress(null), 1500);

      return document;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setProgress({
        filename: file.name,
        progress: 0,
        stage: "error",
        error: message,
      });
      return null;
    }
  }, []);

  return { upload, progress, error, clearError: () => setError(null) };
}
