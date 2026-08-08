/**
 * Finance engine — the single source of truth for all financial calculations.
 * The LLM never calculates anything; it only extracts intent.
 * All spoken Urdu responses are deterministic templates built here.
 */
import type { TransactionRecord, TransactionType } from "./store";

export type Period = "today" | "this_week" | "this_month" | "all_time";

export type QueryType =
  | "total_expenses"
  | "total_income"
  | "person_given"
  | "person_received"
  | "person_balance"
  | "today_summary"
  | "monthly_summary"
  | "category_summary"
  | "recent_transactions";

export interface FinanceQuery {
  query_type: QueryType;
  period?: Period | null;
  person?: string | null;
  category?: string | null;
}

export interface QueryOutcome {
  result: Record<string, unknown>;
  responseText: string;
}

// ---------------------------------------------------------------------------
// Time handling — Pakistan Standard Time (UTC+5, no DST)
// ---------------------------------------------------------------------------

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

/** Y/M/D of a timestamp in Pakistan Standard Time. */
function pktParts(iso: string): { y: number; m: number; d: number; dow: number } {
  const shifted = new Date(new Date(iso).getTime() + PKT_OFFSET_MS);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
    dow: shifted.getUTCDay(),
  };
}

function inPeriod(iso: string, period: Period, nowIso: string): boolean {
  if (period === "all_time") return true;
  const now = pktParts(nowIso);
  const ts = pktParts(iso);
  if (period === "today") {
    return ts.y === now.y && ts.m === now.m && ts.d === now.d;
  }
  if (period === "this_month") {
    return ts.y === now.y && ts.m === now.m;
  }
  // this_week: Monday-start calendar week in PKT (bounded on both ends so
  // future-dated records can never leak in)
  const nowDate = new Date(new Date(nowIso).getTime() + PKT_OFFSET_MS);
  const daysSinceMonday = (nowDate.getUTCDay() + 6) % 7;
  const weekStart = Date.UTC(now.y, now.m, now.d - daysSinceMonday);
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
  const tsUtcDay = Date.UTC(ts.y, ts.m, ts.d);
  return tsUtcDay >= weekStart && tsUtcDay < weekEnd;
}

export function filterByPeriod(
  records: TransactionRecord[],
  period: Period,
  nowIso = new Date().toISOString(),
): TransactionRecord[] {
  if (period === "all_time") return records;
  return records.filter((r) => inPeriod(r.timestamp, period, nowIso));
}

// ---------------------------------------------------------------------------
// Core sums
// ---------------------------------------------------------------------------

function sumOf(records: TransactionRecord[], type: TransactionType): number {
  return records
    .filter((r) => r.type === type)
    .reduce((sum, r) => sum + r.amount, 0);
}

export interface Totals {
  income: number;
  expenses: number;
  given: number;
  received: number;
}

export function summarize(records: TransactionRecord[]): Totals {
  return {
    income: sumOf(records, "income"),
    expenses: sumOf(records, "expense"),
    given: sumOf(records, "given"),
    received: sumOf(records, "received"),
  };
}

export interface PersonStats {
  person: string;
  given: number;
  received: number;
  balance: number;
  transactions: TransactionRecord[];
}

/** Case-insensitive person lookup. Returns null when the person has no records. */
export function personStats(
  records: TransactionRecord[],
  person: string,
): PersonStats | null {
  const target = person.trim().toLowerCase();
  const matching = records.filter(
    (r) => r.person && r.person.trim().toLowerCase() === target,
  );
  if (matching.length === 0) return null;
  const given = sumOf(matching, "given");
  const received = sumOf(matching, "received");
  const displayName = matching[matching.length - 1]?.person ?? person.trim();
  return {
    person: displayName,
    given,
    received,
    balance: given - received,
    transactions: [...matching].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp),
    ),
  };
}

/** All people involved in given/received transactions, with balances. */
export function allPeople(records: TransactionRecord[]): PersonStats[] {
  const names = new Map<string, string>();
  for (const r of records) {
    if (r.person && (r.type === "given" || r.type === "received")) {
      names.set(r.person.trim().toLowerCase(), r.person.trim());
    }
  }
  const people: PersonStats[] = [];
  for (const original of names.values()) {
    const stats = personStats(records, original);
    if (stats) people.push(stats);
  }
  people.sort((a, b) => b.balance - a.balance);
  return people;
}

function categoryTotals(records: TransactionRecord[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const r of records) {
    if (r.type !== "expense") continue;
    const key = (r.category ?? r.description ?? "دیگر").trim().toLowerCase();
    totals.set(key, (totals.get(key) ?? 0) + r.amount);
  }
  return totals;
}

// ---------------------------------------------------------------------------
// Urdu response templates (deterministic — never generated by the LLM)
// ---------------------------------------------------------------------------

function rupees(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)} روپے`;
}

const PERIOD_PHRASE: Record<Period, string> = {
  today: "آج",
  this_week: "اس ہفتے",
  this_month: "اس مہینے",
  all_time: "اب تک",
};

export function confirmationFor(t: {
  amount: number;
  type: TransactionType;
  person?: string | null;
  category?: string | null;
  description?: string | null;
}): string {
  // Conversational combined form per the product spec: acknowledgement +
  // explicit "saved to the ledger" confirmation in one sentence. Only built
  // AFTER the transaction is stored — never implies success early. If a
  // client-side spoken acknowledgement is added later, split the «جی، میں نے
  // سن لیا اور» prefix out of these templates.
  const label = t.description?.trim() || t.category?.trim() || "";
  const ACK = "جی، میں نے سن لیا اور";
  switch (t.type) {
    case "expense":
      return label
        ? `${ACK} ${rupees(t.amount)} ${label} کے خرچے میں ڈال دیے ہیں۔`
        : `${ACK} ${rupees(t.amount)} خرچے میں ڈال دیے ہیں۔`;
    case "income":
      return `${ACK} ${rupees(t.amount)} آمدن میں شامل کر دیے ہیں۔`;
    case "given":
      return `${ACK} ${rupees(t.amount)} ${t.person} کے کھاتے میں ڈال دیے ہیں۔`;
    case "received":
      return `${ACK} ${t.person} سے ${rupees(t.amount)} واپس کھاتے میں شامل کر دیے ہیں۔`;
  }
}

const PERSON_NOT_FOUND = (person: string) =>
  `${person} کا کوئی حساب نہیں ملا۔`;

export function runFinanceQuery(
  records: TransactionRecord[],
  query: FinanceQuery,
): QueryOutcome {
  const period: Period = query.period ?? "all_time";
  const phrase = PERIOD_PHRASE[period];
  const scoped = filterByPeriod(records, period);

  switch (query.query_type) {
    case "total_expenses": {
      const total = summarize(scoped).expenses;
      return {
        result: { period, total },
        responseText:
          period === "all_time"
            ? `آپ نے اب تک ${rupees(total)} خرچ کیے ہیں۔`
            : `آپ نے ${phrase} ${rupees(total)} خرچ کیے ہیں۔`,
      };
    }

    case "total_income": {
      const total = summarize(scoped).income;
      return {
        result: { period, total },
        responseText: `${phrase} آپ کی آمدن ${rupees(total)} ہے۔`,
      };
    }

    case "person_given": {
      if (!query.person) {
        return {
          result: {},
          responseText: "نام سمجھ نہیں آیا، دوبارہ بولیں۔",
        };
      }
      const stats = personStats(scoped, query.person);
      if (!stats) {
        return {
          result: { person: query.person },
          responseText: PERSON_NOT_FOUND(query.person),
        };
      }
      return {
        result: { person: stats.person, given: stats.given },
        responseText: `آپ نے ${stats.person} کو کل ${rupees(stats.given)} دیے ہیں۔`,
      };
    }

    case "person_received": {
      if (!query.person) {
        return {
          result: {},
          responseText: "نام سمجھ نہیں آیا، دوبارہ بولیں۔",
        };
      }
      const stats = personStats(scoped, query.person);
      if (!stats) {
        return {
          result: { person: query.person },
          responseText: PERSON_NOT_FOUND(query.person),
        };
      }
      return {
        result: { person: stats.person, received: stats.received },
        responseText: `${stats.person} سے آپ کو کل ${rupees(stats.received)} واپس ملے ہیں۔`,
      };
    }

    case "person_balance": {
      if (!query.person) {
        return {
          result: {},
          responseText: "نام سمجھ نہیں آیا، دوبارہ بولیں۔",
        };
      }
      const stats = personStats(scoped, query.person);
      if (!stats) {
        return {
          result: { person: query.person },
          responseText: PERSON_NOT_FOUND(query.person),
        };
      }
      const { person, given, received, balance } = stats;
      let responseText: string;
      if (balance > 0) {
        responseText = `${person} کے ذمے ابھی ${rupees(balance)} ہیں۔`;
      } else if (balance === 0) {
        responseText = `${person} کا حساب برابر ہے۔`;
      } else {
        responseText = `آپ کے ذمے ${person} کے ${rupees(Math.abs(balance))} ہیں۔`;
      }
      return { result: { person, given, received, balance }, responseText };
    }

    case "today_summary": {
      const todays = filterByPeriod(records, "today");
      const totals = summarize(todays);
      return {
        result: { period: "today", ...totals },
        responseText: `آج آپ نے ${rupees(totals.expenses)} خرچ کیے اور آمدن ${rupees(totals.income)} رہی۔`,
      };
    }

    case "monthly_summary": {
      const monthly = filterByPeriod(records, "this_month");
      const totals = summarize(monthly);
      return {
        result: { period: "this_month", ...totals },
        responseText: `اس مہینے آپ نے ${rupees(totals.expenses)} خرچ کیے اور آمدن ${rupees(totals.income)} رہی۔`,
      };
    }

    case "category_summary": {
      const totals = categoryTotals(scoped);
      if (query.category) {
        const key = query.category.trim().toLowerCase();
        const total = totals.get(key) ?? 0;
        return {
          result: { period, category: query.category, total },
          responseText:
            total > 0
              ? `${phrase} ${query.category} پر ${rupees(total)} خرچ ہوئے ہیں۔`
              : `${phrase} ${query.category} پر کوئی خرچہ نہیں ملا۔`,
        };
      }
      let topCategory: string | null = null;
      let topAmount = 0;
      for (const [category, amount] of totals) {
        if (amount > topAmount) {
          topCategory = category;
          topAmount = amount;
        }
      }
      if (!topCategory) {
        return {
          result: { period, categories: {} },
          responseText: `${phrase} کوئی خرچہ نہیں ملا۔`,
        };
      }
      return {
        result: {
          period,
          topCategory,
          topAmount,
          categories: Object.fromEntries(totals),
        },
        responseText: `${phrase} سب سے زیادہ خرچ ${topCategory} پر ہوا، ${rupees(topAmount)}۔`,
      };
    }

    case "recent_transactions": {
      const recent = [...scoped]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 5);
      return {
        result: { transactions: recent },
        responseText:
          recent.length === 0
            ? "ابھی کوئی اندراج نہیں ہے۔"
            : `آپ کے آخری ${recent.length} اندراج اسکرین پر موجود ہیں۔`,
      };
    }
  }
}
