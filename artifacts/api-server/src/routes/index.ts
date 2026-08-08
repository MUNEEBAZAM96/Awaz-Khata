import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voiceRouter from "./voice";
import transactionsRouter from "./transactions";
import queryRouter from "./query";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/voice", voiceRouter);
router.use("/transactions", transactionsRouter);
router.use("/query", queryRouter);

export default router;
