"use client";

import { create } from "zustand";
import type { AgentId, AgentResult, AgentStatus } from "@/types/agent";
import type { DocumentType, UploadedDocument, UploadProgress } from "@/types/document";
import type { ReviewStatus } from "@/types/review";

interface ReviewState {
  // Review metadata
  reviewId: string;
  title: string;
  documentType: DocumentType | null;
  status: ReviewStatus;

  // Documents
  documents: UploadedDocument[];
  uploadProgress: UploadProgress | null;

  // Agent state
  agentStatuses: Record<AgentId, AgentStatus>;
  agentResults: Record<AgentId, AgentResult | null>;
  agentStreams: Record<AgentId, string>;
  activeAgent: AgentId | null;

  // Actions
  setTitle: (title: string) => void;
  setDocumentType: (type: DocumentType) => void;
  setStatus: (status: ReviewStatus) => void;
  addDocument: (doc: UploadedDocument) => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setAgentStatus: (agentId: AgentId, status: AgentStatus) => void;
  setAgentResult: (result: AgentResult) => void;
  appendAgentStream: (agentId: AgentId, chunk: string) => void;
  clearAgentStream: (agentId: AgentId) => void;
  setActiveAgent: (agentId: AgentId | null) => void;
  reset: () => void;
}

const initialState = {
  reviewId: crypto.randomUUID(),
  title: "",
  documentType: null as DocumentType | null,
  status: "uploaded" as ReviewStatus,
  documents: [] as UploadedDocument[],
  uploadProgress: null as UploadProgress | null,
  agentStatuses: {
    lead_consultant: "idle" as AgentStatus,
    data_ai_analyst: "idle" as AgentStatus,
    project_manager: "idle" as AgentStatus,
  },
  agentResults: {
    lead_consultant: null as AgentResult | null,
    data_ai_analyst: null as AgentResult | null,
    project_manager: null as AgentResult | null,
  },
  agentStreams: {
    lead_consultant: "",
    data_ai_analyst: "",
    project_manager: "",
  },
  activeAgent: null as AgentId | null,
};

export const useReviewStore = create<ReviewState>((set) => ({
  ...initialState,

  setTitle: (title) => set({ title }),

  setDocumentType: (documentType) => set({ documentType }),

  setStatus: (status) => set({ status }),

  addDocument: (doc) =>
    set((state) => ({
      documents: [...state.documents, doc],
      documentType: doc.documentType as DocumentType,
    })),

  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  setAgentStatus: (agentId, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [agentId]: status },
    })),

  setAgentResult: (result) =>
    set((state) => ({
      agentResults: { ...state.agentResults, [result.agentId]: result },
      agentStatuses: {
        ...state.agentStatuses,
        [result.agentId]: result.status,
      },
    })),

  appendAgentStream: (agentId, chunk) =>
    set((state) => ({
      agentStreams: {
        ...state.agentStreams,
        [agentId]: state.agentStreams[agentId] + chunk,
      },
    })),

  clearAgentStream: (agentId) =>
    set((state) => ({
      agentStreams: {
        ...state.agentStreams,
        [agentId]: "",
      },
    })),

  setActiveAgent: (activeAgent) => set({ activeAgent }),

  reset: () => set({ ...initialState, reviewId: crypto.randomUUID() }),
}));
