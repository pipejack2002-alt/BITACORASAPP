import fs from "fs";

const docXml = fs.readFileSync("./extracted_word/word/document.xml", "utf8");

const idx = docXml.indexOf("rId7");
console.log("Index of rId7:", idx);
if (idx !== -1) {
  const start = Math.max(0, idx - 500);
  const end = Math.min(docXml.length, idx + 1000);
  console.log("=== XML SNIPPET AROUND rId7 ===");
  console.log(docXml.substring(start, end));
}

// Let's also parse paragraphs in the first page or full document
import { DOMParser } from "@xmldom/xmldom";
// Let's print the first 15 paragraphs text with their styles / attributes
const paragraphs = docXml.split("<w:p ");
console.log("\n=== FIRST 15 PARAGRAPHS ===");
for (let i = 1; i < Math.min(16, paragraphs.length); i++) {
  const p = "<w:p " + paragraphs[i];
  const textMatches = p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
  const text = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
  const hasDrawing = p.includes("<w:drawing") || p.includes("rId7");
  console.log(`P[${i}]: ${hasDrawing ? '[CONTAINS DRAWING/IMAGE] ' : ''}${text}`);
}
