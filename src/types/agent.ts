export type AgentId = "lead_consultant" | "data_ai_analyst" | "project_manager";

export type AgentStatus = "idle" | "pending" | "running" | "complete" | "error";

export interface MaturityScore {
  dimension: string;
  score: number; // 1-5
  maxScore: number;
  commentary: string;
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  likelihood: "low" | "medium" | "high" | "critical";
  impact: "low" | "medium" | "high" | "critical";
  domain: "it_governance" | "data_governance" | "ai_governance";
  mitigation: string;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  accentColor: string;
  icon: string;
  order: number;
}

export interface AgentResult {
  id: string;
  reviewId: string;
  agentId: AgentId;
  status: AgentStatus;
  resultText: string;
  maturityScores: MaturityScore[];
  risks: RiskItem[];
  tokensUsed: number;
  durationMs: number;
  model: string;
  createdAt: string;
}

export interface AgentRunRequest {
  reviewId: string;
  agentId: AgentId;
  documentText: string;
  upstreamResults?: AgentResult[];
}

export interface AgentStreamEvent {
  type: "text" | "status" | "scores" | "error" | "done";
  content: string;
  agentId: AgentId;
  scores?: MaturityScore[];
}

export const AGENTS: Record<AgentId, AgentDefinition> = {
  lead_consultant: {
    id: "lead_consultant",
    name: "Lead Consultant",
    title: "ICT Governance Specialist",
    description:
      "Current state assessment against COBIT 2019, King IV, POPIA, and SA regulatory frameworks. Produces maturity scoring across five dimensions.",
    accentColor: "var(--color-accent-governance)",
    icon: "shield-check",
    order: 1,
  },
  data_ai_analyst: {
    id: "data_ai_analyst",
    name: "Senior Data & AI Analyst",
    title: "Gap Analysis & Benchmarking",
    description:
      "Gap analysis against NIST AI RMF, DAMA-DMBOK 2, EU AI Act, and leading practices. Produces risk register and standards alignment.",
    accentColor: "var(--color-accent-data)",
    icon: "database",
    order: 2,
  },
  project_manager: {
    id: "project_manager",
    name: "Project Manager",
    title: "Implementation Roadmap",
    description:
      "Remediation roadmap with RACI matrix, ZAR cost estimates, governance committee structures, and risk-of-inaction analysis.",
    accentColor: "var(--color-accent-ai)",
    icon: "gantt-chart",
    order: 3,
  },
};
