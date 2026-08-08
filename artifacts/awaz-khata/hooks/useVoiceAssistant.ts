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
import { playBase64Audio, stopPlayback } from '@/lib/audio';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

/** One completed voice exchange kept in session memory (no persistence, per spec). */
export interface VoiceInteraction {
  id: string;
  userText: string;
  assistantText: string;
  timestamp: string;
}

/** Session conversation window — last few exchanges only, by design. */
const MAX_INTERACTIONS = 5;

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
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const busyRef = useRef(false);
  const stateRef = useRef<VoiceState>('idle');
  stateRef.current = state;
  // Generation token: cancel() bumps it, invalidating any in-flight pipeline
  // run so a blurred screen can never save a transaction, start speech, or
  // mutate UI state afterwards.
  const generationRef = useRef(0);

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(() => undefined);
  }, []);

  /**
   * Abandon an in-progress recording (discarded, not processed) and stop
   * any speech when the user leaves the screen. Stable identity — safe as
   * a useFocusEffect dependency.
   */
  const cancel = useCallback(async () => {
    generationRef.current += 1;
    if (stateRef.current === 'listening') {
      try {
        await recorder.stop();
      } catch {
        // recorder already stopped
      }
    }
    stopPlayback();
    setState('idle');
  }, [recorder]);

  /** Append a completed exchange to the session history (capped window). */
  const appendInteraction = useCallback((userText: string, assistantText: string) => {
    const now = new Date();
    setInteractions((prev) =>
      [
        ...prev,
        {
          id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
          userText,
          assistantText,
          timestamp: now.toISOString(),
        },
      ].slice(-MAX_INTERACTIONS),
    );
  }, []);

  /**
   * Show + speak a sentence aloud; never throws, always lands back on idle.
   * When `userText` is provided the exchange is a successful interaction:
   * after playback it moves into the session conversation history and the
   * live transcript/reply slots clear so the history is the single record.
   * `active` reports whether this pipeline run is still current — once it
   * returns false (screen blurred / cancelled) no speech starts and no UI
   * state is touched, except the history append which records what happened.
   */
  const speakAndFinish = useCallback(
    async (text: string, userText?: string, active: () => boolean = () => true) => {
      setReply(text);
      try {
        const speech = await speakText({ text });
        if (!active()) return;
        setState('speaking');
        await playBase64Audio(speech.audio);
      } catch {
        // TTS failure is non-fatal — the text is already visible on screen
        // and any saved transaction stays saved.
      } finally {
        if (userText) {
          appendInteraction(userText, text);
        }
        if (active()) {
          if (userText) {
            setTranscript(null);
            setReply(null);
          }
          setState('idle');
        }
      }
    },
    [appendInteraction],
  );

  const process = useCallback(
    async (uri: string) => {
      // Capture the run's generation; cancel() bumps the ref, making
      // active() false for this run from that point on.
      const gen = generationRef.current;
      const active = () => generationRef.current === gen;

      setState('processing');
      setError(null);
      try {
        const text = await transcribeRecording(uri);
        if (!active()) return;
        setTranscript(text);

        const intent = await extractIntent({ text });
        if (!active()) return; // bail before any side effect (no save after blur)

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
          // The transaction is committed — refresh data everywhere even if
          // this run was cancelled mid-save.
          queryClient.invalidateQueries({
            queryKey: getListTransactionsQueryKey(),
          });
          queryClient.invalidateQueries({ queryKey: ['finance'] });
          if (!active()) {
            // Saved but cancelled: record the exchange, skip speech/UI.
            appendInteraction(text, saved.responseText);
            return;
          }
          await speakAndFinish(saved.responseText, text, active);
          return;
        }

        if (intent.mode === 'query' && intent.query_type != null) {
          const outcome = await runQuery({
            query_type: intent.query_type as unknown as QueryRequestQueryType,
            period: (intent.period ?? null) as QueryRequestPeriod | null,
            person: intent.person ?? null,
            category: intent.category ?? null,
          });
          if (!active()) return; // read-only — nothing to record
          await speakAndFinish(outcome.responseText, text, active);
          return;
        }

        // mode === "unknown" or missing fields
        setError(UNKNOWN_MESSAGE);
        await speakAndFinish(UNKNOWN_MESSAGE, undefined, active);
      } catch (err) {
        if (!active()) return;
        const message = urduErrorFrom(err);
        setError(message);
        if (message !== NETWORK_ERROR) {
          await speakAndFinish(message, undefined, active);
        } else {
          setState('idle');
        }
      }
    },
    [queryClient, speakAndFinish, appendInteraction],
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
        setReply(null);
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

  return { state, transcript, reply, error, interactions, toggle, cancel };
}
