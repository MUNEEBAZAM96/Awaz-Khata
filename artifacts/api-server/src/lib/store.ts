import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

export interface TransactionRecord {
  id: string;
  customer: string;
  amount: number;
  type: "credit" | "payment";
  item: string | null;
  timestamp: string;
}

const dataDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
);
const dataFile = path.join(dataDir, "transactions.json");

async function readAll(): Promise<TransactionRecord[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TransactionRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(records: TransactionRecord[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(records, null, 2), "utf-8");
}

export async function addTransaction(input: {
  customer: string;
  amount: number;
  type: "credit" | "payment";
  item?: string | null;
}): Promise<TransactionRecord> {
  const record: TransactionRecord = {
    id: randomUUID(),
    customer: input.customer.trim(),
    amount: input.amount,
    type: input.type,
    item: input.item ?? null,
    timestamp: new Date().toISOString(),
  };
  const records = await readAll();
  records.push(record);
  await writeAll(records);
  return record;
}

export interface CustomerSummary {
  customer: string;
  balance: number;
  transactions: TransactionRecord[];
}

function balanceOf(transactions: TransactionRecord[]): number {
  return transactions.reduce(
    (sum, t) => sum + (t.type === "credit" ? t.amount : -t.amount),
    0,
  );
}

export async function listCustomers(): Promise<CustomerSummary[]> {
  const records = await readAll();
  const byCustomer = new Map<string, CustomerSummary>();
  for (const record of records) {
    const key = record.customer.trim().toLowerCase();
    let entry = byCustomer.get(key);
    if (!entry) {
      entry = { customer: record.customer.trim(), balance: 0, transactions: [] };
      byCustomer.set(key, entry);
    }
    entry.transactions.push(record);
  }
  const summaries = [...byCustomer.values()];
  for (const summary of summaries) {
    summary.transactions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    summary.balance = balanceOf(summary.transactions);
  }
  summaries.sort((a, b) => a.customer.localeCompare(b.customer, "ur"));
  return summaries;
}

export async function getCustomer(
  name: string,
): Promise<CustomerSummary | null> {
  const summaries = await listCustomers();
  const target = name.trim().toLowerCase();
  return (
    summaries.find((s) => s.customer.trim().toLowerCase() === target) ?? null
  );
}
