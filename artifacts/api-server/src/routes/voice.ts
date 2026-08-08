import { Router, type IRouter } from "express";
import multer from "multer";
import {
  ExtractIntentBody,
  SpeakTextBody,
  TranscribeAudioResponse,
  SpeakTextResponse,
} from "@workspace/api-zod";
import { getUpliftClient, DEFAULT_VOICE_ID } from "../lib/uplift";
import { extractIntent, IntentValidationError } from "../lib/llm";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router: IRouter = Router();

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  const file = req.file;
  if (!file || file.size === 0) {
    res.status(400).json({ error: "آواز موصول نہیں ہوئی، دوبارہ کوشش کریں۔" });
    return;
  }
  try {
    const client = getUpliftClient();
    const fileName =
      file.originalname && file.originalname.includes(".")
        ? file.originalname
        : "recording.m4a";
    const { transcript } = await client.stt.transcribe({
      file: file.buffer,
      fileName, // required for format detection when passing a Buffer
      model: "scribe",
      language: "ur",
    });
    if (!transcript || !transcript.trim()) {
      res.status(502).json({ error: "آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔" });
      return;
    }
    res.json(TranscribeAudioResponse.parse({ text: transcript }));
  } catch (err) {
    req.log.error({ err }, "Speech-to-text failed");
    res.status(502).json({ error: "آواز سمجھ نہیں آئی، دوبارہ کوشش کریں۔" });
  }
});

router.post("/extract", async (req, res) => {
  const body = ExtractIntentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
    return;
  }
  try {
    const intent = await extractIntent(body.data.text);
    res.json(intent);
  } catch (err) {
    req.log.error({ err }, "Intent extraction failed");
    if (err instanceof IntentValidationError) {
      res
        .status(502)
        .json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
      return;
    }
    res.status(502).json({ error: "میں آپ کی بات سمجھ نہیں سکا۔ دوبارہ بولیں۔" });
  }
});

router.post("/speak", async (req, res) => {
  const body = SpeakTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "بولنے کے لیے کوئی جملہ نہیں ملا۔" });
    return;
  }
  try {
    const client = getUpliftClient();
    const { audio, metadata } = await client.tts.create({
      text: body.data.text,
      voiceId: DEFAULT_VOICE_ID,
      outputFormat: "MP3_22050_128",
    });
    res.json(
      SpeakTextResponse.parse({
        audio: audio.toString("base64"),
        contentType: metadata?.contentType ?? "audio/mpeg",
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Text-to-speech failed");
    res.status(502).json({ error: "جواب نہیں بن سکا، دوبارہ کوشش کریں۔" });
  }
});

export default router;
