import type { FileType } from "@/types/document";

/**
 * Extracts text content from uploaded files.
 * Runs server-side in API routes only.
 */
export async function extractText(
  buffer: Buffer,
  fileType: FileType
): Promise<string> {
  switch (fileType) {
    case "pdf":
      return extractPdf(buffer);
    case "docx":
      return extractDocx(buffer);
    case "txt":
    case "md":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.text;
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Determines file type from filename extension.
 */
export function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "txt":
      return "txt";
    case "md":
      return "md";
    default:
      throw new Error(`Unsupported file extension: .${ext}`);
  }
}

/**
 * Validates file size and type before processing.
 */
export function validateFile(
  filename: string,
  size: number
): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (size > maxSize) {
    return { valid: false, error: "File size exceeds 20MB limit" };
  }

  try {
    getFileType(filename);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Unsupported file type. Accepted: .pdf, .docx, .txt, .md",
    };
  }
}
