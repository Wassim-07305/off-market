export async function extractText(
  buffer: Buffer,
  fileType: string,
): Promise<string> {
  if (fileType === "application/pdf" || fileType.includes("pdf")) {
    const pdf = await import("pdf-parse");
    const data = await pdf.default(buffer);
    return data.text;
  }
  // For text files, just decode
  return buffer.toString("utf-8");
}

export function chunkText(
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 200,
): string[] {
  const chunks: string[] = [];
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (
      currentChunk.length + trimmed.length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      // Keep overlap from end of previous chunk
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(" ") + "\n\n" + trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If no chunks were created (single block of text), chunk by character count
  if (chunks.length === 0 && text.trim().length > 0) {
    const words = text.trim().split(/\s+/);
    let chunk = "";
    for (const word of words) {
      if (chunk.length + word.length > maxChunkSize && chunk.length > 0) {
        chunks.push(chunk.trim());
        chunk = word;
      } else {
        chunk += (chunk ? " " : "") + word;
      }
    }
    if (chunk.trim()) chunks.push(chunk.trim());
  }

  return chunks;
}
