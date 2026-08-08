import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

export type TransactionType = "expense" | "income" | "given" | "received";

export interface TransactionRecord {
  id: string;
  amount: number;
  type: TransactionType;
  person: string | null;
  category: string | null;
  description: string | null;
  timestamp: string;
}

// Data directory lives next to the compiled server by default. AWAZ_DATA_DIR
// overrides it (tests point it at a temp directory).
const dataDir = process.env.AWAZ_DATA_DIR
  ? path.resolve(process.env.AWAZ_DATA_DIR)
  : path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const dataFile = path.join(dataDir, "transactions.json");

/**
 * Read the ledger. A missing file means an empty ledger; a corrupted or
 * unreadable file throws (never silently returns [] — that would let the
 * next write destroy the ledger).
 */
export async function readAll(): Promise<TransactionRecord[]> {
  let raw: string;
  try {
    raw = await fs.readFile(dataFile, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Ledger file is corrupted (expected a JSON array)");
  }
  return parsed as TransactionRecord[];
}

/** Atomic write: write to a temp file, then rename over the target. */
async function writeAllAtomic(records: TransactionRecord[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  const tmpFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(records, null, 2), "utf-8");
  await fs.rename(tmpFile, dataFile);
}

// Serialize all mutations through an in-process queue so concurrent requests
// can never interleave read-modify-write cycles and lose transactions.
let writeQueue: Promise<unknown> = Promise.resolve();

export function addTransaction(input: {
  amount: number;
  type: TransactionType;
  person?: string | null;
  category?: string | null;
  description?: string | null;
}): Promise<TransactionRecord> {
  const task = writeQueue.then(async () => {
    const record: TransactionRecord = {
      id: randomUUID(),
      amount: input.amount,
      type: input.type,
      person: input.person?.trim() || null,
      category: input.category?.trim() || null,
      description: input.description?.trim() || null,
      timestamp: new Date().toISOString(),
    };
    const records = await readAll();
    records.push(record);
    await writeAllAtomic(records);
    return record;
  });
  // Keep the queue alive even if this write fails.
  writeQueue = task.catch(() => undefined);
  return task;
}
