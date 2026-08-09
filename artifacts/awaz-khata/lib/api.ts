import { Platform } from 'react-native';
import { API_BASE_URL } from './config';

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

/**
 * Upload a recorded audio file and return the Urdu transcript.
 *
 * @param uri      Local file URI returned by the Expo audio recorder.
 * @param language App language code (ur/hi/pa/skr/en). The backend maps this
 *                 to the correct Uplift STT language code. Defaults to "ur".
 */
export async function transcribeRecording(uri: string, language = 'ur'): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const ext = blob.type.includes('mp4') || blob.type.includes('m4a') ? 'm4a' : 'webm';
    formData.append(
      'audio',
      new File([blob], `recording.${ext}`, { type: blob.type || 'audio/webm' }),
    );
  } else {
    // React Native FormData file object — the runtime generates the multipart
    // boundary; do NOT set Content-Type manually on the fetch call.
    const name = uri.split('/').pop() ?? 'recording.m4a';
    formData.append('audio', {
      uri,
      name: name.includes('.') ? name : 'recording.m4a',
      type: 'audio/m4a',
    } as unknown as Blob);
  }

  // Pass the selected language so the backend uses the right STT language code.
  formData.append('language', language);

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
