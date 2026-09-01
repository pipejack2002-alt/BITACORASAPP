import fs from "fs";
import { execSync } from "child_process";

const out = execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('C:/Users/andre/OneDrive/Escritorio/UNIVERSIDAD/8 SEMESTRE/AUDITORIA DE SISTEMA/Bitacora_EAAB_2026-08-31.docx'); foreach ($e in $zip.Entries) { if ($e.FullName -like 'word/media/*') { Write-Output ($e.FullName + ' - ' + $e.Length + ' bytes') } } $zip.Dispose()"`, { encoding: 'utf8' });
console.log(out);
