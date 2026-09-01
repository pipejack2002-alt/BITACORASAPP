import { buildDocx, wordFilename } from '../src/lib/export-docx.ts';
import { createInitialState } from '../src/lib/seed.ts';
import { writeFileSync } from 'fs';

const SCRATCH = 'C:/Users/andre/.gemini/antigravity-ide/brain/f599b9ed-c0a9-47b7-8e61-cb88b92e1b30/scratch';

async function test() {
  console.log('Testing buildDocx(createInitialState())...');
  const state = createInitialState();
  const blob = await buildDocx(state);
  console.log('Blob generated successfully! Size:', blob.size, 'bytes, type:', blob.type);
  
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const testFile = `${SCRATCH}/test-exported-from-buildDocx.docx`;
  writeFileSync(testFile, buffer);
  console.log('Saved to:', testFile);
  
  // Verify PNG inside the docx ZIP
  let pngEntries = 0;
  for (let i = 0; i < buffer.length - 4; i++) {
    if (buffer[i] === 0x50 && buffer[i+1] === 0x4B && buffer[i+2] === 0x03 && buffer[i+3] === 0x04) {
      const nameLen = buffer.readUInt16LE(i + 26);
      const name = buffer.slice(i + 30, i + 30 + nameLen).toString('utf-8');
      if (name.endsWith('.png')) {
        pngEntries++;
        console.log('Found image in ZIP:', name);
      }
    }
  }
  console.log('Total PNG entries in buildDocx output:', pngEntries);
  
  // Extract with mammoth to verify text content and structure
  const mammoth = await import('mammoth');
  const result = await mammoth.default.extractRawText({ buffer });
  console.log('\n--- First 400 chars of extracted text ---');
  console.log(result.value.slice(0, 400));
}

test().catch(console.error);
