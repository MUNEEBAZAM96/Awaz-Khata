import { Router, type IRouter } from "express";
import multer from "multer";
import {
  ExtractIntentBody,
  SpeakTextBody,
  TranscribeAudioResponse,
  SpeakTextResponse,
} from "@workspace/api-zod";
import {
  getUpliftClient,
  DEFAULT_VOICE_ID,
  sttLanguageFor,
  UpliftAIError,
  UpliftAIAuthError,
  UpliftAIRateLimitError,
  UpliftAIInsufficientBalanceError,
} from "../lib/uplift";
import { extractIntent, IntentValidationError } from "../lib/llm";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/voice/transcribe
// Converts an uploaded audio recording to text via Uplift AI STT.
// ---------------------------------------------------------------------------
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  req.log.info("[VOICE] transcribe request received");

  const file = req.file;
  if (!file || file.size === 0) {
    req.log.warn("[VOICE] no audio data in request");
    res.status(400).json({ error: "آواز موصول نہیں ہوئی، دوبارہ کوشش کریں۔" });
    return;
  }

  // fileName must match the actual audio format — never relabel it.
  // Uplift uses the extension for format detection when receiving a Buffer.
  const fileName =
    file.originalname && file.originalname.includes(".")
      ? file.originalname
      : "recording.m4a";

  req.log.info(
    { filename: fileName, mime: file.mimetype, bytes: file.size },
    "[VOICE] audio received",
  );

  // Accept an optional language field from the multipart form body.
  // The field holds the app's internal language code (ur/hi/pa/skr/en).
  // Defaults to Urdu when absent.
  const appLanguage =
    typeof req.body?.["language"] === "string"
      ? (req.body["language"] as string).trim()
      : "ur";
  const sttLanguage = sttLanguageFor(appLanguage);

  try {
    const client = getUpliftClient();
    req.log.info(
      { model: "scribe", requestedLanguage: appLanguage, sttLanguage },
      "[VOICE] STT request started",
    );

    // The Uplift SDK's `language` field currently only accepts "ur". We log
    // the user's selected language above for observability; when Uplift adds
    // support for more language codes the mapping in uplift.ts will take
    // effect without touching this call site.
    const { transcript } = await client.stt.transcribe({
      file: file.buffer,
      fileName, // required for format detection when passing a Buffer
      model: "scribe",
      language: "ur",
    });

    if (!transcript || !transcript.trim()) {
      req.log.warn("[VOICE] STT returned empty transcript — no speech detected");
      res.status(502).json({ error: "آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔" });
      return;
    }

    req.log.info({ chars: transcript.length }, "[VOICE] STT success");
    res.json(TranscribeAudioResponse.parse({ text: transcript }));
  } catch (err) {
    if (err instanceof UpliftAIAuthError) {
      req.log.error(
        { requestId: err.requestId, code: "STT_AUTH_ERROR" },
        "[VOICE] Uplift STT authentication failed — check UPLIFTAI_API_KEY",
      );
      res.status(502).json({ error: "آواز کی سروس دستیاب نہیں، دوبارہ کوشش کریں۔" });
    } else if (err instanceof UpliftAIRateLimitError) {
      req.log.warn(
        { requestId: err.requestId, code: "STT_RATE_LIMIT" },
        "[VOICE] Uplift STT rate limit",
      );
      res
        .status(429)
        .json({ error: "سروس مصروف ہے، تھوڑی دیر بعد دوبارہ کوشش کریں۔" });
    } else if (err instanceof UpliftAIInsufficientBalanceError) {
      req.log.error(
        { requestId: err.requestId, code: "STT_BALANCE_ERROR" },
        "[VOICE] Uplift STT insufficient balance",
      );
      res.status(502).json({ error: "آواز کی سروس دستیاب نہیں، دوبارہ کوشش کریں۔" });
    } else if (err instanceof UpliftAIError) {
      req.log.error(
        {
          statusCode: err.statusCode,
          code: err.code ?? "STT_PROVIDER_ERROR",
          requestId: err.requestId,
        },
        "[VOICE] Uplift STT provider error",
      );
      res.status(502).json({ error: "آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔" });
    } else {
      req.log.error({ err }, "[VOICE] STT unexpected error");
      res.status(502).json({ error: "آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔" });
    }
  }
});

// ---------------------------------------------------------------------------
// POST /api/voice/extract
// Extracts a structured financial intent from a transcript via LLM.
// ---------------------------------------------------------------------------
router.post("/extract", async (req, res) => {
  const body = ExtractIntentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
    return;
  }

  req.log.info({ chars: body.data.text.length }, "[VOICE] extraction started");

  try {
    const intent = await extractIntent(body.data.text);
    req.log.info({ mode: intent.mode }, "[VOICE] extraction success");
    res.json(intent);
  } catch (err) {
    req.log.error({ err }, "[VOICE] extraction failed");
    if (err instanceof IntentValidationError) {
      res
        .status(502)
        .json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
      return;
    }
    res.status(502).json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/voice/speak
// Converts a text string to Urdu speech via Uplift AI TTS.
// TTS failure must NOT undo a previously saved transaction — callers handle
// TTS errors separately from transaction errors.
// ---------------------------------------------------------------------------
router.post("/speak", async (req, res) => {
  const body = SpeakTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "بولنے کے لیے کوئی جملہ نہیں ملا۔" });
    return;
  }

  req.log.info({ chars: body.data.text.length }, "[VOICE] TTS started");

  try {
    const client = getUpliftClient();
    const { audio, metadata } = await client.tts.create({
      text: body.data.text,
      voiceId: DEFAULT_VOICE_ID,
      outputFormat: "MP3_22050_128",
    });
    req.log.info("[VOICE] TTS success");
    res.json(
      SpeakTextResponse.parse({
        audio: audio.toString("base64"),
        contentType: metadata?.contentType ?? "audio/mpeg",
      }),
    );
  } catch (err) {
    if (err instanceof UpliftAIAuthError) {
      req.log.error(
        { requestId: err.requestId, code: "TTS_AUTH_ERROR" },
        "[VOICE] Uplift TTS authentication failed",
      );
    } else if (err instanceof UpliftAIRateLimitError) {
      req.log.warn(
        { requestId: err.requestId, code: "TTS_RATE_LIMIT" },
        "[VOICE] Uplift TTS rate limit",
      );
    } else if (err instanceof UpliftAIError) {
      req.log.error(
        {
          statusCode: err.statusCode,
          code: err.code ?? "TTS_PROVIDER_ERROR",
          requestId: err.requestId,
        },
        "[VOICE] Uplift TTS provider error",
      );
    } else {
      req.log.error({ err }, "[VOICE] TTS unexpected error");
    }
    res.status(502).json({ error: "جواب نہیں بن سکا، دوبارہ کوشش کریں۔" });
  }
});

export default router;
