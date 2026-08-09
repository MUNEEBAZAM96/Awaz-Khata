import { Router, type IRouter } from "express";
import {
  CreateTransactionBody,
  CreateTransactionResponse,
  ListTransactionsResponse,
  GetPersonLedgerResponse,
  UpdateTransactionBody,
  UpdateTransactionResponse,
  DeleteTransactionResponse,
} from "@workspace/api-zod";
import {
  addTransaction,
  readAll,
  updateTransaction,
  deleteTransaction,
} from "../lib/store";
import { overallSummary, personStats, confirmationFor } from "../lib/finance";

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
      summary: overallSummary(records),
    }),
  );
});

router.patch("/:id", async (req, res) => {
  const body = UpdateTransactionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "تبدیلی سمجھ نہیں آئی، دوبارہ کوشش کریں۔" });
    return;
  }
  const patch = body.data;
  if (patch.amount !== undefined && patch.amount <= 0) {
    res.status(400).json({ error: "رقم سمجھ نہیں آئی، دوبارہ بولیں۔" });
    return;
  }

  // Mirror the create-time rule: a given/received entry is meaningless
  // without a person. Check against the merged result, because the patch
  // may change only the type or only the person.
  const existing = (await readAll()).find((r) => r.id === req.params["id"]);
  if (!existing) {
    res.status(404).json({ error: "یہ اندراج نہیں ملا۔" });
    return;
  }
  const nextType = patch.type ?? existing.type;
  const nextPerson =
    patch.person !== undefined ? patch.person : existing.person;
  if ((nextType === "given" || nextType === "received") && !nextPerson?.trim()) {
    res.status(400).json({ error: "نام سمجھ نہیں آیا، دوبارہ بولیں۔" });
    return;
  }

  const updated = await updateTransaction(req.params["id"] ?? "", patch);
  if (!updated) {
    res.status(404).json({ error: "یہ اندراج نہیں ملا۔" });
    return;
  }
  res.json(UpdateTransactionResponse.parse({ transaction: updated }));
});

router.delete("/:id", async (req, res) => {
  const id = req.params["id"] ?? "";
  const removed = await deleteTransaction(id);
  if (!removed) {
    res.status(404).json({ error: "یہ اندراج نہیں ملا۔" });
    return;
  }
  res.json(DeleteTransactionResponse.parse({ deleted: true, id }));
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
