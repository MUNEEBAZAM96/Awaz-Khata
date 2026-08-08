import { useCallback, useRef, useState } from 'react';
import { askAdvisor, speakText } from '@workspace/api-client-react';
import { playBase64Audio, stopPlayback } from '@/lib/audio';

export interface ChatBubble {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

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
    return err.message;
  }
  return GENERIC_ERROR;
}

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

/**
 * Chat state for the AI finance advisor. Answers are spoken aloud via TTS
 * unless muted; per-bubble replay is supported. Errors become destructive
 * assistant bubbles (shown, never spoken) — the spinner can never get stuck
 * because `pending` is cleared in every code path.
 *
 * Speech uses a generation counter: mute, replay, a new send, or leaving the
 * screen bumps the generation, which also cancels TTS requests that are
 * still in flight (not just audio that is already playing).
 */
export function useFinanceChat() {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [pending, setPending] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesRef = useRef<ChatBubble[]>([]);
  const pendingRef = useRef(false);
  const mutedRef = useRef(false);
  const speakGenRef = useRef(0);

  const push = useCallback((bubble: ChatBubble) => {
    messagesRef.current = [...messagesRef.current, bubble];
    setMessages(messagesRef.current);
  }, []);

  /** Cancel current speech AND any TTS request still being fetched. */
  const stopSpeaking = useCallback(() => {
    speakGenRef.current += 1;
    stopPlayback();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(async (id: string, text: string) => {
    const gen = ++speakGenRef.current; // newest request owns the voice
    setSpeakingId(id);
    try {
      const speech = await speakText({ text });
      if (speakGenRef.current !== gen) return; // cancelled while fetching
      await playBase64Audio(speech.audio);
    } catch {
      // TTS failure is non-fatal — the text is already on screen
    } finally {
      setSpeakingId((current) => (current === id ? null : current));
    }
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pendingRef.current) return;

      // History = real conversation turns only (errors excluded), oldest first.
      const history = messagesRef.current
        .filter((m) => !m.isError)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      stopSpeaking();
      push({ id: newId(), role: 'user', content: text });
      pendingRef.current = true;
      setPending(true);
      try {
        const { answer } = await askAdvisor({ message: text, history });
        const bubble: ChatBubble = { id: newId(), role: 'assistant', content: answer };
        push(bubble);
        pendingRef.current = false;
        setPending(false);
        if (!mutedRef.current) {
          await speak(bubble.id, answer);
        }
      } catch (err) {
        push({
          id: newId(),
          role: 'assistant',
          content: urduErrorFrom(err),
          isError: true,
        });
        pendingRef.current = false;
        setPending(false);
      }
    },
    [push, speak, stopSpeaking],
  );

  /**
   * Replay an assistant answer aloud; tapping the one that is already
   * speaking (or fetching) stops it instead. An explicit replay plays even
   * while muted — mute only silences auto-play.
   */
  const replay = useCallback(
    (bubble: ChatBubble) => {
      if (bubble.role !== 'assistant' || bubble.isError) return;
      if (speakingId === bubble.id) {
        stopSpeaking();
        return;
      }
      stopSpeaking();
      void speak(bubble.id, bubble.content);
    },
    [speakingId, speak, stopSpeaking],
  );

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) stopSpeaking();
  }, [stopSpeaking]);

  return { messages, pending, muted, speakingId, send, replay, toggleMute, stopSpeaking };
}
