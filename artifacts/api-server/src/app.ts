import express, {
  type Express,
  type ErrorRequestHandler,
} from "express";
import cors from "cors";
import multer from "multer";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Every error — including Multer upload errors and async route failures —
// must reach the client as { error: "<Urdu message>" }, never Express's
// default HTML error page.
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  req.log?.error({ err }, "Unhandled error");
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: "آواز کی فائل قبول نہیں ہوئی، دوبارہ کوشش کریں۔" });
    return;
  }
  res.status(500).json({ error: "کچھ غلط ہو گیا، دوبارہ کوشش کریں۔" });
};
app.use(errorHandler);

export default app;
