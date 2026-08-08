---
name: Expo web preview blanks while Google Fonts download
description: Why Awaz Khata web screenshots come back solid white and how to handle it
---
The Expo web preview renders nothing (splash gate returns null) until every `useFonts` TTF finishes downloading through the dev proxy. The Urdu Nastaliq + Inter set is ~2.5 MB, and each screenshot session starts with a cold cache, so the first screenshot attempts after a workflow restart often capture a solid white page even though Metro bundled fine and browser logs show "Running application".

**Why:** expo-google-fonts on web fetches TTFs at runtime from the Metro asset endpoint; the dev proxy is slow ("Slow network is detected" in browser console). On device (Expo Go / production) fonts are local assets, so this is a dev-web artifact only.

**How to apply:** If a web screenshot of the Expo app is blank but workflow logs show a successful bundle, wait ~20–30 s and retry before debugging code. Don't weaken the `useFonts` + SplashScreen gating to "fix" it.
