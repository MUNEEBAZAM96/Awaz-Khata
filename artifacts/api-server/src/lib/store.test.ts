import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

// store.ts resolves its data directory at import time from AWAZ_DATA_DIR, so
// the env var must be set before the module is first imported.
let dataDir: string;
let store: typeof import("./store");

beforeEach(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "awaz-store-"));
  process.env["AWAZ_DATA_DIR"] = dataDir;
  // Fresh module instance per test so the in-process write queue and the
  // resolved data path both point at this test's temp directory.
  vi.resetModules();
  store = await import("./store");
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
  delete process.env["AWAZ_DATA_DIR"];
});

describe("updateTransaction", () => {
  it("applies a partial edit and leaves other fields untouched", async () => {
    const created = await store.addTransaction({
      amount: 800,
      type: "expense",
      category: "پٹرول",
      description: "petrol",
    });

    const updated = await store.updateTransaction(created.id, { amount: 900 });

    expect(updated).not.toBeNull();
    expect(updated?.amount).toBe(900);
    expect(updated?.category).toBe("پٹرول");
    expect(updated?.description).toBe("petrol");
    expect(updated?.type).toBe("expense");
  });

  it("never changes id or timestamp", async () => {
    const created = await store.addTransaction({ amount: 100, type: "expense" });

    const updated = await store.updateTransaction(created.id, {
      amount: 250,
      type: "income",
    });

    expect(updated?.id).toBe(created.id);
    expect(updated?.timestamp).toBe(created.timestamp);
  });

  it("trims person and normalizes blank strings to null", async () => {
    const created = await store.addTransaction({
      amount: 2000,
      type: "given",
      person: "علی",
    });

    const trimmed = await store.updateTransaction(created.id, {
      person: "  احمد  ",
    });
    expect(trimmed?.person).toBe("احمد");

    const blanked = await store.updateTransaction(created.id, { person: "   " });
    expect(blanked?.person).toBeNull();
  });

  it("returns null for an unknown id and writes nothing", async () => {
    await store.addTransaction({ amount: 100, type: "expense" });

    const result = await store.updateTransaction("does-not-exist", {
      amount: 999,
    });

    expect(result).toBeNull();
    const all = await store.readAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.amount).toBe(100);
  });

  it("persists the edit to disk", async () => {
    const created = await store.addTransaction({ amount: 800, type: "expense" });
    await store.updateTransaction(created.id, { amount: 1250 });

    const raw = await fs.readFile(path.join(dataDir, "transactions.json"), "utf-8");
    expect(JSON.parse(raw)[0].amount).toBe(1250);
  });
});

describe("deleteTransaction", () => {
  it("removes the matching record and leaves the rest", async () => {
    const a = await store.addTransaction({ amount: 100, type: "expense" });
    const b = await store.addTransaction({ amount: 200, type: "income" });

    await expect(store.deleteTransaction(a.id)).resolves.toBe(true);

    const all = await store.readAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(b.id);
  });

  it("returns false for an unknown id without touching the ledger", async () => {
    await store.addTransaction({ amount: 100, type: "expense" });

    await expect(store.deleteTransaction("nope")).resolves.toBe(false);
    expect(await store.readAll()).toHaveLength(1);
  });
});

describe("write serialization", () => {
  it("does not lose writes when creates, edits and deletes interleave", async () => {
    const seed = await store.addTransaction({ amount: 1, type: "expense" });

    // Fire everything without awaiting in between — the in-process queue must
    // serialize these read-modify-write cycles.
    const results = await Promise.all([
      store.addTransaction({ amount: 2, type: "expense" }),
      store.addTransaction({ amount: 3, type: "expense" }),
      store.updateTransaction(seed.id, { amount: 10 }),
      store.addTransaction({ amount: 4, type: "expense" }),
    ]);

    expect(results.every(Boolean)).toBe(true);
    const all = await store.readAll();
    expect(all).toHaveLength(4);
    expect(all.find((r) => r.id === seed.id)?.amount).toBe(10);
    expect(all.map((r) => r.amount).sort((x, y) => x - y)).toEqual([2, 3, 4, 10]);
  });
});
