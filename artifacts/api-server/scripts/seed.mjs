// Seed realistic demo data for Awaz Khata.
// Usage: pnpm --filter @workspace/api-server run seed   (or: node scripts/seed.mjs)
//
// Dates are generated relative to "now" in PKT (UTC+5), so today / this-week /
// this-month queries always have interesting answers no matter when it runs.
// NOTE: علی is intentionally NOT seeded — the live demo script creates his
// ledger by voice («میں نے علی کو دو ہزار روپے دیے» → balance 1500 stays clean).

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Same location the API server uses: <api-server>/data/transactions.json
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const dataFile = path.join(dataDir, "transactions.json");

/** ISO timestamp for a PKT wall-clock time `daysAgo` days back. */
function pktTime(daysAgo, hour, minute = 0) {
  const nowPkt = new Date(Date.now() + PKT_OFFSET_MS);
  const utcMs =
    Date.UTC(
      nowPkt.getUTCFullYear(),
      nowPkt.getUTCMonth(),
      nowPkt.getUTCDate() - daysAgo,
      hour,
      minute,
    ) - PKT_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

//                 daysAgo hh  mm  amount  type        person   category     description
const rows = [
  [7, 10, 0, 50000, "income", null, null, "تنخواہ"],
  [6, 13, 0, 5000, "given", "احمد", null, "دکان کے لیے ادھار"],
  [6, 17, 30, 3000, "expense", null, "shopping", "کپڑے"],
  [5, 12, 0, 1500, "given", "حسن", null, "ادھار"],
  [3, 11, 0, 2500, "expense", null, "bills", "بجلی کا بل"],
  [2, 9, 15, 600, "expense", null, "transport", "رکشہ کرایہ"],
  [2, 16, 0, 2000, "received", "احمد", null, null],
  [1, 10, 30, 1200, "expense", null, "groceries", "سبزی اور گوشت"],
  [1, 15, 0, 5000, "income", null, null, "فری لانس کام"],
  [1, 18, 0, 1500, "received", "حسن", null, null],
  [0, 9, 0, 350, "expense", null, "food", "چائے اور ناشتہ"],
  [0, 11, 15, 250, "expense", null, "groceries", "دودھ اور انڈے"],
];

const records = rows.map(([daysAgo, hh, mm, amount, type, person, category, description]) => ({
  id: randomUUID(),
  amount,
  type,
  person,
  category,
  description,
  timestamp: pktTime(daysAgo, hh, mm),
}));

await fs.mkdir(dataDir, { recursive: true });
await fs.writeFile(dataFile, JSON.stringify(records, null, 2), "utf-8");

const sum = (t) => records.filter((r) => r.type === t).reduce((a, r) => a + r.amount, 0);
console.log(`Seeded ${records.length} transactions → ${dataFile}`);
console.log(
  `income ${sum("income")} | expenses ${sum("expense")} | given ${sum("given")} | received ${sum("received")}`,
);
console.log("People: احمد (باقی 3000), حسن (برابر) — علی demo کے لیے خالی ہے");
