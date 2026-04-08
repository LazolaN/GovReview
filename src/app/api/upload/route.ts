import { NextRequest } from "next/server";
import { extractText, getFileType, validateFile } from "@/lib/documents/extract";
import { classifyDocument } from "@/lib/documents/classify";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file.name, file.size);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Extract text
    const fileType = getFileType(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedText = await extractText(buffer, fileType);

    if (!extractedText.trim()) {
      return Response.json(
        { error: "Could not extract text from file. The file may be empty or scanned (OCR not yet supported)." },
        { status: 422 }
      );
    }

    // Auto-classify document type
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let documentType = "other";
    if (apiKey) {
      documentType = await classifyDocument(extractedText, apiKey);
    }

    // In Phase 1, we store in-memory. Phase 2 will persist to Supabase.
    const reviewId = request.headers.get("x-review-id") || crypto.randomUUID();

    const document = {
      id: crypto.randomUUID(),
      reviewId,
      filename: file.name,
      filePath: `memory://${file.name}`, // Phase 2: Supabase storage path
      fileSize: file.size,
      fileType,
      extractedText,
      charCount: extractedText.length,
      documentType,
      createdAt: new Date().toISOString(),
    };

    return Response.json(document, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process upload";
    return Response.json({ error: message }, { status: 500 });
  }
}
