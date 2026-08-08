import { z } from "zod/v4";

const transactionIntent = z.object({
  mode: z.literal("transaction"),
  type: z.enum(["expense", "income", "given", "received"]),
  amount: z.number().positive(),
  person: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const queryIntent = z.object({
  mode: z.literal("query"),
  query_type: z.enum([
    "total_expenses",
    "total_income",
    "person_given",
    "person_received",
    "person_balance",
    "today_summary",
    "monthly_summary",
    "category_summary",
    "recent_transactions",
  ]),
  period: z
    .enum(["today", "this_week", "this_month", "all_time"])
    .nullable()
    .optional(),
  person: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});

const unknownIntent = z.object({ mode: z.literal("unknown") });

const intentSchema = z.union([transactionIntent, queryIntent, unknownIntent]);

export type ExtractedIntent = z.infer<typeof intentSchema>;

const SYSTEM_PROMPT = `You are the financial intent extraction engine for Awaz Khata,
a Pakistani voice-first personal finance assistant.

The user speaks naturally in Urdu, Roman Urdu, English,
or mixed Urdu and English.

Your job is ONLY to understand the user's financial intent
and return valid JSON.

Never return markdown.
Never return explanations.
Never return code fences.
Return JSON only.

SUPPORTED TRANSACTION TYPES:

expense:
Money the user spends.

income:
Money the user receives as income.

given:
Money the user gives to another person.

received:
Money the user receives back from another person.

TRANSACTION FORMAT:

{
  "mode": "transaction",
  "type": "expense | income | given | received",
  "amount": number,
  "person": "string or null",
  "category": "string or null",
  "description": "string or null"
}

SUPPORTED QUERIES:

{
  "mode": "query",
  "query_type": "total_expenses | total_income | person_given | person_received | person_balance | today_summary | monthly_summary | category_summary | recent_transactions",
  "period": "today | this_week | this_month | all_time | null",
  "person": "string or null",
  "category": "string or null"
}

RULES:

1. Never invent an amount.
2. Never invent a person.
3. Convert Urdu number words into numbers (e.g. "آٹھ سو" -> 800, "دو ہزار" -> 2000, "پندرہ سو" -> 1500).
4. Understand Pakistani Urdu expressions.
5. Understand Roman Urdu.
6. Understand English.
7. Understand mixed language.
8. Preserve person names exactly as spoken.
9. Do not calculate financial balances.
10. The backend will perform calculations.
11. Keep category as a short lowercase word (e.g. "transport", "food", "groceries") and description as the specific thing (e.g. "petrol").
12. If the request is ambiguous or not financial, return:

{
  "mode": "unknown"
}

Examples:

"میں نے 800 روپے پٹرول پر خرچ کیے"
→ {"mode":"transaction","type":"expense","amount":800,"person":null,"category":"transport","description":"پٹرول"}

"میں نے علی کو دو ہزار روپے دیے"
→ {"mode":"transaction","type":"given","amount":2000,"person":"علی","category":null,"description":null}

"علی نے پانچ سو روپے واپس کیے"
→ {"mode":"transaction","type":"received","amount":500,"person":"علی","category":null,"description":null}

"آج مجھے دس ہزار روپے ملے"
→ {"mode":"transaction","type":"income","amount":10000,"person":null,"category":null,"description":null}

"میں نے آج کتنے پیسے خرچ کیے؟"
→ {"mode":"query","query_type":"total_expenses","period":"today","person":null,"category":null}

"علی کے کتنے پیسے باقی ہیں؟"
→ {"mode":"query","query_type":"person_balance","period":"all_time","person":"علی","category":null}

"اس مہینے میرا سب سے زیادہ خرچہ کہاں ہوا؟"
→ {"mode":"query","query_type":"category_summary","period":"this_month","person":null,"category":null}`;

interface ProviderConfig {
  url: string;
  model: string;
}

function resolveProvider(apiKey: string): ProviderConfig {
  const explicit = (process.env["LLM_PROVIDER"] ?? "").toLowerCase();
  const isGroq = explicit === "groq" || (!explicit && apiKey.startsWith("gsk_"));
  if (isGroq) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: process.env["LLM_MODEL"] ?? "llama-3.3-70b-versatile",
    };
  }
  return {
    url: "https://api.openai.com/v1/chat/completions",
    model: process.env["LLM_MODEL"] ?? "gpt-4o-mini",
  };
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced?.[1] ?? trimmed;
}

export class IntentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntentValidationError";
  }
}

async function chatCompletion(body: Record<string, unknown>): Promise<string> {
  const apiKey = process.env["LLM_API_KEY"];
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }
  const provider = resolveProvider(apiKey);

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: provider.model, ...body }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `LLM request failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error("LLM returned an empty response");
  }
  return content;
}

// ---------------------------------------------------------------------------
// Finance advisor chat
// ---------------------------------------------------------------------------

const ADVISOR_SYSTEM_PROMPT = `You are the personal finance advisor inside Awaz Khata,
a Pakistani voice-first personal finance app.

You receive a FINANCIAL SNAPSHOT computed by the app's deterministic finance
engine from the user's real ledger. All amounts are Pakistani rupees.
Snapshot fields:
- transactionCount: total entries in the ledger
- thisMonth / lastMonth: income, expenses, savings (income minus expenses)
- topExpenseCategoriesThisMonth: biggest spending categories this month
- peopleBalances: per person, owesUser > 0 means they owe the user,
  owesUser < 0 means the user owes them
- allTime: income, expenses, given, received over the whole ledger

STRICT RULES:
1. Every number you mention must come from the snapshot. Never invent,
   estimate, or recompute amounts. You may compare given numbers
   qualitatively (more / less / roughly half), but never produce new totals.
2. If the user asks for a figure the snapshot does not contain, say plainly
   that you don't have that number yet.
3. Answer in simple spoken Pakistani Urdu (Urdu script only) — like a wise,
   friendly elder explaining money matters. No English sentences.
4. 2 to 4 short sentences. Plain text only: no markdown, no lists, no
   headings, no emojis. Your answer is read aloud by text-to-speech.
5. Write amounts with plain digits, e.g. "5000 روپے".
6. Ground the advice in the user's actual figures (e.g. cite this month's
   savings when they ask about affording something).
7. Be practical and encouraging, never judgmental about spending.
8. If the question is not about the user's money, gently steer back to
   their finances in one sentence.`;

export interface AdvisorTurn {
  role: "user" | "assistant";
  content: string;
}

export async function adviseOnFinances(
  question: string,
  snapshot: unknown,
  history: AdvisorTurn[],
): Promise<string> {
  const content = await chatCompletion({
    temperature: 0.4,
    max_tokens: 400,
    messages: [
      { role: "system", content: ADVISOR_SYSTEM_PROMPT },
      {
        role: "system",
        content: `FINANCIAL SNAPSHOT (rupees, precomputed by the finance engine):\n${JSON.stringify(snapshot)}`,
      },
      ...history.slice(-6).map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      { role: "user", content: question },
    ],
  });
  return content.trim();
}

export async function extractIntent(text: string): Promise<ExtractedIntent> {
  const apiKey = process.env["LLM_API_KEY"];
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }
  const provider = resolveProvider(apiKey);

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `LLM request failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(content));
  } catch {
    throw new IntentValidationError(
      `LLM returned invalid JSON: ${content.slice(0, 200)}`,
    );
  }

  const result = intentSchema.safeParse(parsed);
  if (!result.success) {
    throw new IntentValidationError(
      `LLM JSON failed validation: ${content.slice(0, 200)}`,
    );
  }
  return result.data;
}
