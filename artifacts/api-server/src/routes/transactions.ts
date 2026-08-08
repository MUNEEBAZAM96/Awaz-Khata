import { Router, type IRouter } from "express";
import {
  CreateTransactionBody,
  CreateTransactionResponse,
  ListTransactionsResponse,
  GetPersonLedgerResponse,
} from "@workspace/api-zod";
import { addTransaction, readAll } from "../lib/store";
import { summarize, personStats, confirmationFor } from "../lib/finance";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  const body = CreateTransactionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
    return;
  }
  const { amount, type, person } = body.data;
  if (amount <= 0) {
    res.status(400).json({ error: "رقم سمجھ نہیں آئی، دوبارہ بولیں۔" });
    return;
  }
  if ((type === "given" || type === "received") && !person?.trim()) {
    res.status(400).json({ error: "نام سمجھ نہیں آیا، دوبارہ بولیں۔" });
    return;
  }
  const transaction = await addTransaction(body.data);
  res.status(201).json(
    CreateTransactionResponse.parse({
      transaction,
      responseText: confirmationFor(transaction),
    }),
  );
});

router.get("/", async (_req, res) => {
  const records = await readAll();
  const transactions = [...records].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
  res.json(
    ListTransactionsResponse.parse({
      transactions,
      summary: summarize(records),
    }),
  );
});

router.get("/person/:person", async (req, res) => {
  const name = req.params["person"] ?? "";
  const records = await readAll();
  const stats = personStats(records, name);
  if (!stats) {
    res.status(404).json({ error: "اس نام کا کوئی حساب نہیں ملا۔" });
    return;
  }
  res.json(GetPersonLedgerResponse.parse(stats));
});

export default router;
