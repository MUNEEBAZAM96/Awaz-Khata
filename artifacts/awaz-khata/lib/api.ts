import { Platform } from 'react-native';

/**
 * Frontend API service.
 * JSON endpoints go through the generated client in `@workspace/api-client-react`
 * (extractIntent, createTransaction, runQuery, listTransactions, getPersonLedger,
 * speakText) — configured once via setBaseUrl in app/_layout.tsx.
 *
 * Only the multipart audio upload needs a hand-rolled request, because React
 * Native's FormData file shape ({ uri, name, type }) differs from the web Blob
 * the generated client expects.
 */

const API_BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export async function transcribeRecording(uri: string): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const ext = blob.type.includes('mp4') || blob.type.includes('m4a') ? 'm4a' : 'webm';
    formData.append(
      'audio',
      new File([blob], `recording.${ext}`, { type: blob.type || 'audio/webm' }),
    );
  } else {
    const name = uri.split('/').pop() ?? 'recording.m4a';
    formData.append('audio', {
      uri,
      name: name.includes('.') ? name : 'recording.m4a',
      type: 'audio/m4a',
    } as unknown as Blob);
  }

  const res = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
    method: 'POST',
    body: formData,
  });
  const json = (await res.json().catch(() => null)) as
    | { text?: string; error?: string }
    | null;
  if (!res.ok || !json?.text) {
    throw new Error(json?.error ?? 'آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔');
  }
  return json.text;
}
