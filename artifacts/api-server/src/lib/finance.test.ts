import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TransactionRecord, TransactionType } from "./store";
import {
  confirmationFor,
  filterByPeriod,
  personStats,
  runFinanceQuery,
  summarize,
} from "./finance";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;
function tx(overrides: Partial<TransactionRecord> & {
  amount: number;
  type: TransactionType;
}): TransactionRecord {
  return {
    id: `t${++idCounter}`,
    person: null,
    category: null,
    description: null,
    timestamp: "2026-08-05T07:00:00.000Z",
    ...overrides,
  };
}

// Reference "now": Saturday 8 Aug 2026, 12:00 PKT = 07:00 UTC
const NOW = "2026-08-08T07:00:00.000Z";

// ---------------------------------------------------------------------------
// confirmationFor
// ---------------------------------------------------------------------------

describe("confirmationFor", () => {
  const ACK = "جی، میں نے سن لیا اور";

  it("expense without label", () => {
    expect(confirmationFor({ amount: 500, type: "expense" })).toBe(
      `${ACK} 500 روپے خرچے میں ڈال دیے ہیں۔`,
    );
  });

  it("expense with description label", () => {
    expect(
      confirmationFor({ amount: 250, type: "expense", description: "چائے" }),
    ).toBe(`${ACK} 250 روپے چائے کے خرچے میں ڈال دیے ہیں۔`);
  });

  it("expense falls back to category when description missing", () => {
    expect(
      confirmationFor({
        amount: 100,
        type: "expense",
        description: "  ",
        category: "کھانا",
      }),
    ).toBe(`${ACK} 100 روپے کھانا کے خرچے میں ڈال دیے ہیں۔`);
  });

  it("income", () => {
    expect(confirmationFor({ amount: 20000, type: "income" })).toBe(
      `${ACK} 20000 روپے آمدن میں شامل کر دیے ہیں۔`,
    );
  });

  it("given includes person", () => {
    expect(
      confirmationFor({ amount: 1000, type: "given", person: "علی" }),
    ).toBe(`${ACK} 1000 روپے علی کے کھاتے میں ڈال دیے ہیں۔`);
  });

  it("received includes person", () => {
    expect(
      confirmationFor({ amount: 300, type: "received", person: "احمد" }),
    ).toBe(`${ACK} احمد سے 300 روپے واپس کھاتے میں شامل کر دیے ہیں۔`);
  });

  it("formats fractional amounts with two decimals", () => {
    expect(confirmationFor({ amount: 99.5, type: "income" })).toContain(
      "99.50 روپے",
    );
  });

  it("rounds sub-paisa noise to a clean integer", () => {
    expect(confirmationFor({ amount: 100.004, type: "income" })).toContain(
      "100 روپے",
    );
  });
});

// ---------------------------------------------------------------------------
// filterByPeriod — Pakistan Standard Time (UTC+5) edges
// ---------------------------------------------------------------------------

describe("filterByPeriod (PKT edges)", () => {
  it("all_time returns everything", () => {
    const records = [tx({ amount: 1, type: "expense", timestamp: "1999-01-01T00:00:00.000Z" })];
    expect(filterByPeriod(records, "all_time", NOW)).toHaveLength(1);
  });

  it("today: 19:01 UTC previous day IS today in PKT (00:01 PKT)", () => {
    const r = tx({ amount: 1, type: "expense", timestamp: "2026-08-07T19:01:00.000Z" });
    expect(filterByPeriod([r], "today", NOW)).toHaveLength(1);
  });

  it("today: 18:59 UTC previous day is yesterday in PKT", () => {
    const r = tx({ amount: 1, type: "expense", timestamp: "2026-08-07T18:59:00.000Z" });
    expect(filterByPeriod([r], "today", NOW)).toHaveLength(0);
  });

  it("this_week: Monday 00:00 PKT (Sun 19:00 UTC) is included", () => {
    // Week of NOW starts Monday 3 Aug 2026 PKT => 2026-08-02T19:00Z
    const r = tx({ amount: 1, type: "expense", timestamp: "2026-08-02T19:00:00.000Z" });
    expect(filterByPeriod([r], "this_week", NOW)).toHaveLength(1);
  });

  it("this_week: just before Monday 00:00 PKT is excluded", () => {
    const r = tx({ amount: 1, type: "expense", timestamp: "2026-08-02T18:59:59.000Z" });
    expect(filterByPeriod([r], "this_week", NOW)).toHaveLength(0);
  });

  it("this_week: future records beyond Sunday are excluded", () => {
    // Next Monday 10 Aug 00:00 PKT = 2026-08-09T19:00Z
    const r = tx({ amount: 1, type: "expense", timestamp: "2026-08-09T19:00:00.000Z" });
    expect(filterByPeriod([r], "this_week", NOW)).toHaveLength(0);
  });

  it("this_week: Sunday end of week is included", () => {
    // Sunday 9 Aug 2026, 23:00 PKT = 18:00 UTC
    const r = tx({ amount: 1, type: "expense", timestamp: "2026-08-09T18:00:00.000Z" });
    expect(filterByPeriod([r], "this_week", NOW)).toHaveLength(1);
  });

  it("this_month: 1st of month 00:00 PKT included, prior month excluded", () => {
    // 1 Aug 2026 00:00 PKT = 31 Jul 19:00 UTC
    const inMonth = tx({ amount: 1, type: "expense", timestamp: "2026-07-31T19:00:00.000Z" });
    const prevMonth = tx({ amount: 1, type: "expense", timestamp: "2026-07-31T18:59:00.000Z" });
    const out = filterByPeriod([inMonth, prevMonth], "this_month", NOW);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(inMonth);
  });

  it("this_month: same month previous year excluded", () => {
    const r = tx({ amount: 1, type: "expense", timestamp: "2025-08-08T07:00:00.000Z" });
    expect(filterByPeriod([r], "this_month", NOW)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// summarize
// ---------------------------------------------------------------------------

describe("summarize", () => {
  it("sums each transaction type independently", () => {
    const records = [
      tx({ amount: 100, type: "expense" }),
      tx({ amount: 50, type: "expense" }),
      tx({ amount: 2000, type: "income" }),
      tx({ amount: 300, type: "given", person: "علی" }),
      tx({ amount: 120, type: "received", person: "علی" }),
    ];
    expect(summarize(records)).toEqual({
      income: 2000,
      expenses: 150,
      given: 300,
      received: 120,
    });
  });

  it("empty ledger totals are zero", () => {
    expect(summarize([])).toEqual({ income: 0, expenses: 0, given: 0, received: 0 });
  });
});

// ---------------------------------------------------------------------------
// personStats
// ---------------------------------------------------------------------------

describe("personStats", () => {
  const records = [
    tx({ amount: 500, type: "given", person: "Ali", timestamp: "2026-08-01T07:00:00.000Z" }),
    tx({ amount: 200, type: "received", person: "ali ", timestamp: "2026-08-02T07:00:00.000Z" }),
    tx({ amount: 100, type: "given", person: "Bilal", timestamp: "2026-08-03T07:00:00.000Z" }),
  ];

  it("matches case-insensitively and trims", () => {
    const stats = personStats(records, "ALI");
    expect(stats).not.toBeNull();
    expect(stats!.given).toBe(500);
    expect(stats!.received).toBe(200);
    expect(stats!.balance).toBe(300);
  });

  it("uses most recent record's spelling as display name", () => {
    expect(personStats(records, "ali")!.person).toBe("ali ");
  });

  it("sorts transactions newest first", () => {
    const stats = personStats(records, "ali")!;
    expect(stats.transactions.map((t) => t.timestamp)).toEqual([
      "2026-08-02T07:00:00.000Z",
      "2026-08-01T07:00:00.000Z",
    ]);
  });

  it("returns null for unknown person", () => {
    expect(personStats(records, "Zara")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// runFinanceQuery — spoken response texts
// ---------------------------------------------------------------------------

describe("runFinanceQuery", () => {
  const records = [
    tx({ amount: 400, type: "expense", category: "کھانا", timestamp: "2026-08-08T05:00:00.000Z" }),
    tx({ amount: 100, type: "expense", category: "چائے", timestamp: "2026-08-08T06:00:00.000Z" }),
    tx({ amount: 5000, type: "income", timestamp: "2026-08-08T04:00:00.000Z" }),
    tx({ amount: 900, type: "expense", category: "کھانا", timestamp: "2026-08-01T07:00:00.000Z" }),
    tx({ amount: 1000, type: "given", person: "علی", timestamp: "2026-08-05T07:00:00.000Z" }),
    tx({ amount: 400, type: "received", person: "علی", timestamp: "2026-08-06T07:00:00.000Z" }),
  ];

  it("total_expenses all_time", () => {
    const out = runFinanceQuery(records, { query_type: "total_expenses" });
    expect(out.result).toEqual({ period: "all_time", total: 1400 });
    expect(out.responseText).toBe("آپ نے اب تک 1400 روپے خرچ کیے ہیں۔");
  });

  it("total_expenses with period phrase", () => {
    const out = runFinanceQuery(records, {
      query_type: "total_expenses",
      period: "this_month",
    });
    expect(out.responseText).toBe("آپ نے اس مہینے 1400 روپے خرچ کیے ہیں۔");
  });

  it("total_income", () => {
    const out = runFinanceQuery(records, {
      query_type: "total_income",
      period: "this_month",
    });
    expect(out.result).toEqual({ period: "this_month", total: 5000 });
    expect(out.responseText).toBe("اس مہینے آپ کی آمدن 5000 روپے ہے۔");
  });

  it("person_given", () => {
    const out = runFinanceQuery(records, {
      query_type: "person_given",
      person: "علی",
    });
    expect(out.result).toEqual({ person: "علی", given: 1000 });
    expect(out.responseText).toBe("آپ نے علی کو کل 1000 روپے دیے ہیں۔");
  });

  it("person_received", () => {
    const out = runFinanceQuery(records, {
      query_type: "person_received",
      person: "علی",
    });
    expect(out.responseText).toBe("علی سے آپ کو کل 400 روپے واپس ملے ہیں۔");
  });

  it("person_balance positive (they owe you)", () => {
    const out = runFinanceQuery(records, {
      query_type: "person_balance",
      person: "علی",
    });
    expect(out.result).toMatchObject({ balance: 600 });
    expect(out.responseText).toBe("علی کے ذمے ابھی 600 روپے ہیں۔");
  });

  it("person_balance zero", () => {
    const even = [
      tx({ amount: 100, type: "given", person: "احمد" }),
      tx({ amount: 100, type: "received", person: "احمد" }),
    ];
    const out = runFinanceQuery(even, {
      query_type: "person_balance",
      person: "احمد",
    });
    expect(out.responseText).toBe("احمد کا حساب برابر ہے۔");
  });

  it("person_balance negative (you owe them)", () => {
    const owe = [
      tx({ amount: 100, type: "given", person: "احمد" }),
      tx({ amount: 350, type: "received", person: "احمد" }),
    ];
    const out = runFinanceQuery(owe, {
      query_type: "person_balance",
      person: "احمد",
    });
    expect(out.responseText).toBe("آپ کے ذمے احمد کے 250 روپے ہیں۔");
  });

  it("person queries without a name ask to repeat", () => {
    for (const query_type of ["person_given", "person_received", "person_balance"] as const) {
      const out = runFinanceQuery(records, { query_type });
      expect(out.responseText).toBe("نام سمجھ نہیں آیا، دوبارہ بولیں۔");
    }
  });

  it("unknown person responds with not-found", () => {
    const out = runFinanceQuery(records, {
      query_type: "person_balance",
      person: "زارا",
    });
    expect(out.responseText).toBe("زارا کا کوئی حساب نہیں ملا۔");
  });

  it("category_summary for a named category", () => {
    const out = runFinanceQuery(records, {
      query_type: "category_summary",
      category: "کھانا",
    });
    expect(out.result).toMatchObject({ total: 1300 });
    expect(out.responseText).toBe("اب تک کھانا پر 1300 روپے خرچ ہوئے ہیں۔");
  });

  it("category_summary for a category with no spend", () => {
    const out = runFinanceQuery(records, {
      query_type: "category_summary",
      category: "سفر",
    });
    expect(out.responseText).toBe("اب تک سفر پر کوئی خرچہ نہیں ملا۔");
  });

  it("category_summary without category names the top category", () => {
    const out = runFinanceQuery(records, { query_type: "category_summary" });
    expect(out.result).toMatchObject({ topCategory: "کھانا", topAmount: 1300 });
    expect(out.responseText).toBe(
      "اب تک سب سے زیادہ خرچ کھانا پر ہوا، 1300 روپے۔",
    );
  });

  it("category_summary with no expenses at all", () => {
    const out = runFinanceQuery([], { query_type: "category_summary" });
    expect(out.responseText).toBe("اب تک کوئی خرچہ نہیں ملا۔");
  });

  it("recent_transactions caps at 5, newest first", () => {
    const many = Array.from({ length: 7 }, (_, i) =>
      tx({
        amount: i + 1,
        type: "expense",
        timestamp: `2026-08-0${i + 1}T07:00:00.000Z`,
      }),
    );
    const out = runFinanceQuery(many, { query_type: "recent_transactions" });
    const txs = out.result.transactions as TransactionRecord[];
    expect(txs).toHaveLength(5);
    expect(txs[0].amount).toBe(7);
    expect(out.responseText).toBe("آپ کے آخری 5 اندراج اسکرین پر موجود ہیں۔");
  });

  it("recent_transactions with empty ledger", () => {
    const out = runFinanceQuery([], { query_type: "recent_transactions" });
    expect(out.responseText).toBe("ابھی کوئی اندراج نہیں ہے۔");
  });

  describe("summaries (system time pinned to NOW)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(NOW));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    // Fixtures deliberately inside AND outside each period:
    // - today (8 Aug PKT): expenses 400+100=500, income 5000
    // - yesterday's expense (7 Aug) must be excluded from today
    // - this month: expenses 500+900+250=1650, income 5000
    // - July expense/income must be excluded from this month
    const summaryRecords = [
      ...records,
      tx({ amount: 250, type: "expense", timestamp: "2026-08-07T10:00:00.000Z" }),
      tx({ amount: 7777, type: "expense", timestamp: "2026-07-15T10:00:00.000Z" }),
      tx({ amount: 9999, type: "income", timestamp: "2026-07-15T10:00:00.000Z" }),
    ];

    it("today_summary speaks exact today-only totals", () => {
      const out = runFinanceQuery(summaryRecords, { query_type: "today_summary" });
      expect(out.result).toEqual({
        period: "today",
        income: 5000,
        expenses: 500,
        given: 0,
        received: 0,
      });
      expect(out.responseText).toBe(
        "آج آپ نے 500 روپے خرچ کیے اور آمدن 5000 روپے رہی۔",
      );
    });

    it("monthly_summary speaks exact this-month totals, excluding July", () => {
      const out = runFinanceQuery(summaryRecords, { query_type: "monthly_summary" });
      expect(out.result).toEqual({
        period: "this_month",
        income: 5000,
        expenses: 1650,
        given: 1000,
        received: 400,
      });
      expect(out.responseText).toBe(
        "اس مہینے آپ نے 1650 روپے خرچ کیے اور آمدن 5000 روپے رہی۔",
      );
    });

    it("total_expenses with period=today excludes yesterday", () => {
      const out = runFinanceQuery(summaryRecords, {
        query_type: "total_expenses",
        period: "today",
      });
      expect(out.result).toEqual({ period: "today", total: 500 });
      expect(out.responseText).toBe("آپ نے آج 500 روپے خرچ کیے ہیں۔");
    });
  });
});
