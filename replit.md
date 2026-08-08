# Awaz Khata (آواز کھاتہ)

Voice-first personal finance assistant for Pakistani users (Uplift AI × Replit Voice AI Hackathon). Users speak naturally in Urdu / Roman Urdu / English / mixed; the app records financial events, calculates summaries with a deterministic finance engine, and answers back in spoken Urdu. Core loop: SPEAK → UNDERSTAND → SAVE/CALCULATE → SPEAK BACK.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (via workflow)
- `pnpm --filter @workspace/awaz-khata run dev` — Expo app (via workflow only)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate hooks/zod from OpenAPI
- Required secrets: `UPLIFTAI_API_KEY` (STT/TTS), `LLM_API_KEY` (Groq `gsk_...` or OpenAI, auto-detected by prefix; override with `LLM_PROVIDER`/`LLM_MODEL`). Optional `UPLIFTAI_VOICE_ID` (default `v_meklc281`).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 (expo-router, expo-audio, reanimated) — NativeWind intentionally NOT used; scaffold uses StyleSheet
- API: Express 5 + `@upliftai/sdk-js` (STT + TTS `MP3_22050_128`) + OpenAI-compatible chat completions via fetch
- Storage: JSON file `artifacts/api-server/data/transactions.json` (no DB, per hackathon spec)

## Domain model (v2 — personal finance)

- Transaction: `{id, amount, type: expense|income|given|received, person|null, category|null, description|null, timestamp}`
- Person balance = given − received (positive → they owe the user → shown red; settled → green)
- Queries: total_expenses, total_income, person_given, person_received, person_balance, today_summary, monthly_summary, category_summary (no category → top category), recent_transactions; periods today/this_week/this_month/all_time computed in PKT (UTC+5)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (/voice/transcribe, /voice/extract, /voice/speak, /transactions, /transactions/person/:person, /query)
- `artifacts/api-server/src/lib/finance.ts` — finance engine + ALL Urdu response templates (deterministic; LLM never calculates)
- `artifacts/api-server/src/lib/llm.ts` — Groq/OpenAI intent extraction with strict zod validation
- `artifacts/api-server/src/routes/` — voice.ts, transactions.ts, query.ts
- `artifacts/awaz-khata/hooks/useVoiceAssistant.ts` — voice pipeline state machine (idle→listening→processing→speaking)
- `artifacts/awaz-khata/components/` — VoiceButton, VoiceStatus, ActivityList, SummaryHeader, TransactionRow
- `artifacts/awaz-khata/lib/` — api.ts (multipart transcribe upload), audio.ts (base64 MP3 playback)
- `README.md` — hackathon-facing setup + demo commands doc

## Architecture decisions

- POST /api/transactions returns `{transaction, responseText}` — Urdu confirmation built server-side so all spoken text comes from backend templates
- Backend errors return `{error: "اردو پیغام"}` with user-speakable Urdu; frontend shows AND speaks them (except network errors)
- Extract endpoint returns `{mode:"unknown"}` for non-financial speech (200); invalid LLM output → 502 with Urdu error
- `/transcribe` upload bypasses generated hooks (RN FormData `{uri,name,type}` shape); everything else uses generated client with `setBaseUrl` in `_layout.tsx`
- given/received transactions require a person (400 otherwise)

## User preferences

- Hackathon demo: favor working over polished, keep it simple and reliable; no auth, no DB, no over-engineering (spec §35 forbidden list)
- Frontend must never talk to Uplift AI or the LLM directly — backend only

## Gotchas

- Uplift STT is beta — /voice/transcribe wraps failures in Urdu 502s
- OpenAPI changes: run codegen, then re-fix `lib/api-zod/src/index.ts` if orval overwrites it (explicit exports required — `TranscribeAudioBody` zod const collides with same-named type)
- `lib/api-zod/tsconfig.json` includes DOM lib (multipart schema uses `File`/`Blob`)
- Script matching: person names match case-insensitively but not across scripts (علی ≠ Ali); fine in practice since STT consistently produces Urdu script
