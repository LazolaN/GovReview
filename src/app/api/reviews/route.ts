import { getReviewsByUser, getDocumentsByReview, getAgentResultsByReview } from "@/lib/db";
import type { ReviewSummary } from "@/types/review";
import type { DocumentType } from "@/types/document";

const PLACEHOLDER_USER_ID = "placeholder-user";

export async function GET() {
  try {
    const reviews = await getReviewsByUser(PLACEHOLDER_USER_ID);

    const summaries: ReviewSummary[] = await Promise.all(
      reviews.map(async (review) => {
        const documents = await getDocumentsByReview(review.id);
        const agentResults = await getAgentResultsByReview(review.id);
        const completedAgents = agentResults.filter(
          (r) => r.status === "complete"
        ).length;

        return {
          id: review.id,
          title: review.title,
          documentType: review.document_type as DocumentType,
          status: review.status as ReviewSummary["status"],
          documentCount: documents.length,
          agentsComplete: completedAgents,
          agentsTotal: 3,
          createdAt: review.created_at,
        };
      })
    );

    return Response.json(summaries, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch reviews";
    return Response.json({ error: message }, { status: 500 });
  }
}
