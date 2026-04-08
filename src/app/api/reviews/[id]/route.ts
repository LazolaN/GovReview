import type { NextRequest } from "next/server";
import { getReview, getDocumentsByReview, getAgentResultsByReview } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await getReview(id);

    if (!review) {
      return Response.json({ error: "Review not found" }, { status: 404 });
    }

    const documents = await getDocumentsByReview(id);
    const agentResults = await getAgentResultsByReview(id);

    return Response.json(
      {
        id: review.id,
        title: review.title,
        documentType: review.document_type,
        status: review.status,
        documents: documents.map((doc) => ({
          id: doc.id,
          reviewId: doc.review_id,
          filename: doc.filename,
          filePath: doc.file_path,
          fileSize: doc.file_size,
          fileType: doc.file_type,
          charCount: doc.char_count,
          documentType: doc.document_type,
          createdAt: doc.created_at,
        })),
        agentResults: agentResults.map((ar) => ({
          id: ar.id,
          reviewId: ar.review_id,
          agentId: ar.agent_id,
          status: ar.status,
          resultText: ar.result_text ?? "",
          maturityScores: ar.maturity_scores,
          risks: ar.risks,
          tokensUsed: ar.tokens_used,
          durationMs: ar.duration_ms,
          model: ar.model,
          createdAt: ar.created_at,
        })),
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch review";
    return Response.json({ error: message }, { status: 500 });
  }
}
