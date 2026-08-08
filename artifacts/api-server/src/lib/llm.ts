import { z } from "zod/v4";

const extractSchema = z.union([
  z.object({
    mode: z.literal("transaction"),
    customer: z.string().min(1),
    amount: z.number(),
    type: z.enum(["credit", "payment"]),
    item: z.string().nullable().optional(),
  }),
  z.object({
    mode: z.literal("query"),
    customer: z.string().min(1),
  }),
]);

export type ExtractedIntent = z.infer<typeof extractSchema>;

const SYSTEM_PROMPT = `You are a strict information extraction engine for an Urdu voice ledger app used by Pakistani shopkeepers ("udhaar khata").
The user speaks in Urdu (possibly with Punjabi or English mixed in). You receive the transcribed text.

You must ALWAYS respond with strict JSON only — no markdown, no code fences, no explanation. Exactly one of these two shapes:

Transaction (the shopkeeper is recording that a customer took credit/udhaar, or made a payment):
{"mode": "transaction", "customer": "name", "amount": number, "type": "credit" | "payment", "item": "string or null"}

Query (the shopkeeper is asking about a customer's balance or account):
{"mode": "query", "customer": "name"}

Rules:
- "credit" means the customer took goods on credit / owes more (e.g. "udhaar diya", "khaate mein likho", "le gaya").
- "payment" means the customer paid money back (e.g. "wapis kiye", "jama karaye", "de diye", "paise diye").
- amount is the numeric rupee amount. Convert Urdu number words to digits (e.g. "paanch sau" -> 500, "do hazaar" -> 2000).
- customer is the person's name as spoken, kept in the original script (Urdu or Latin) as transcribed.
- item is the product mentioned (e.g. "aata", "cheeni", "doodh") or null if none mentioned.
- If the user asks "kitna hai", "kitne paise", "hisaab batao", "balance" for a person, it is a query.
- Respond with the JSON object only.`;

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
    throw new Error(`LLM returned invalid JSON: ${content.slice(0, 300)}`);
  }

  const result = extractSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `LLM JSON did not match expected shape: ${content.slice(0, 300)}`,
    );
  }
  return result.data;
}
