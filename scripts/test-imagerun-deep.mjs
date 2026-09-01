// Deep test of ImageRun in docx 9.7.1
import { ImageRun, Packer, Paragraph, Document, AlignmentType } from 'docx';
import { readFileSync, writeFileSync } from 'fs';

const SCRATCH = 'C:/Users/andre/.gemini/antigravity-ide/brain/f599b9ed-c0a9-47b7-8e61-cb88b92e1b30/scratch';

const logoBuffer = readFileSync('./public/university-logo.png');
console.log('Logo Buffer size:', logoBuffer.length);
console.log('Is Buffer:', Buffer.isBuffer(logoBuffer));
console.log('PNG magic:', logoBuffer[0].toString(16), logoBuffer[1].toString(16), logoBuffer[2].toString(16), logoBuffer[3].toString(16));

// docx 9 uses a different ImageRun API - let's check what happens when we create one
const ir = new ImageRun({
  data: logoBuffer,
  transformation: { width: 145, height: 150 },
  type: "png",
});
console.log('\nImageRun created:', typeof ir);
console.log('ImageRun keys:', Object.keys(ir));

// Check for the 'data' property on the run
if (ir.options) console.log('ir.options:', Object.keys(ir.options));
if (ir.data) console.log('ir.data length:', ir.data.length);

// Try serializing just the ImageRun
const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [ir]
      })
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
const outPath = `${SCRATCH}/test-deep.docx`;
writeFileSync(outPath, buffer);
console.log('\nGenerated size:', buffer.length, 'bytes');

// Inspect ZIP contents
// A docx is a ZIP, let's check the entries
const buf = readFileSync(outPath);
// Find ZIP local file headers (PK\x03\x04)
const entries = [];
for (let i = 0; i < buf.length - 4; i++) {
  if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
    // Read file name length and extra length
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const name = buf.slice(i + 30, i + 30 + nameLen).toString('utf-8');
    entries.push({ name, offset: i });
  }
}
console.log('\nZIP entries in generated docx:');
entries.forEach(e => console.log(' -', e.name));
