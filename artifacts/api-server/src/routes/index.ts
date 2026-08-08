import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voiceRouter from "./voice";
import ledgerRouter from "./ledger";

const router: IRouter = Router();

router.use(healthRouter);
router.use(voiceRouter);
router.use(ledgerRouter);

export default router;
