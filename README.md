# آواز کھاتہ — Awaz Khata

**اپنے پیسوں کا حساب، بس بول کر۔** — Your personal finances, just by speaking.

A voice-first personal finance assistant for Pakistani users, built for the **Uplift AI × Replit Voice AI Hackathon**. Speak naturally in Urdu, Roman Urdu, English, or mixed speech — the app understands, records the money event, calculates, and answers back in spoken Urdu.

**SPEAK → UNDERSTAND → SAVE/CALCULATE → SPEAK BACK**

## How it works

```
User speaks (Urdu / Roman Urdu / English / mixed)
  → Expo records audio
  → POST /api/voice/transcribe   (Uplift AI STT)
  → POST /api/voice/extract      (Groq LLM → structured intent JSON)
  → POST /api/transactions       (save)  OR  POST /api/query (finance engine)
  → deterministic Urdu response template
  → POST /api/voice/speak        (Uplift AI TTS → base64 MP3)
  → Expo plays the answer aloud
```

The LLM only extracts intent — **all financial calculations happen in the backend finance engine** (`artifacts/api-server/src/lib/finance.ts`), and all spoken responses are deterministic Urdu templates.

## Project layout (pnpm monorepo)

| Piece | Path |
|---|---|
| Expo app (2 screens: voice + ledger) | `artifacts/awaz-khata/` |
| Express API server | `artifacts/api-server/` |
| OpenAPI contract | `lib/api-spec/openapi.yaml` |
| Generated typed client + zod schemas | `lib/api-client-react/`, `lib/api-zod/` |
| JSON storage (no database, by design) | `artifacts/api-server/data/transactions.json` |

## Setup

1. **Install dependencies**: `pnpm install`
2. **Configure secrets** (Replit Secrets, not `.env` files):
   - `UPLIFTAI_API_KEY` — Uplift AI key (STT + TTS)
   - `LLM_API_KEY` — Groq key (`gsk_...`) or OpenAI key (auto-detected)
   - optional: `UPLIFTAI_VOICE_ID` (default `v_meklc281`), `LLM_PROVIDER`, `LLM_MODEL`
3. **Start the backend**: the `API Server` workflow runs `pnpm --filter @workspace/api-server run dev`
4. **Start Expo**: the `expo` workflow runs `pnpm --filter @workspace/awaz-khata run dev`
5. **Point the app at the backend**: automatic — the app reads `EXPO_PUBLIC_DOMAIN` (set by the workflow) and calls `https://<domain>/api/...`. The frontend never touches Uplift AI or Groq directly; keys live only on the backend.
6. **Open on a phone**: scan the Expo QR code in the preview pane with Expo Go (best experience — microphone works natively).

## Demo data

Load realistic sample data (salary, expenses across categories, two people with open/settled ledgers — spread over the current month in PKT):

```bash
pnpm --filter @workspace/api-server run seed
```

علی is intentionally left out so the live demo commands below build his ledger from scratch. Re-run the seed anytime to reset.

## Testing the voice pipeline

Tap the big mic, say one of these, tap again to stop:

1. «آج میں نے آٹھ سو روپے پٹرول پر خرچ کیے» → expense saved, spoken confirmation
2. «میں نے علی کو دو ہزار روپے دیے» → given/2000/علی
3. «علی نے پانچ سو روپے واپس کیے» → received/500/علی
4. «میں نے آج کتنے پیسے خرچ کیے؟» → calculated from real data, spoken back
5. «علی کے کتنے پیسے باقی ہیں؟» → given − received, spoken back
6. «اس مہینے میرا سب سے زیادہ خرچہ کہاں ہوا؟» → top spending category

API smoke tests (backend only):

```bash
curl -s -X POST localhost:80/api/voice/extract -H 'Content-Type: application/json' \
  -d '{"text":"میں نے علی کو دو ہزار روپے دیے"}'
curl -s -X POST localhost:80/api/query -H 'Content-Type: application/json' \
  -d '{"query_type":"person_balance","person":"علی"}'
```

## Transaction types

| Type | Meaning | Example |
|---|---|---|
| `expense` | money spent | «800 روپے پٹرول پر خرچ کیے» |
| `income` | money received | «آج مجھے دس ہزار روپے ملے» |
| `given` | money lent to a person | «علی کو دو ہزار دیے» |
| `received` | money returned by a person | «علی نے پانچ سو واپس کیے» |

Person balance = given − received.
