import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // On exFAT/network volumes macOS writes AppleDouble sidecars (`._foo.ts`)
    // next to every file. They are binary, so collecting `._*.test.ts` fails
    // the run with `Unexpected "\x00"`. Mirrors the Metro blockList in the
    // Expo app.
    exclude: ["**/node_modules/**", "**/dist/**", "**/._*"],
  },
});
