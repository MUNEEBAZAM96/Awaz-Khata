import { readFileSync } from 'node:fs';
import { UpliftAI } from '@upliftai/sdk-js';

const client = new UpliftAI({ apiKey: process.env.UPLIFTAI_API_KEY });
const path = process.argv[2];
const fileName = process.argv[3];
const buf = readFileSync(path);
console.log('[probe] bytes', buf.length, 'fileName', fileName);
try {
  const t0 = Date.now();
  const res = await client.stt.transcribe({
    file: buf,
    fileName,
    model: 'scribe',
    language: 'ur',
  });
  console.log('[probe] OK in', Date.now() - t0, 'ms');
  console.log('[probe] transcript:', JSON.stringify(res.transcript));
} catch (err) {
  console.log('[probe] FAILED', err?.constructor?.name);
  console.log('  message:', err?.message);
  console.log('  statusCode:', err?.statusCode, 'code:', err?.code, 'requestId:', err?.requestId);
}
