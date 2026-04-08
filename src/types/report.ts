export type ReportType =
  | "current_state"
  | "gap_analysis"
  | "benchmarking"
  | "integrated"
  | "full";

export type ReportFormat = "docx" | "pdf";

export interface Report {
  id: string;
  reviewId: string;
  reportType: ReportType;
  filePath: string;
  format: ReportFormat;
  createdAt: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  current_state: "Current State Assessment",
  gap_analysis: "Gap Analysis & Risk Register",
  benchmarking: "Benchmarking Report",
  integrated: "Integrated Summary",
  full: "Full Governance Review Report",
};
