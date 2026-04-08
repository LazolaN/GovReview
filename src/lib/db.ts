/**
 * Database access layer with Supabase persistence and in-memory fallback.
 * When Supabase is not configured, uses Map-based stores for local development.
 */

import { isSupabaseConfigured, createServerClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type AgentResultRow = Database["public"]["Tables"]["agent_results"]["Row"];
type AgentResultInsert = Database["public"]["Tables"]["agent_results"]["Insert"];
type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

// ---------------------------------------------------------------------------
// In-memory fallback stores (for local dev without Supabase)
// ---------------------------------------------------------------------------

const memoryReviews = new Map<string, ReviewRow>();
const memoryDocuments = new Map<string, DocumentRow>();
const memoryAgentResults = new Map<string, AgentResultRow>();
const memoryReports = new Map<string, ReportRow>();

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function createReview(
  data: ReviewInsert
): Promise<ReviewRow> {
  const id = data.id ?? crypto.randomUUID();
  const timestamp = now();

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from("reviews")
      .insert({ ...data, id })
      .select()
      .single();
    if (error) throw new Error(`Failed to create review: ${error.message}`);
    return row;
  }

  const row: ReviewRow = {
    id,
    user_id: data.user_id,
    title: data.title,
    document_type: data.document_type ?? "other",
    status: data.status ?? "uploaded",
    created_at: data.created_at ?? timestamp,
    updated_at: data.updated_at ?? timestamp,
  };
  memoryReviews.set(id, row);
  return row;
}

export async function getReview(id: string): Promise<ReviewRow | null> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .select()
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  return memoryReviews.get(id) ?? null;
}

export async function getReviewsByUser(userId: string): Promise<ReviewRow[]> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
    return data ?? [];
  }

  return Array.from(memoryReviews.values())
    .filter((r) => r.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function updateReviewStatus(
  id: string,
  status: string
): Promise<ReviewRow | null> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .update({ status, updated_at: now() })
      .eq("id", id)
      .select()
      .single();
    if (error) return null;
    return data;
  }

  const existing = memoryReviews.get(id);
  if (!existing) return null;
  const updated: ReviewRow = { ...existing, status, updated_at: now() };
  memoryReviews.set(id, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function createDocument(
  data: DocumentInsert
): Promise<DocumentRow> {
  const id = data.id ?? crypto.randomUUID();

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from("documents")
      .insert({ ...data, id })
      .select()
      .single();
    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return row;
  }

  const row: DocumentRow = {
    id,
    review_id: data.review_id,
    filename: data.filename,
    file_path: data.file_path,
    file_size: data.file_size ?? 0,
    file_type: data.file_type ?? "pdf",
    extracted_text: data.extracted_text ?? null,
    char_count: data.char_count ?? 0,
    document_type: data.document_type ?? "other",
    created_at: data.created_at ?? now(),
  };
  memoryDocuments.set(id, row);
  return row;
}

export async function getDocumentsByReview(
  reviewId: string
): Promise<DocumentRow[]> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("documents")
      .select()
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });
    if (error)
      throw new Error(`Failed to fetch documents: ${error.message}`);
    return data ?? [];
  }

  return Array.from(memoryDocuments.values()).filter(
    (d) => d.review_id === reviewId
  );
}

// ---------------------------------------------------------------------------
// Agent Results
// ---------------------------------------------------------------------------

export async function createAgentResult(
  data: AgentResultInsert
): Promise<AgentResultRow> {
  const id = data.id ?? crypto.randomUUID();

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from("agent_results")
      .insert({ ...data, id })
      .select()
      .single();
    if (error)
      throw new Error(`Failed to create agent result: ${error.message}`);
    return row;
  }

  const row: AgentResultRow = {
    id,
    review_id: data.review_id,
    agent_id: data.agent_id,
    status: data.status ?? "complete",
    result_text: data.result_text ?? null,
    maturity_scores: data.maturity_scores ?? [],
    risks: data.risks ?? [],
    tokens_used: data.tokens_used ?? 0,
    duration_ms: data.duration_ms ?? 0,
    model: data.model ?? "",
    created_at: data.created_at ?? now(),
  };
  memoryAgentResults.set(id, row);
  return row;
}

export async function getAgentResultsByReview(
  reviewId: string
): Promise<AgentResultRow[]> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("agent_results")
      .select()
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });
    if (error)
      throw new Error(`Failed to fetch agent results: ${error.message}`);
    return data ?? [];
  }

  return Array.from(memoryAgentResults.values()).filter(
    (r) => r.review_id === reviewId
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function createReport(
  data: ReportInsert
): Promise<ReportRow> {
  const id = data.id ?? crypto.randomUUID();

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from("reports")
      .insert({ ...data, id })
      .select()
      .single();
    if (error) throw new Error(`Failed to create report: ${error.message}`);
    return row;
  }

  const row: ReportRow = {
    id,
    review_id: data.review_id,
    report_type: data.report_type,
    file_path: data.file_path ?? null,
    format: data.format ?? "docx",
    created_at: data.created_at ?? now(),
  };
  memoryReports.set(id, row);
  return row;
}

export async function getReportsByReview(
  reviewId: string
): Promise<ReportRow[]> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("reports")
      .select()
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Failed to fetch reports: ${error.message}`);
    return data ?? [];
  }

  return Array.from(memoryReports.values()).filter(
    (r) => r.review_id === reviewId
  );
}
