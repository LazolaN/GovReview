import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReport } from "@/lib/reports/docx-builder";
import { isSupabaseConfigured, createServerClient } from "@/lib/supabase";
import type { MaturityScore } from "@/types/agent";

const AgentResultSchema = z.object({
  agentId: z.string(),
  resultText: z.string(),
  maturityScores: z
    .array(
      z.object({
        dimension: z.string(),
        score: z.number(),
        maxScore: z.number(),
        commentary: z.string(),
      })
    )
    .optional(),
});

const ExportRequestSchema = z.object({
  reviewId: z.string().min(1, "reviewId is required"),
  format: z.enum(["docx", "pdf"]),
  title: z.string().optional(),
  clientName: z.string().optional(),
  sections: z.array(z.string()).optional(),
  agentResults: z.array(AgentResultSchema).optional(),
});

type ValidatedAgentResult = {
  agentId: string;
  resultText: string;
  maturityScores?: MaturityScore[];
};

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = ExportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { reviewId, format, title, clientName, sections, agentResults } =
      parsed.data;

    // PDF not yet supported
    if (format === "pdf") {
      return NextResponse.json(
        { error: "PDF export coming soon" },
        { status: 501 }
      );
    }

    // Resolve agent results: prefer Supabase, fall back to request body
    let resolvedResults: ValidatedAgentResult[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        const { data, error } = await supabase
          .from("agent_results")
          .select("agent_id, result_text, maturity_scores")
          .eq("review_id", reviewId)
          .eq("status", "complete");

        if (error) {
          throw new Error(error.message);
        }

        // Cast through unknown to bridge Supabase generic types
        const rows = data as unknown as Array<{
          agent_id: string;
          result_text: string | null;
          maturity_scores: MaturityScore[] | null;
        }>;

        if (rows && rows.length > 0) {
          resolvedResults = rows.map((row) => ({
            agentId: row.agent_id,
            resultText: row.result_text || "",
            maturityScores: row.maturity_scores || undefined,
          }));
        }
      } catch {
        // Supabase fetch failed; fall through to request body
      }
    }

    // Fall back to request body if no DB results
    if (resolvedResults.length === 0 && agentResults) {
      resolvedResults = agentResults;
    }

    if (resolvedResults.length === 0) {
      return NextResponse.json(
        {
          error:
            "No agent results found. Run the governance review agents first, or provide agentResults in the request body.",
        },
        { status: 404 }
      );
    }

    // Generate DOCX
    const buffer = await generateReport(resolvedResults, {
      title,
      clientName,
      sections,
    });

    const filename = `governance-review-${reviewId}.docx`;

    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
