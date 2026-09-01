import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const dir = "C:\\Users\\andre\\OneDrive\\Escritorio\\UNIVERSIDAD\\8 SEMESTRE\\AUDITORIA DE SISTEMA";
const file = path.join(dir, "Bitacora_EAAB_2026-08-24.docx");

// Extract entries to a temporary inspection folder
const extractDir = path.resolve("./extracted_word");
if (fs.existsSync(extractDir)) {
  fs.rmSync(extractDir, { recursive: true, force: true });
}
fs.mkdirSync(extractDir, { recursive: true });

execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${file.replace(/\\/g, "\\\\")}', '${extractDir.replace(/\\/g, "\\\\")}')"`);

console.log("Successfully extracted docx!");

function listAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(listAllFiles(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = listAllFiles(extractDir);
for (const f of files) {
  const rel = path.relative(extractDir, f);
  console.log(rel, "-", fs.statSync(f).size, "bytes");
}
