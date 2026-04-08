import type { AgentResult } from "./agent";
import type { DocumentType, UploadedDocument } from "./document";

export type ReviewStatus = "uploaded" | "analyzing" | "complete" | "error";

export interface Review {
  id: string;
  title: string;
  documentType: DocumentType;
  status: ReviewStatus;
  documents: UploadedDocument[];
  agentResults: AgentResult[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  id: string;
  title: string;
  documentType: DocumentType;
  status: ReviewStatus;
  documentCount: number;
  agentsComplete: number;
  agentsTotal: number;
  createdAt: string;
}
