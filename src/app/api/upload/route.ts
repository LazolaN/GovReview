import { NextRequest } from "next/server";
import { extractText, getFileType, validateFile } from "@/lib/documents/extract";
import { classifyDocument } from "@/lib/documents/classify";
import { isSupabaseConfigured, createServerClient } from "@/lib/supabase";
import { createReview, createDocument } from "@/lib/db";

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

    const reviewId = request.headers.get("x-review-id") || crypto.randomUUID();
    const docId = crypto.randomUUID();
    const userId = "placeholder-user"; // Until auth is wired
    let filePath = `memory://${file.name}`;

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      // Upload file to Supabase Storage
      const supabase = createServerClient();
      const storagePath = `${reviewId}/${docId}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (storageError) {
        console.error("Storage upload failed:", storageError.message);
        // Continue with memory path; the review still works without storage
      } else {
        filePath = storagePath;
      }

      // Create review record (upsert-like: only if this is the first doc for this review)
      const existingHeader = request.headers.get("x-review-id");
      if (!existingHeader) {
        await createReview({
          id: reviewId,
          user_id: userId,
          title: file.name.replace(/\.[^.]+$/, ""),
          document_type: documentType,
          status: "uploaded",
        });
      }

      // Create document record
      await createDocument({
        id: docId,
        review_id: reviewId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: fileType,
        extracted_text: extractedText,
        char_count: extractedText.length,
        document_type: documentType,
      });
    } else {
      // In-memory fallback: still create records via db layer
      const existingHeader = request.headers.get("x-review-id");
      if (!existingHeader) {
        await createReview({
          id: reviewId,
          user_id: userId,
          title: file.name.replace(/\.[^.]+$/, ""),
          document_type: documentType,
          status: "uploaded",
        });
      }

      await createDocument({
        id: docId,
        review_id: reviewId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: fileType,
        extracted_text: extractedText,
        char_count: extractedText.length,
        document_type: documentType,
      });
    }

    const document = {
      id: docId,
      reviewId,
      filename: file.name,
      filePath,
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
