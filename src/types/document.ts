export type DocumentType =
  | "ai_policy"
  | "ai_governance"
  | "data_policy"
  | "data_framework"
  | "it_governance"
  | "other";

export type FileType = "pdf" | "docx" | "txt" | "md";

export interface UploadedDocument {
  id: string;
  reviewId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  fileType: FileType;
  extractedText: string;
  charCount: number;
  documentType: DocumentType;
  createdAt: string;
}

export interface UploadProgress {
  filename: string;
  progress: number; // 0-100
  stage: "uploading" | "extracting" | "classifying" | "complete" | "error";
  error?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  ai_policy: "AI Policy",
  ai_governance: "AI Governance Framework",
  data_policy: "Data Policy",
  data_framework: "Data Governance Framework",
  it_governance: "IT Governance Framework",
  other: "Other Document",
};

export const ACCEPTED_FILE_TYPES: Record<FileType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
};

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
