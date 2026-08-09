import {
  UpliftAI,
  UpliftAIError,
  UpliftAIAuthError,
  UpliftAIInsufficientBalanceError,
  UpliftAIRateLimitError,
} from "@upliftai/sdk-js";

let client: UpliftAI | null = null;

/** Default Uplift AI Urdu voice. Override with UPLIFTAI_VOICE_ID. */
export const DEFAULT_VOICE_ID = process.env["UPLIFTAI_VOICE_ID"] ?? "v_meklc281";

/**
 * Centralized STT language mapping.
 *
 * Keys are the app's internal language codes (from i18n/languages.ts).
 * Values are the BCP-47 codes Uplift STT's `scribe` model accepts.
 *
 * Saraiki (skr) has no dedicated Uplift language code; it falls back to
 * Urdu ("ur"), the closest supported language.
 *
 * Do NOT invent unsupported codes — only add entries verified against the
 * Uplift documentation.
 */
export const STT_LANGUAGE_MAP: Record<string, string> = {
  ur: "ur",  // Urdu
  hi: "hi",  // Hindi
  pa: "pa",  // Punjabi (Shahmukhi)
  skr: "ur", // Saraiki → Urdu fallback (no dedicated Uplift code)
  en: "en",  // English
};

/**
 * Resolve the Uplift STT language code for a given app language code.
 * Falls back to "ur" for any unrecognised value.
 */
export function sttLanguageFor(appLanguage: string): string {
  return STT_LANGUAGE_MAP[appLanguage] ?? "ur";
}

export function getUpliftClient(): UpliftAI {
  const apiKey = process.env["UPLIFTAI_API_KEY"];
  if (!apiKey) {
    throw new Error("UPLIFTAI_API_KEY is not configured");
  }
  if (!client) {
    client = new UpliftAI({
      apiKey,
      // Let the SDK retry transient errors (408/429/5xx) up to 3 times.
      // Do NOT wrap the SDK call in a second retry loop — that causes double
      // requests on every error.
      maxRetries: 3,
      // 60 s is generous for a short voice clip; increase if longer clips are expected.
      timeout: 60_000,
    });
  }
  return client;
}

// Re-export typed error classes so route handlers can import them from a
// single place without repeating the sdk-js import.
export {
  UpliftAIError,
  UpliftAIAuthError,
  UpliftAIInsufficientBalanceError,
  UpliftAIRateLimitError,
};
