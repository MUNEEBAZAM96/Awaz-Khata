import { UpliftAI } from "@upliftai/sdk-js";

let client: UpliftAI | null = null;

/** Default Uplift AI Urdu voice. Override with UPLIFTAI_VOICE_ID. */
export const DEFAULT_VOICE_ID = process.env["UPLIFTAI_VOICE_ID"] ?? "v_meklc281";

export function getUpliftClient(): UpliftAI {
  const apiKey = process.env["UPLIFTAI_API_KEY"];
  if (!apiKey) {
    throw new Error("UPLIFTAI_API_KEY is not configured");
  }
  if (!client) {
    client = new UpliftAI({ apiKey });
  }
  return client;
}
