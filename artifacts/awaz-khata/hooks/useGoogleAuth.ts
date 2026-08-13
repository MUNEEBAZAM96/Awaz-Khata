/**
 * Google authentication, resolved per platform.
 *
 *  - iOS / Android (development or production build): Clerk's *native* Google
 *    flow — Credential Manager on Android, ASAuthorization on iOS. No WebView.
 *  - Web: Clerk's browser SSO flow, which is the only thing a browser can do.
 *  - Expo Go: unavailable. The native module is not in the Expo Go binary, so
 *    the button is disabled with an explanation rather than silently degraded
 *    to a browser flow that would behave differently from the shipped app.
 *
 * Every path is a real Clerk flow; nothing here fabricates a session.
 */
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useSSO } from '@clerk/expo';
import { useSignInWithGoogle } from '@clerk/expo/google';
import { authErrorKey } from '@/lib/clerk';
import type { StringKey } from '@/i18n';

export type GoogleAuthOutcome =
  | { status: 'signed-in' }
  /** User backed out of the account picker — not an error, show nothing. */
  | { status: 'cancelled' }
  /** Clerk needs another factor before a session exists. */
  | { status: 'incomplete' }
  | { status: 'error'; messageKey: StringKey };

const IS_NATIVE = Platform.OS === 'ios' || Platform.OS === 'android';

const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Cancellation surfaces differently across Credential Manager and ASAuthorization. */
function isCancellation(error: unknown): boolean {
  const code = (error as { code?: string | number } | null)?.code;
  if (code === 'SIGN_IN_CANCELLED' || code === '-5' || code === -5) return true;
  if (code === 'ERR_REQUEST_CANCELED' || code === 'ERR_CANCELED') return true;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('cancel');
}

export function useGoogleAuth() {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { startSSOFlow } = useSSO();
  const [pending, setPending] = useState(false);

  const available = IS_NATIVE ? !IS_EXPO_GO : true;

  const signIn = useCallback(async (): Promise<GoogleAuthOutcome> => {
    // Guards a second tap while the account picker is already open.
    if (pending) return { status: 'cancelled' };
    if (!available) return { status: 'error', messageKey: 'auth.googleNeedsBuild' };

    setPending(true);
    try {
      if (IS_NATIVE) {
        const { createdSessionId, setActive } = await startGoogleAuthenticationFlow();
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          return { status: 'signed-in' };
        }
        return { status: 'incomplete' };
      }

      const { createdSessionId, setActive, authSessionResult } = await startSSOFlow({
        strategy: 'oauth_google',
      });
      if (authSessionResult && authSessionResult.type !== 'success') {
        return { status: 'cancelled' };
      }
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return { status: 'signed-in' };
      }
      return { status: 'incomplete' };
    } catch (error) {
      if (isCancellation(error)) return { status: 'cancelled' };
      const key = authErrorKey(error);
      // A Google-specific failure reads better than the generic apology.
      return {
        status: 'error',
        messageKey: key === 'auth.errorGeneric' ? 'auth.errorGoogleFailed' : key,
      };
    } finally {
      setPending(false);
    }
  }, [available, pending, startGoogleAuthenticationFlow, startSSOFlow]);

  return { signIn, pending, available };
}
