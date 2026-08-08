# Awaz Khata (آواز کھاتہ)

A voice-first Urdu ledger mobile app for Pakistani shopkeepers: record customer credit (udhaar) and payments entirely by speaking, ask for balances by voice, and hear answers spoken back in Urdu.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/awaz-khata run dev` — run the Expo app (via workflow only)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required secrets: `UPLIFTAI_API_KEY` (Urdu STT/TTS), `LLM_API_KEY` (Groq `gsk_...` or OpenAI `sk-...`, auto-detected; override with `LLM_PROVIDER` / `LLM_MODEL` env vars)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 (expo-router, expo-audio, react-native-reanimated)
- API: Express 5 + `@upliftai/sdk-js` (STT `scribe` model + TTS `MP3_22050_128`) + OpenAI-compatible LLM chat completions
- Storage: JSON file at `artifacts/api-server/data/transactions.json` (no database, per spec — hackathon demo)
- Validation: Zod (`zod/v4`); API codegen: Orval

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (transcribe, extract, transactions, speak)
- `artifacts/api-server/src/routes/voice.ts` — /transcribe, /extract, /speak
- `artifacts/api-server/src/routes/ledger.ts` — /transactions CRUD + balances
- `artifacts/api-server/src/lib/` — `store.ts` (JSON file store), `llm.ts` (intent extraction), `uplift.ts` (Uplift AI client)
- `artifacts/awaz-khata/app/index.tsx` — MainVoiceScreen (mic + pipeline + recent activity)
- `artifacts/awaz-khata/app/ledger.tsx` — LedgerScreen (all customers + balances)
- `artifacts/awaz-khata/lib/voice.ts` — multipart audio upload + base64 MP3 playback helpers

## Architecture decisions

- No database by explicit user request — transactions live in a JSON file; balances are computed on read (credits minus payments), customers matched case-insensitively.
- LLM provider auto-detected from key prefix (`gsk_` → Groq llama-3.3-70b, else OpenAI gpt-4o-mini); `LLM_PROVIDER`/`LLM_MODEL` env vars override.
- Uses `expo-audio` (SDK 54 native) instead of the deprecated `expo-av` requested in the original spec; `expo-file-system/legacy` writes TTS base64 to a cache file for native playback.
- `/transcribe` upload bypasses generated hooks (React Native FormData file shape); everything else uses `@workspace/api-client-react` generated functions.
- Default Uplift voice `v_meklc281`, overridable via `UPLIFTAI_VOICE_ID`.

## Product

- Screen 1 (main): big mic button — tap to record Urdu speech, tap again to stop. Pipeline: transcribe → extract intent → save transaction or fetch balance → speak Urdu confirmation aloud. Shows last 5 activities.
- Screen 2 (ledger): all customers with running balances — red if they owe, green if settled.

## User preferences

- Hackathon demo: favor working over polished, keep it simple and reliable.
- Frontend must never talk to Uplift AI or the LLM directly — backend only.

## Gotchas

- Uplift STT is in beta — /transcribe wraps it with a clear 502 error message.
- Any OpenAPI change: run codegen before touching generated hooks. The `lib/api-zod/src/index.ts` barrel uses explicit exports because the multipart `TranscribeAudioBody` zod const collides with its generated type.
- `lib/api-zod/tsconfig.json` includes DOM lib (generated multipart schema references `File`/`Blob`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
