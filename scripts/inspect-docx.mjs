// Extract and inspect key XML files from the generated docx
import { readFileSync, writeFileSync } from 'fs';
import { createGunzip } from 'zlib';

const SCRATCH = 'C:/Users/andre/.gemini/antigravity-ide/brain/f599b9ed-c0a9-47b7-8e61-cb88b92e1b30/scratch';

function extractZipEntry(buf, entryName) {
  for (let i = 0; i < buf.length - 4; i++) {
    if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
      const compression = buf.readUInt16LE(i + 8);
      const compressedSize = buf.readUInt32LE(i + 18);
      const nameLen = buf.readUInt16LE(i + 26);
      const extraLen = buf.readUInt16LE(i + 28);
      const name = buf.slice(i + 30, i + 30 + nameLen).toString('utf-8');
      
      if (name === entryName) {
        const dataStart = i + 30 + nameLen + extraLen;
        const compressedData = buf.slice(dataStart, dataStart + compressedSize);
        if (compression === 0) {
          return compressedData.toString('utf-8');
        }
        // compression=8 means deflate - we need to inflate
        return { compressed: true, data: compressedData, size: compressedSize };
      }
    }
  }
  return null;
}

const docxPath = `${SCRATCH}/test-deep.docx`;
const buf = readFileSync(docxPath);

// Check Content_Types.xml
const ct = extractZipEntry(buf, '[Content_Types].xml');
console.log('=== [Content_Types].xml ===');
if (typeof ct === 'string') {
  console.log(ct);
} else if (ct?.compressed) {
  console.log('(compressed, size:', ct.size, ') - need zlib to decompress');
}

// Check document.xml.rels
const rels = extractZipEntry(buf, 'word/_rels/document.xml.rels');
console.log('\n=== word/_rels/document.xml.rels ===');
if (typeof rels === 'string') {
  console.log(rels);
} else if (rels?.compressed) {
  console.log('(compressed, size:', rels.size, ')');
}

// Check size of the PNG entry
for (let i = 0; i < buf.length - 4; i++) {
  if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
    const compressedSize = buf.readUInt32LE(i + 18);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const name = buf.slice(i + 30, i + 30 + nameLen).toString('utf-8');
    if (name.endsWith('.png')) {
      console.log('\n=== PNG entry ===');
      console.log('Name:', name);
      console.log('Compressed size:', compressedSize, 'bytes');
      const dataStart = i + 30 + nameLen + extraLen;
      const firstBytes = buf.slice(dataStart, dataStart + 8);
      console.log('First bytes (hex):', Array.from(firstBytes).map(x => x.toString(16).padStart(2,'0')).join(' '));
    }
  }
}
