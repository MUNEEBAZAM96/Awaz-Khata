/**
 * Clerk configuration and error translation.
 *
 * Only the *publishable* key ever reaches the client. `CLERK_SECRET_KEY` is a
 * backend credential and must never appear in an `EXPO_PUBLIC_*` variable —
 * everything under that prefix is inlined into the shipped JS bundle.
 */
import { isClerkAPIResponseError } from '@clerk/expo';
import type { StringKey } from '@/i18n';

export const CLERK_PUBLISHABLE_KEY: string =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/**
 * Clerk error code → localized string key.
 *
 * Raw Clerk messages are English-only and often describe the API rather than
 * the user's situation, so nothing from the wire is shown verbatim. Anything
 * unmapped falls back to a generic apology; the original is left on the error
 * object for the developer console, never rendered.
 */
const ERROR_KEYS: Record<string, StringKey> = {
  // Credentials
  form_identifier_not_found: 'auth.errorCredentials',
  form_password_incorrect: 'auth.errorCredentials',
  strategy_for_user_invalid: 'auth.errorCredentials',

  // Email
  form_identifier_exists: 'auth.errorEmailTaken',
  identifier_already_signed_in: 'auth.errorEmailTaken',

  // Password strength
  form_password_pwned: 'auth.errorPasswordWeak',
  form_password_not_strong_enough: 'auth.errorPasswordWeak',
  form_password_length_too_short: 'auth.errorPasswordShort',
  form_password_size_in_bytes_exceeded: 'auth.errorPasswordWeak',

  // Verification codes
  form_code_incorrect: 'auth.errorCodeInvalid',
  verification_failed: 'auth.errorCodeInvalid',
  verification_expired: 'auth.errorCodeExpired',
  verification_already_verified: 'auth.errorCodeExpired',

  // Rate limiting
  too_many_requests: 'auth.errorTooManyAttempts',
  client_state_invalid: 'auth.errorTooManyAttempts',
};

/** Clerk reports a bad email as a generic format error, qualified by `meta`. */
function isEmailFormatError(code: string, paramName: string | undefined): boolean {
  return (
    (code === 'form_param_format_invalid' || code === 'form_param_nil') &&
    paramName === 'email_address'
  );
}

/**
 * Map a Clerk failure to a string key we have translations for.
 *
 * Accepts anything: the Core 3 resource methods (`signIn.password()`,
 * `signUp.verifications.verifyEmailCode()`, …) *return* a `ClerkError` rather
 * than throwing, while the native Google flow and transport failures still
 * throw. Both paths land here.
 *
 * Network failures surface as plain `TypeError`s rather than Clerk errors, so
 * they are detected separately.
 */
export function authErrorKey(error: unknown): StringKey {
  // Richest shape first: an API response carries per-field codes and meta.
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (first) {
      const paramName = (first.meta as { paramName?: string } | undefined)?.paramName;
      if (isEmailFormatError(first.code, paramName)) return 'auth.errorEmailInvalid';
      const mapped = ERROR_KEYS[first.code];
      if (mapped) return mapped;
    }
    return 'auth.errorGeneric';
  }

  // Core 3 returns a bare `ClerkError`, which carries only a top-level code.
  // Structural, not nominal: `@clerk/shared` is a transitive dependency and
  // importing its types here would make it a direct one for a single field.
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === 'string') {
    // Without `meta` there is no field name to disambiguate a format error.
    // Email is the only free-form field on these screens whose *format* Clerk
    // rejects — password problems have their own codes — so attribute it there.
    if (code === 'form_param_format_invalid') return 'auth.errorEmailInvalid';
    const mapped = ERROR_KEYS[code];
    if (mapped) return mapped;
    return 'auth.errorGeneric';
  }

  if (error instanceof TypeError || isNetworkMessage(error)) {
    return 'auth.errorNetwork';
  }

  return 'auth.errorGeneric';
}

function isNetworkMessage(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('timeout')
  );
}

/** Conservative client-side check — Clerk remains the real authority. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export const MIN_PASSWORD_LENGTH = 8;
