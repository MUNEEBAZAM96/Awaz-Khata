import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

let stopActive: (() => void) | null = null;

/** Stop whatever TTS audio is currently playing (no-op when idle). */
export function stopPlayback(): void {
  const stop = stopActive;
  stopActive = null;
  stop?.();
}

/**
 * Play base64 MP3 audio returned by /api/voice/speak.
 * Resolves when playback finishes (or is stopped by a newer playback).
 */
export async function playBase64Audio(audioBase64: string): Promise<void> {
  // Never let two voices overlap.
  stopPlayback();

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
      if (stopActive === finish) stopActive = null;
      try {
        player.remove();
      } catch {
        // already released
      }
      resolve();
    };
    stopActive = finish;
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) finish();
    });
    // Safety net in case didJustFinish never fires (e.g. web quirks)
    setTimeout(finish, 60000);
    player.play();
  });
}
