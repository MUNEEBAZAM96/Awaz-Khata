import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

/**
 * Upload a finished recording to the backend for Urdu transcription.
 * Handles the React Native FormData file shape on native, and real Blobs on web.
 */
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

  const res = await fetch(`${BASE}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });
  const json = (await res.json().catch(() => null)) as
    | { text?: string; error?: string }
    | null;
  if (!res.ok || !json?.text) {
    throw new Error(json?.error ?? 'آواز سمجھ نہیں آئی، دوبارہ کوشش کریں');
  }
  return json.text;
}

/**
 * Play base64 MP3 audio returned by the /speak endpoint.
 * Resolves when playback finishes.
 */
export async function playBase64Audio(audioBase64: string): Promise<void> {
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

  let sourceUri: string;
  if (Platform.OS === 'web') {
    sourceUri = `data:audio/mpeg;base64,${audioBase64}`;
  } else {
    const path = `${FileSystem.cacheDirectory}awaz-tts-${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(path, audioBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    sourceUri = path;
  }

  await new Promise<void>((resolve) => {
    const player = createAudioPlayer({ uri: sourceUri });
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        player.remove();
      } catch {
        // already released
      }
      resolve();
    };
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) finish();
    });
    // Safety net in case didJustFinish never fires (e.g. web quirks)
    setTimeout(finish, 60000);
    player.play();
  });
}
