# Awaz Khata — آواز کھاتہ

**اپنے پیسوں کا حساب، بس بول کر۔** — Your personal finances, just by speaking.

A voice-first personal finance assistant for Pakistani users. Speak in Urdu, Roman Urdu, English, or mixed — the app records the money event, calculates, and speaks back in Urdu.

## How to run

Two workflows start automatically:

- **API Server** (`artifacts/api-server: API Server`) — Express backend on port 8080; handles STT, TTS, intent extraction, and all finance logic
- **Expo** (`artifacts/awaz-khata: expo`) — Expo mobile app; scan the QR code in the preview pane with **Expo Go** on your phone for the best experience (microphone works natively)

## Required secrets

Set in Replit Secrets (already configured):

| Secret | Purpose |
|---|---|
| `UPLIFTAI_API_KEY` | Uplift AI — Urdu speech-to-text + text-to-speech |
| `LLM_API_KEY` | Groq (`gsk_...`) or OpenAI — intent extraction from transcribed speech |

Optional: `UPLIFTAI_VOICE_ID` (default `v_meklc281`), `LLM_PROVIDER`, `LLM_MODEL`.

## Seeding demo data

```bash
pnpm --filter @workspace/api-server run seed
```

Loads realistic sample transactions (salary, expenses, person ledgers) spread over the current month in PKT. علی is intentionally left out for live demo use.

## Project layout

| Piece | Path |
|---|---|
| Expo app (voice + ledger screens) | `artifacts/awaz-khata/` |
| Express API server | `artifacts/api-server/` |
| OpenAPI contract | `lib/api-spec/openapi.yaml` |
| Generated typed client + Zod schemas | `lib/api-client-react/`, `lib/api-zod/` |
| JSON storage (no database, by design) | `artifacts/api-server/data/transactions.json` |

## Architecture

```
User speaks → Expo records audio
  → POST /api/voice/transcribe   (Uplift AI STT)
  → POST /api/voice/extract      (Groq/OpenAI LLM → structured intent JSON)
  → POST /api/transactions        (save)  OR  POST /api/query (finance engine)
  → deterministic Urdu response template
  → POST /api/voice/speak         (Uplift AI TTS → base64 MP3)
  → Expo plays the answer aloud
```

The LLM only extracts intent — all financial calculations happen in `artifacts/api-server/src/lib/finance.ts`. All spoken responses are deterministic Urdu templates. No database by design.

## User preferences

- Keep JSON file storage — no database migration
- Spoken save confirmations use conversational «جی، میں نے سن لیا اور …» wording
