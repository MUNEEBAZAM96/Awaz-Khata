import { Router, type IRouter } from "express";
import multer from "multer";
import {
  ExtractIntentBody,
  SpeakTextBody,
  TranscribeAudioResponse,
  SpeakTextResponse,
} from "@workspace/api-zod";
import { getUpliftClient, DEFAULT_VOICE_ID } from "../lib/uplift";
import { extractIntent } from "../lib/llm";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router: IRouter = Router();

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  const file = req.file;
  if (!file || file.size === 0) {
    res.status(400).json({ error: "Missing audio file (field name 'audio')" });
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
      fileName,
      language: "ur",
    });
    res.json(TranscribeAudioResponse.parse({ text: transcript }));
  } catch (err) {
    req.log.error({ err }, "Speech-to-text failed");
    res.status(502).json({
      error:
        "Speech-to-text failed. The Uplift AI STT service is in beta — please try again.",
    });
  }
});

router.post("/extract", async (req, res) => {
  const body = ExtractIntentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Request must include non-empty 'text'" });
    return;
  }
  try {
    const intent = await extractIntent(body.data.text);
    res.json(intent);
  } catch (err) {
    req.log.error({ err }, "Intent extraction failed");
    const message =
      err instanceof Error ? err.message : "Intent extraction failed";
    res.status(502).json({ error: message });
  }
});

router.post("/speak", async (req, res) => {
  const body = SpeakTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Request must include non-empty 'text'" });
    return;
  }
  try {
    const client = getUpliftClient();
    const { audio } = await client.tts.create({
      text: body.data.text,
      voiceId: DEFAULT_VOICE_ID,
      outputFormat: "MP3_22050_128",
    });
    res.json(
      SpeakTextResponse.parse({
        audioBase64: audio.toString("base64"),
        mimeType: "audio/mpeg",
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Text-to-speech failed");
    res.status(502).json({ error: "Text-to-speech failed. Please try again." });
  }
});

export default router;
