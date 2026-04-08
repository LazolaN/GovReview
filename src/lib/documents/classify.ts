import type { DocumentType } from "@/types/document";

/**
 * Auto-classifies a document type using Claude Haiku.
 * Takes the first 2000 chars of the document for classification.
 */
export async function classifyDocument(
  text: string,
  apiKey: string
): Promise<DocumentType> {
  const excerpt = text.slice(0, 2000);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: `Classify this document as exactly one of these types: ai_policy, ai_governance, data_policy, data_framework, it_governance, other

Respond with only the classification label, nothing else.

Document excerpt:
${excerpt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return "other";
  }

  const result = await response.json();
  const classification = result.content?.[0]?.text?.trim().toLowerCase();

  const validTypes: DocumentType[] = [
    "ai_policy",
    "ai_governance",
    "data_policy",
    "data_framework",
    "it_governance",
    "other",
  ];

  if (validTypes.includes(classification as DocumentType)) {
    return classification as DocumentType;
  }

  return "other";
}
