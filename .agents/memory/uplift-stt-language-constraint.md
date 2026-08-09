---
name: Uplift STT language constraint
description: The @upliftai/sdk-js STT endpoint only supports language "ur" in its TypeScript types; the language mapping in uplift.ts is forward-looking for when Uplift adds more codes.
---

The `TranscriptionRequest` type in `@upliftai/sdk-js@0.1.2` declares `language?: 'ur'` — the only valid value is "ur". Passing a generic `string` causes a TS2322 error.

**How to apply:** In `voice.ts`, always call `client.stt.transcribe({ ..., language: "ur" })` (hardcoded). Log the user's requested language separately for observability. The `sttLanguageFor()` function in `uplift.ts` holds the mapping for when the SDK supports more codes — don't remove it.

**Why:** The app has multilingual UI (ur/hi/pa/skr/en) and a centralized `STT_LANGUAGE_MAP`, but the SDK can only send to Uplift in Urdu until the API extends its language support.
