import type { AttachmentKind } from "./types";

const MAX_PAGES = 40;
const MAX_CHARS = 80_000;

export function kindFromFile(file: File): AttachmentKind {
  const n = file.name.toLowerCase();
  if (file.type.includes("pdf") || n.endsWith(".pdf")) return "pdf";
  if (
    n.endsWith(".docx") ||
    n.endsWith(".doc") ||
    file.type.includes("word") ||
    file.type.includes("officedocument.wordprocessingml")
  ) {
    return "word";
  }
  if (file.type.startsWith("text/") || n.endsWith(".txt")) return "texto";
  return "otro";
}

export async function extractTextFromFile(file: File): Promise<string> {
  const kind = kindFromFile(file);
  try {
    if (kind === "pdf") return await extractPdf(file);
    if (kind === "word") {
      if (file.name.toLowerCase().endsWith(".doc") && !file.name.toLowerCase().endsWith(".docx")) {
        return "";
      }
      return await extractDocx(file);
    }
    if (kind === "texto") return (await file.text()).slice(0, MAX_CHARS);
  } catch (err) {
    console.error("extract-text", err);
    return "";
  }
  return "";
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result.value || "").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHARS);
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  const pages = Math.min(pdf.numPages, MAX_PAGES);
  const chunks: string[] = [];
  let total = 0;
  for (let i = 1; i <= pages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) {
      chunks.push(text);
      total += text.length;
    }
    if (total >= MAX_CHARS) break;
  }
  return chunks.join("\n\n").slice(0, MAX_CHARS);
}
