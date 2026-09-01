import fs from "fs";
import { Document, Packer, Paragraph, ImageRun } from "docx";
import { execSync } from "child_process";

const imgBuffer = fs.readFileSync("./public/university-logo.png");
const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: {
              width: 145,
              height: 150,
            },
            type: "png",
          }),
        ],
      }),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync("./temp_test_type.docx", buf);
const out = execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('./temp_test_type.docx'); foreach ($e in $zip.Entries) { if ($e.FullName -like 'word/media/*') { Write-Output ($e.FullName + ' - ' + $e.Length + ' bytes') } } $zip.Dispose()"`, { encoding: 'utf8' });
console.log(out);
fs.unlinkSync("./temp_test_type.docx");
