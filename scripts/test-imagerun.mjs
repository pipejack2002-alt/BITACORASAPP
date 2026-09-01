// Test ImageRun API in docx 9.7.1 - run from BITACORA directory
import { ImageRun, Packer, Paragraph, Document, AlignmentType } from 'docx';
import { readFileSync, writeFileSync } from 'fs';

const SCRATCH = 'C:/Users/andre/.gemini/antigravity-ide/brain/f599b9ed-c0a9-47b7-8e61-cb88b92e1b30/scratch';

const logoBuffer = readFileSync('./public/university-logo.png');
console.log('Logo size:', logoBuffer.length, 'bytes');

// Test 1: with Buffer (Uint8Array subclass)
try {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: logoBuffer,
              transformation: { width: 145, height: 150 },
              type: "png",
            })
          ]
        }),
        new Paragraph({ children: [] }),
        new Paragraph({ children: [{ text: 'TEST: Logo arriba' }] })
      ]
    }]
  });
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(`${SCRATCH}/test-logo-buffer.docx`, buffer);
  console.log('✓ Test 1 (Buffer/Uint8Array) SUCCESS! Size:', buffer.length, 'bytes');
} catch (e) {
  console.error('✗ Test 1 FAILED:', e.message);
}

// Test 2: with base64 string
try {
  const base64 = logoBuffer.toString('base64');
  console.log('Base64 length:', base64.length);
  const doc2 = new Document({
    sections: [{
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: base64,
              transformation: { width: 145, height: 150 },
              type: "png",
            })
          ]
        })
      ]
    }]
  });
  const buf2 = await Packer.toBuffer(doc2);
  writeFileSync(`${SCRATCH}/test-logo-base64.docx`, buf2);
  console.log('✓ Test 2 (base64 string) SUCCESS! Size:', buf2.length, 'bytes');
} catch (e) {
  console.error('✗ Test 2 FAILED:', e.message);
}

// Check docx 9 API for ImageRun constructor
const src = readFileSync('./node_modules/docx/dist/index.umd.cjs', 'utf-8');
const idx = src.indexOf('class ImageRun');
const constructorIdx = src.indexOf('constructor', idx);
console.log('\n--- ImageRun constructor (docx 9 source) ---');
console.log(src.slice(constructorIdx, constructorIdx + 400));
