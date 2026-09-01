import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const dir = "C:\\Users\\andre\\OneDrive\\Escritorio\\UNIVERSIDAD\\8 SEMESTRE\\AUDITORIA DE SISTEMA";
const file2 = path.join(dir, "AuditoriabConceptualizacion.docx");

const extractDir2 = path.resolve("./extracted_word_concept");
if (fs.existsSync(extractDir2)) {
  fs.rmSync(extractDir2, { recursive: true, force: true });
}
fs.mkdirSync(extractDir2, { recursive: true });

execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${file2.replace(/\\/g, "\\\\")}', '${extractDir2.replace(/\\/g, "\\\\")}')"`);

const docXml = fs.readFileSync(path.join(extractDir2, "word", "document.xml"), "utf8");
const paragraphs = docXml.split("<w:p ");

console.log("=== AUDITORIABCONCEPTUALIZACION.DOCX FIRST 20 PARAGRAPHS ===");
for (let i = 1; i < Math.min(25, paragraphs.length); i++) {
  const p = "<w:p " + paragraphs[i];
  const textMatches = p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
  const text = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
  const hasDrawing = p.includes("<w:drawing");
  console.log(`[P${i}] ${hasDrawing ? '[IMAGE] ' : ''}"${text}"`);
}
