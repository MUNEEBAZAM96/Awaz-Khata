import { Router, type IRouter } from "express";
import {
  CreateTransactionBody,
  CreateTransactionResponse,
  ListCustomersResponse,
  GetCustomerLedgerResponse,
} from "@workspace/api-zod";
import { addTransaction, listCustomers, getCustomer } from "../lib/store";

const router: IRouter = Router();

router.post("/transactions", async (req, res) => {
  const body = CreateTransactionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({
      error:
        "Invalid transaction: requires customer (string), amount (number), type ('credit'|'payment'), optional item",
    });
    return;
  }
  if (body.data.amount <= 0) {
    res.status(400).json({ error: "Amount must be greater than zero" });
    return;
  }
  const record = await addTransaction(body.data);
  res.status(201).json(CreateTransactionResponse.parse(record));
});

router.get("/transactions", async (_req, res) => {
  const customers = await listCustomers();
  res.json(ListCustomersResponse.parse({ customers }));
});

router.get("/transactions/:customer", async (req, res) => {
  const summary = await getCustomer(req.params["customer"] ?? "");
  if (!summary) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(GetCustomerLedgerResponse.parse(summary));
});

export default router;
