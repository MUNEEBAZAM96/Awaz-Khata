import { Router, type IRouter } from "express";
import { AskAdvisorBody, AskAdvisorResponse } from "@workspace/api-zod";
import { readAll } from "../lib/store";
import { buildFinancialSnapshot } from "../lib/finance";
import { adviseOnFinances } from "../lib/llm";

const router: IRouter = Router();

const INVALID_QUESTION = "سوال سمجھ نہیں آیا، دوبارہ لکھیں۔";
const EMPTY_LEDGER_ANSWER =
  "ابھی آپ کے کھاتے میں کوئی اندراج نہیں ہے۔ پہلے ہوم پر مائیک دبا کر اپنے خرچے اور آمدن بتائیں، پھر میں آپ کے اصل حساب سے مشورہ دے سکوں گا۔";
const ADVISOR_FAILED = "ابھی جواب نہیں بن سکا، تھوڑی دیر بعد دوبارہ پوچھیں۔";

router.post("/", async (req, res) => {
  const parsed = AskAdvisorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: INVALID_QUESTION });
    return;
  }

  const records = await readAll();
  if (records.length === 0) {
    // Deterministic Urdu answer — no LLM call for an empty ledger.
    res.json(AskAdvisorResponse.parse({ answer: EMPTY_LEDGER_ANSWER }));
    return;
  }

  const snapshot = buildFinancialSnapshot(records);
  try {
    const answer = await adviseOnFinances(
      parsed.data.message,
      snapshot,
      parsed.data.history ?? [],
    );
    res.json(AskAdvisorResponse.parse({ answer }));
  } catch (err) {
    req.log.error({ err }, "finance advisor failed");
    res.status(502).json({ error: ADVISOR_FAILED });
  }
});

export default router;
