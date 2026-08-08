import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { transcribeRecording } from '@/lib/api';

export type VoiceInputState = 'idle' | 'recording' | 'transcribing';

const TRANSCRIBE_FALLBACK = 'آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔';

/**
 * Small "mic → transcript" helper for the chat screen: tap to record,
 * tap again to stop; the Urdu transcript is handed to `onTranscript`.
 * (The home screen's full assistant pipeline lives in useVoiceAssistant.)
 */
export function useVoiceInput(onTranscript: (text: string) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [state, setState] = useState<VoiceInputState>('idle');
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const stateRef = useRef<VoiceInputState>('idle');
  stateRef.current = state;

  /**
   * Abandon an in-progress recording without transcribing (used when the
   * user leaves the screen so the mic is never left running). Stable
   * identity — safe as a useFocusEffect dependency.
   */
  const cancel = useCallback(async () => {
    if (stateRef.current !== 'recording') return;
    try {
      await recorder.stop();
    } catch {
      // recorder already stopped
    }
    setState('idle');
  }, [recorder]);

  const toggle = useCallback(async () => {
    if (busyRef.current) return;

    if (state === 'idle') {
      busyRef.current = true;
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          setError('مائیکروفون کی اجازت درکار ہے۔');
          return;
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setError(null);
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setState('recording');
      } catch {
        setError('ریکارڈنگ شروع نہیں ہو سکی۔');
        setState('idle');
      } finally {
        busyRef.current = false;
      }
      return;
    }

    if (state === 'recording') {
      busyRef.current = true;
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) {
          setError('ریکارڈنگ محفوظ نہیں ہوئی، دوبارہ کوشش کریں۔');
          setState('idle');
          return;
        }
        setState('transcribing');
        const text = await transcribeRecording(uri);
        setState('idle');
        onTranscriptRef.current(text);
      } catch (err) {
        setState('idle');
        setError(
          err instanceof Error && /[\u0600-\u06FF]/.test(err.message)
            ? err.message
            : TRANSCRIBE_FALLBACK,
        );
      } finally {
        busyRef.current = false;
      }
    }
  }, [state, recorder]);

  return { state, error, toggle, cancel };
}
