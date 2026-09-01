import fs from "fs";
import path from "path";

// Copy image1.png to public or an accessible location
const srcImg = path.resolve("./extracted_word/word/media/image1.png");
const destImg = path.resolve("./public/university-logo.png");
if (fs.existsSync(srcImg)) {
  fs.copyFileSync(srcImg, destImg);
  console.log("Copied university logo to public/university-logo.png, size:", fs.statSync(destImg).size);
}

// Read document.xml and see the first paragraphs and where image1 is referenced
const docXml = fs.readFileSync("./extracted_word/word/document.xml", "utf8");
console.log("=== FIRST 4000 CHARACTERS OF DOCUMENT.XML ===");
console.log(docXml.slice(0, 4000));

// Also let's inspect document.xml.rels to see what image1 is linked to
const relsXml = fs.readFileSync("./extracted_word/word/_rels/document.xml.rels", "utf8");
console.log("=== DOCUMENT.XML.RELS ===");
console.log(relsXml);
