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
import { useT } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import type { UnderstoodTransaction } from '@/components/voice/TranscriptCard';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'confirming';

/** Structured payload behind the current reply, for richer result cards. */
export interface ReplyMeta {
  kind: 'transaction' | 'query';
  result?: Record<string, unknown>;
}

/** One completed voice exchange kept in session memory (no persistence, per spec). */
export interface VoiceInteraction {
  id: string;
  userText: string;
  assistantText: string;
  timestamp: string;
}

/** Session conversation window — last few exchanges only, by design. */
const MAX_INTERACTIONS = 5;

/**
 * Above this rupee amount a transaction is confirmed by the user before it is
 * written. Mishearing «پانچ سو» as «پانچ ہزار» is the failure mode that costs
 * real money, and a single tap is cheap insurance.
 */
const HIGH_VALUE_THRESHOLD = 5000;

/**
 * Spoken output is Urdu regardless of UI language: every response template in
 * the finance engine is Urdu, and the TTS voice is an Urdu voice. Feeding it
 * an English sentence would produce a mispronounced answer, so client-side
 * messages are DISPLAYED in the user's language but SPOKEN with these fixed
 * Urdu equivalents.
 */
const SPOKEN_UNKNOWN = 'میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔';

export function useVoiceAssistant() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const queryClient = useQueryClient();
  const t = useT();
  const { prefs } = usePreferences();

  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [replyMeta, setReplyMeta] = useState<ReplyMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  /** Set when a transaction is waiting for explicit user approval. */
  const [pending, setPending] = useState<UnderstoodTransaction | null>(null);

  const busyRef = useRef(false);
  const stateRef = useRef<VoiceState>('idle');
  stateRef.current = state;
  // Generation token: cancel() bumps it, invalidating any in-flight pipeline
  // run so a blurred screen can never save a transaction, start speech, or
  // mutate UI state afterwards.
  const generationRef = useRef(0);

  // The preference is read inside async callbacks; a ref keeps them from
  // capturing a stale value without re-creating every callback.
  const speakEnabledRef = useRef(prefs.voiceResponses);
  speakEnabledRef.current = prefs.voiceResponses;

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(() => undefined);
  }, []);

  /** Map a thrown error to a message that is safe to show a user. */
  const messageFrom = useCallback(
    (err: unknown): { text: string; network: boolean } => {
      // Backend ApiError carries { error: "اردو پیغام" } in .data. Those are
      // already user-facing and already localized (Urdu) by the server.
      const data = (err as { data?: unknown } | null)?.data;
      if (data && typeof data === 'object' && 'error' in data) {
        const message = (data as { error?: unknown }).error;
        if (typeof message === 'string' && message.trim()) {
          return { text: message, network: false };
        }
      }
      if (err instanceof Error && /network|fetch/i.test(err.message)) {
        return { text: t('error.network'), network: true };
      }
      if (err instanceof Error && err.message && /[؀-ۿ]/.test(err.message)) {
        return { text: err.message, network: false };
      }
      return { text: t('error.generic'), network: false };
    },
    [t],
  );

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
    setPending(null);
    setSaving(false);
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
   *
   * `displayText` is what the user reads, `spokenText` what the Urdu voice
   * says — they differ for client-side messages when the UI is not in Urdu.
   * `active` reports whether this pipeline run is still current.
   */
  const speakAndFinish = useCallback(
    async (
      displayText: string,
      options: {
        spokenText?: string;
        userText?: string;
        active?: () => boolean;
      } = {},
    ) => {
      const { spokenText = displayText, userText, active = () => true } = options;
      setReply(displayText);
      try {
        if (speakEnabledRef.current) {
          const speech = await speakText({ text: spokenText });
          if (!active()) return;
          setState('speaking');
          await playBase64Audio(speech.audio);
        }
      } catch {
        // TTS failure is non-fatal — the text is already visible on screen
        // and any saved transaction stays saved.
      } finally {
        if (userText) {
          appendInteraction(userText, displayText);
        }
        if (active()) {
          if (userText) {
            setTranscript(null);
            setReply(null);
            setReplyMeta(null);
          }
          setState('idle');
        }
      }
    },
    [appendInteraction],
  );

  /**
   * Commit a transaction and speak the backend's confirmation.
   *
   * The spoken confirmation is built server-side AFTER the write succeeds —
   * the app never announces success on its own.
   */
  const commit = useCallback(
    async (
      entry: UnderstoodTransaction,
      userText: string | undefined,
      active: () => boolean,
    ) => {
      setSaving(true);
      try {
        const saved = await createTransaction({
          amount: entry.amount,
          type: entry.type as TransactionInputType,
          person: entry.person ?? null,
          category: entry.category ?? null,
          description: entry.description ?? null,
        });
        // The transaction is committed — refresh data everywhere even if
        // this run was cancelled mid-save.
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: ['finance'] });

        if (!active()) {
          // Saved but cancelled: record the exchange, skip speech/UI.
          if (userText) appendInteraction(userText, saved.responseText);
          return;
        }
        setReplyMeta({ kind: 'transaction' });
        await speakAndFinish(saved.responseText, { userText, active });
      } catch (err) {
        if (!active()) return;
        const { text, network } = messageFrom(err);
        setError(text);
        setState('idle');
        if (!network) {
          // The failure message came from the backend and is already Urdu.
          await speakAndFinish(text, { active });
        }
      } finally {
        setSaving(false);
      }
    },
    [queryClient, speakAndFinish, appendInteraction, messageFrom],
  );

  /**
   * Intent → action → spoken result. Shared by the voice pipeline (after STT)
   * and text-triggered asks. Handles its own errors; never throws.
   */
  const handleText = useCallback(
    async (text: string, active: () => boolean) => {
      try {
        const intent = await extractIntent({ text });
        if (!active()) return; // bail before any side effect (no save after blur)

        if (
          intent.mode === 'transaction' &&
          intent.type != null &&
          intent.amount != null &&
          intent.amount > 0
        ) {
          const entry: UnderstoodTransaction = {
            type: intent.type as UnderstoodTransaction['type'],
            amount: intent.amount,
            person: intent.person ?? null,
            category: intent.category ?? null,
            description: intent.description ?? null,
          };

          // High-value entries wait for a tap. Everything else keeps the
          // fast path the product depends on.
          if (entry.amount >= HIGH_VALUE_THRESHOLD) {
            setPending(entry);
            setReplyMeta({ kind: 'transaction' });
            setState('confirming');
            return;
          }

          setReplyMeta({ kind: 'transaction' });
          await commit(entry, text, active);
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
          setReplyMeta({
            kind: 'query',
            result: (outcome.result ?? undefined) as Record<string, unknown> | undefined,
          });
          await speakAndFinish(outcome.responseText, { userText: text, active });
          return;
        }

        // mode === "unknown" or missing fields
        setError(t('voice.errorUnderstand'));
        await speakAndFinish(t('voice.errorUnderstand'), {
          spokenText: SPOKEN_UNKNOWN,
          active,
        });
      } catch (err) {
        if (!active()) return;
        const { text: message, network } = messageFrom(err);
        setError(message);
        if (!network) {
          await speakAndFinish(message, { active });
        } else {
          setState('idle');
        }
      }
    },
    [commit, speakAndFinish, messageFrom, t],
  );

  /** User approved a high-value entry. */
  const confirmPending = useCallback(async () => {
    const entry = pending;
    if (!entry) return;
    const gen = generationRef.current;
    const active = () => generationRef.current === gen;
    setPending(null);
    setState('processing');
    await commit(entry, transcript ?? undefined, active);
  }, [pending, transcript, commit]);

  /** User rejected the parsed entry — nothing is written. */
  const cancelPending = useCallback(() => {
    setPending(null);
    setTranscript(null);
    setReplyMeta(null);
    setState('idle');
  }, []);

  const process = useCallback(
    async (uri: string, active: () => boolean) => {
      // `active` was captured by the caller BEFORE any await (including
      // recorder.stop()), so a cancel() during any of those awaits makes
      // it false for this entire run.
      if (!active()) return;
      setState('processing');
      setError(null);
      setReplyMeta(null);
      let text: string;
      try {
        text = await transcribeRecording(uri);
        if (!active()) return;
        setTranscript(text);
      } catch (err) {
        if (!active()) return;
        const { text: message, network } = messageFrom(err);
        setError(message);
        if (!network) {
          await speakAndFinish(message, { active });
        } else {
          setState('idle');
        }
        return;
      }
      await handleText(text, active);
    },
    [handleText, speakAndFinish, messageFrom],
  );

  /**
   * Run a typed question or suggestion through the same pipeline as speech,
   * skipping STT. This is the text fallback: one intent path, one finance
   * engine, whether the words were spoken or typed.
   */
  const ask = useCallback(
    async (text: string) => {
      if (busyRef.current || stateRef.current !== 'idle') return;
      busyRef.current = true;
      const gen = generationRef.current;
      const active = () => generationRef.current === gen;
      try {
        setState('processing');
        setError(null);
        setReply(null);
        setReplyMeta(null);
        setPending(null);
        setTranscript(text);
        await handleText(text, active);
      } finally {
        busyRef.current = false;
      }
    },
    [handleText],
  );

  /** Tap handler for the mic button: idle → listening → processing → speaking → idle. */
  const toggle = useCallback(async () => {
    if (busyRef.current) return;

    if (state === 'idle' || state === 'confirming') {
      busyRef.current = true;
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          setError(t('permission.deniedBody'));
          return;
        }
        if (Platform.OS !== 'web' && prefs.haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setError(null);
        setTranscript(null);
        setReply(null);
        setReplyMeta(null);
        setPending(null);
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setState('listening');
      } catch {
        setError(t('error.generic'));
        setState('idle');
      } finally {
        busyRef.current = false;
      }
      return;
    }

    if (state === 'listening') {
      busyRef.current = true;
      // Capture the run token BEFORE awaiting recorder.stop() — a blur/cancel
      // during that await must kill this run, not just an already-started
      // pipeline. cancel() bumps the ref, making active() false from then on.
      const gen = generationRef.current;
      const active = () => generationRef.current === gen;
      try {
        if (Platform.OS !== 'web' && prefs.haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        await recorder.stop();
        if (!active()) return; // cancelled while stopping — discard recording
        const uri = recorder.uri;
        if (!uri) {
          setError(t('error.generic'));
          setState('idle');
          return;
        }
        await process(uri, active);
      } catch {
        if (active()) {
          setError(t('error.generic'));
          setState('idle');
        }
      } finally {
        busyRef.current = false;
      }
    }
  }, [state, recorder, process, t, prefs.haptics]);

  return {
    state,
    transcript,
    reply,
    replyMeta,
    error,
    saving,
    pending,
    interactions,
    toggle,
    ask,
    cancel,
    confirmPending,
    cancelPending,
  };
}
