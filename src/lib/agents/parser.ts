import type { MaturityScore, RiskItem } from "@/types/agent";

/**
 * Extracts maturity scores from the Lead Consultant's markdown output.
 * Looks for a table with Dimension | Score | Evidence pattern.
 */
export function parseMaturityScores(markdown: string): MaturityScore[] {
  const scores: MaturityScore[] = [];
  const tableRegex =
    /\|\s*([^|]+?)\s*\|\s*(\d)\s*\/\s*5\s*\|\s*([^|]+?)\s*\|/g;

  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(markdown)) !== null) {
    const dimension = match[1].trim();
    // Skip header rows and separator rows
    if (
      dimension.toLowerCase() === "dimension" ||
      dimension.startsWith("---") ||
      /^-+$/.test(dimension)
    ) {
      continue;
    }

    const rawScore = parseInt(match[2], 10);
    // Clamp scores to valid 1-5 range
    const score = Math.max(1, Math.min(5, rawScore));

    scores.push({
      dimension,
      score,
      maxScore: 5,
      commentary: match[3].trim(),
    });
  }

  return scores;
}

/**
 * Extracts risk items from the Data & AI Analyst's Risk Register table.
 * Looks for numbered rows with risk details.
 */
export function parseRiskRegister(markdown: string): RiskItem[] {
  const risks: RiskItem[] = [];
  const riskSection = extractSection(markdown, "Risk Register");
  if (!riskSection) return risks;

  const rowRegex =
    /\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(High|Medium|Low|Critical)\s*\|\s*(High|Medium|Low|Critical)\s*\|\s*(Critical|High|Medium|Low)\s*\|\s*(IT|Data|AI)\s*\|\s*([^|]+?)\s*\|/gi;

  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(riskSection)) !== null) {
    risks.push({
      id: `risk-${match[1]}`,
      title: match[2].trim(),
      description: match[3].trim(),
      likelihood: match[4].toLowerCase() as RiskItem["likelihood"],
      impact: match[5].toLowerCase() as RiskItem["impact"],
      domain: mapDomain(match[7].trim()),
      mitigation: match[8].trim(),
    });
  }

  return risks;
}

function mapDomain(
  raw: string
): "it_governance" | "data_governance" | "ai_governance" {
  const lower = raw.toLowerCase();
  if (lower === "ai") return "ai_governance";
  if (lower === "data") return "data_governance";
  return "it_governance";
}

/**
 * Extracts a markdown section by heading name.
 * Uses line-by-line parsing to avoid regex multiline $ issues.
 */
export function extractSection(
  markdown: string,
  headingName: string
): string | null {
  const lines = markdown.split("\n");
  const headingRegex = /^#{1,4}\s+/;
  const targetRegex = new RegExp(headingName, "i");
  let capturing = false;
  const content: string[] = [];

  for (const line of lines) {
    if (headingRegex.test(line)) {
      if (capturing) break;
      if (targetRegex.test(line)) {
        capturing = true;
        continue;
      }
    } else if (capturing) {
      content.push(line);
    }
  }

  const result = content.join("\n").trim();
  return result || null;
}

/**
 * Extracts all structured data from an agent's markdown output.
 */
export function parseAgentOutput(agentId: string, markdown: string) {
  return {
    maturityScores:
      agentId === "lead_consultant" ? parseMaturityScores(markdown) : [],
    risks: agentId === "data_ai_analyst" ? parseRiskRegister(markdown) : [],
  };
}
