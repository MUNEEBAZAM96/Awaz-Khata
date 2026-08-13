/**
 * Sign in.
 *
 * Google is the primary path; email + password is the fallback. Neither is
 * simulated — both go through Clerk, and the screen never claims success
 * before Clerk reports a complete session. Redirection into the app is left
 * to the gate in the root layout, which reacts to the session becoming active.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/expo';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthScreen, AuthSwitchLink } from '@/components/auth/AuthScreen';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthNotice } from '@/components/auth/AuthNotice';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { PasswordField } from '@/components/auth/PasswordField';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { authErrorKey, isValidEmail } from '@/lib/clerk';
import { useTheme } from '@/theme';
import { useT, type StringKey } from '@/i18n';

export default function SignInScreen() {
  const { spacing } = useTheme();
  const t = useT();
  const router = useRouter();
  const { signIn } = useSignIn();
  const google = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<StringKey | null>(null);
  const [passwordError, setPasswordError] = useState<StringKey | null>(null);
  const [formError, setFormError] = useState<StringKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || google.pending;

  const validate = (): boolean => {
    const trimmed = email.trim();
    const nextEmail: StringKey | null = !trimmed
      ? 'auth.errorEmailRequired'
      : !isValidEmail(trimmed)
        ? 'auth.errorEmailInvalid'
        : null;
    const nextPassword: StringKey | null = password ? null : 'auth.errorPasswordRequired';

    setEmailError(nextEmail);
    setPasswordError(nextPassword);
    return !nextEmail && !nextPassword;
  };

  const handleSubmit = async () => {
    if (busy) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Core 3 resource methods return their error rather than throwing.
      const { error } = await signIn.password({
        identifier: email.trim(),
        password,
      });
      if (error) {
        setFormError(authErrorKey(error));
        return;
      }

      if (signIn.status !== 'complete') {
        // A second factor is required and this instance is not configured for
        // one. Say so rather than pretending the sign-in worked.
        setFormError('auth.errorGeneric');
        return;
      }

      // Converts the completed sign-in into the active session; the root gate
      // then moves us into the app.
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) setFormError(authErrorKey(finalizeError));
    } catch (error) {
      setFormError(authErrorKey(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setFormError(null);
    const outcome = await google.signIn();
    if (outcome.status === 'error') setFormError(outcome.messageKey);
    if (outcome.status === 'incomplete') setFormError('auth.errorGoogleFailed');
  };

  return (
    <AuthScreen
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <AuthSwitchLink
          prompt={t('auth.noAccount')}
          action={t('auth.signUpLink')}
          onPress={() => router.replace('/(auth)/sign-up')}
        />
      }
    >
      <GoogleButton
        onPress={handleGoogle}
        loading={google.pending}
        disabled={submitting || !google.available}
      />
      {!google.available ? (
        <AuthNotice tone="info" message={t('auth.googleNeedsBuild')} />
      ) : null}

      <AuthDivider />

      <View style={{ gap: spacing.lg }}>
        <TextField
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          error={emailError ? t(emailError) : undefined}
          editable={!busy}
          latin
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        <PasswordField
          value={password}
          onChangeText={setPassword}
          error={passwordError ? t(passwordError) : undefined}
          editable={!busy}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {formError ? <AuthNotice message={t(formError)} /> : null}

        <Button
          label={submitting ? t('auth.signingIn') : t('auth.signIn')}
          onPress={handleSubmit}
          size="lg"
          fullWidth
          loading={submitting}
          disabled={google.pending}
        />
      </View>
    </AuthScreen>
  );
}
