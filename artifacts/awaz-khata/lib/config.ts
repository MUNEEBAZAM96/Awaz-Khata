/**
 * Single source of truth for the API server origin.
 *
 * Two environments are supported:
 *  - Replit: the workflow sets `EXPO_PUBLIC_DOMAIN` to a bare host
 *    (`something.replit.dev`), always reachable over https.
 *  - Local dev: set `EXPO_PUBLIC_API_URL` to a full origin, e.g.
 *    `http://192.168.1.50:8080`. A phone running Expo Go needs the LAN IP of
 *    the machine running the API server — `localhost` resolves to the phone.
 *
 * `EXPO_PUBLIC_API_URL` wins when both are set.
 */
function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    const withScheme = /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
    return withScheme.replace(/\/+$/, '');
  }

  // Neither is set. On web, same-origin relative requests still work; on
  // native there is nothing to fall back to, so surface it loudly at startup
  // instead of failing later with "https://undefined/api/...".
  console.warn(
    'No API origin configured. Set EXPO_PUBLIC_API_URL (local dev) or EXPO_PUBLIC_DOMAIN (Replit).',
  );
  return '';
}

export const API_BASE_URL: string = resolveApiBaseUrl();
