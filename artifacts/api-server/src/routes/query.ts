import { Router, type IRouter } from "express";
import { RunQueryBody, RunQueryResponse } from "@workspace/api-zod";
import { readAll } from "../lib/store";
import { runFinanceQuery } from "../lib/finance";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  const body = RunQueryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
    return;
  }
  const records = await readAll();
  const outcome = runFinanceQuery(records, body.data);
  res.json(RunQueryResponse.parse(outcome));
});

export default router;
