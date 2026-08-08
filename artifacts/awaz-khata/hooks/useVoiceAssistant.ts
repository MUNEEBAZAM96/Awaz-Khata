import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import {
  createTransaction,
  extractIntent,
  runQuery,
  speakText,
  getListTransactionsQueryKey,
  type QueryRequestQueryType,
  type QueryRequestPeriod,
  type TransactionInputType,
} from '@workspace/api-client-react';
import { transcribeRecording } from '@/lib/api';
import { playBase64Audio } from '@/lib/audio';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

const UNKNOWN_MESSAGE = 'میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔';
const GENERIC_ERROR = 'کچھ غلط ہو گیا، دوبارہ کوشش کریں۔';
const NETWORK_ERROR = 'سرور سے رابطہ نہیں ہو سکا۔';

function urduErrorFrom(err: unknown): string {
  // Backend ApiError carries { error: "اردو پیغام" } in .data
  const data = (err as { data?: unknown } | null)?.data;
  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (err instanceof Error && /network|fetch/i.test(err.message)) {
    return NETWORK_ERROR;
  }
  if (err instanceof Error && err.message && /[\u0600-\u06FF]/.test(err.message)) {
    // Already a user-facing Urdu message (e.g. from transcribeRecording)
    return err.message;
  }
  return GENERIC_ERROR;
}

export function useVoiceAssistant() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const queryClient = useQueryClient();
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(() => undefined);
  }, []);

  /** Speak a sentence aloud; never throws, always lands back on idle. */
  const speakAndFinish = useCallback(async (text: string) => {
    try {
      const speech = await speakText({ text });
      setState('speaking');
      await playBase64Audio(speech.audio);
    } catch {
      // TTS failure is non-fatal — the text is already visible on screen
    } finally {
      setState('idle');
    }
  }, []);

  const process = useCallback(
    async (uri: string) => {
      setState('processing');
      setError(null);
      try {
        const text = await transcribeRecording(uri);
        setTranscript(text);

        const intent = await extractIntent({ text });

        if (
          intent.mode === 'transaction' &&
          intent.type != null &&
          intent.amount != null &&
          intent.amount > 0
        ) {
          const saved = await createTransaction({
            amount: intent.amount,
            type: intent.type as TransactionInputType,
            person: intent.person ?? null,
            category: intent.category ?? null,
            description: intent.description ?? null,
          });
          queryClient.invalidateQueries({
            queryKey: getListTransactionsQueryKey(),
          });
          queryClient.invalidateQueries({ queryKey: ['finance'] });
          await speakAndFinish(saved.responseText);
          return;
        }

        if (intent.mode === 'query' && intent.query_type != null) {
          const outcome = await runQuery({
            query_type: intent.query_type as unknown as QueryRequestQueryType,
            period: (intent.period ?? null) as QueryRequestPeriod | null,
            person: intent.person ?? null,
            category: intent.category ?? null,
          });
          await speakAndFinish(outcome.responseText);
          return;
        }

        // mode === "unknown" or missing fields
        setError(UNKNOWN_MESSAGE);
        await speakAndFinish(UNKNOWN_MESSAGE);
      } catch (err) {
        const message = urduErrorFrom(err);
        setError(message);
        if (message !== NETWORK_ERROR) {
          await speakAndFinish(message);
        } else {
          setState('idle');
        }
      }
    },
    [queryClient, speakAndFinish],
  );

  /** Tap handler for the mic button: idle → listening → processing → speaking → idle. */
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
        setTranscript(null);
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setState('listening');
      } catch {
        setError('ریکارڈنگ شروع نہیں ہو سکی۔');
        setState('idle');
      } finally {
        busyRef.current = false;
      }
      return;
    }

    if (state === 'listening') {
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
        await process(uri);
      } catch {
        setError(GENERIC_ERROR);
        setState('idle');
      } finally {
        busyRef.current = false;
      }
    }
  }, [state, recorder, process]);

  return { state, transcript, error, toggle };
}
