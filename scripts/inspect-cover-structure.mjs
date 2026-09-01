import fs from "fs";

const docXml = fs.readFileSync("./extracted_word/word/document.xml", "utf8");
const paragraphs = docXml.split("<w:p ");

console.log("Total paragraphs:", paragraphs.length);
for (let i = 1; i < Math.min(50, paragraphs.length); i++) {
  const p = "<w:p " + paragraphs[i];
  const textMatches = p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
  const text = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
  const hasDrawing = p.includes("<w:drawing");
  const hasPageBreak = p.includes('w:type="page"') || p.includes("<w:br w:type=\"page\"") || p.includes("<w:pageBreakBefore");
  const isCenter = p.includes('w:jc w:val="center"');
  const isBold = p.includes('<w:b/>') || p.includes('<w:b ');
  
  console.log(`[P${i}] ${hasPageBreak ? '>>> PAGE BREAK <<< ' : ''}${hasDrawing ? '[LOGO IMAGE] ' : ''}${isCenter ? '(CENTER) ' : ''}${isBold ? '(BOLD) ' : ''}"${text}"`);
}
