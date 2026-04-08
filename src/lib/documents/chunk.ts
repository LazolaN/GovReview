const DEFAULT_CHUNK_SIZE = 60000; // ~60k chars per chunk
const OVERLAP = 2000; // 2k char overlap between chunks

/**
 * Splits text into overlapping chunks for large documents.
 * Only chunks if text exceeds the threshold (80k chars).
 */
export function chunkDocument(
  text: string,
  maxChunkSize: number = DEFAULT_CHUNK_SIZE
): string[] {
  if (text.length <= 80000) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;

    // Try to break at a paragraph or sentence boundary
    if (end < text.length) {
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      if (paragraphBreak > start + maxChunkSize * 0.7) {
        end = paragraphBreak;
      } else {
        const sentenceBreak = text.lastIndexOf(". ", end);
        if (sentenceBreak > start + maxChunkSize * 0.7) {
          end = sentenceBreak + 1;
        }
      }
    }

    chunks.push(text.slice(start, end));
    start = end - OVERLAP;
  }

  return chunks;
}

/**
 * Creates a document summary prefix for chunked processing.
 */
export function createChunkPrefix(
  chunkIndex: number,
  totalChunks: number
): string {
  return `[Document Chunk ${chunkIndex + 1} of ${totalChunks}]\n\n`;
}
