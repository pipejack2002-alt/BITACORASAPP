import { createServer } from 'vite';
import { writeFileSync } from 'fs';

const SCRATCH = 'C:/Users/andre/.gemini/antigravity-ide/brain/f599b9ed-c0a9-47b7-8e61-cb88b92e1b30/scratch';

async function testAppExport() {
  console.log('Starting Vite server for SSR test...');
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    console.log('Loading export-docx and seed modules through Vite...');
    const { buildDocx, wordFilename } = await server.ssrLoadModule('/src/lib/export-docx.ts');
    const { createInitialState } = await server.ssrLoadModule('/src/lib/seed.ts');

    console.log('Creating initial state (as in browser app)...');
    const state = createInitialState();

    console.log('Calling buildDocx(state)...');
    const blob = await buildDocx(state);
    console.log('✓ Blob generated! Size:', blob.size, 'bytes, type:', blob.type);

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const testFile = `${SCRATCH}/app-download-test.docx`;
    writeFileSync(testFile, buffer);
    console.log('✓ Saved docx to:', testFile);

    // Verify PNG entry
    let pngCount = 0;
    for (let i = 0; i < buffer.length - 4; i++) {
      if (buffer[i] === 0x50 && buffer[i+1] === 0x4B && buffer[i+2] === 0x03 && buffer[i+3] === 0x04) {
        const nameLen = buffer.readUInt16LE(i + 26);
        const name = buffer.slice(i + 30, i + 30 + nameLen).toString('utf-8');
        if (name.endsWith('.png')) {
          pngCount++;
          console.log('✓ Embedded PNG found in ZIP:', name);
        }
      }
    }
    console.log('Total PNGs in app-generated docx:', pngCount);

    // Extract text with mammoth
    const mammoth = await import('mammoth');
    const textRes = await mammoth.default.extractRawText({ buffer });
    const text = textRes.value;
    console.log('\n--- Mammoth Extracted Text Verification ---');
    console.log('Total characters:', text.length);
    console.log('Total words:', text.split(/\s+/).length);
    console.log('\n--- First 600 characters ---');
    console.log(text.slice(0, 600));

    // Check key elements
    console.log('\n--- Content Checks ---');
    console.log('Contains BERNAL OSORIO ANDRES:', text.includes('BERNAL OSORIO ANDRES'));
    console.log('Contains VIZCAINO ESCAMILLA MARIA:', text.includes('VIZCAINO ESCAMILLA MARIA'));
    console.log('Contains MERCADO EGUIS SHADIA:', text.includes('MERCADO EGUIS SHADIA'));
    console.log('Contains RUIZ BOTERO WILMER:', text.includes('RUIZ BOTERO WILMER'));
    console.log('Contains ZCPVIIIA AUDITORIA DE SISTEMA:', text.includes('ZCPVIIIA AUDITORIA DE SISTEMA'));
    console.log('Contains Corporación Universitaria Latinoamericana:', text.includes('Corporación Universitaria Latinoamericana'));
    console.log('Contains 1. Ficha de Identificación Institucional:', text.includes('1. Ficha de Identificación Institucional'));
    console.log('Contains 2. La empresa:', text.includes('2. La empresa'));
    console.log('Contains Referencias y Fuentes Oficiales:', text.includes('Referencias y Fuentes Oficiales'));
    console.log('Has PNG image in docx:', pngCount > 0);
  } finally {
    await server.close();
  }
}

testAppExport().catch(console.error);
