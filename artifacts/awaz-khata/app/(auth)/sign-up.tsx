/**
 * Sign up.
 *
 * Two phases: collect credentials, then confirm the emailed code. The account
 * is only treated as created once Clerk reports `status === 'complete'` and
 * `finalize()` succeeds — there is no optimistic success anywhere in this flow.
 *
 * If the Clerk instance is configured not to require email verification,
 * `signUp.create` completes immediately and the verification phase is skipped.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/expo';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthScreen, AuthLink, AuthSwitchLink } from '@/components/auth/AuthScreen';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthNotice } from '@/components/auth/AuthNotice';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { PasswordField } from '@/components/auth/PasswordField';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { authErrorKey, isValidEmail, MIN_PASSWORD_LENGTH } from '@/lib/clerk';
import { useTheme } from '@/theme';
import { useT, type StringKey } from '@/i18n';

type Phase = 'credentials' | 'verify';

export default function SignUpScreen() {
  const { spacing } = useTheme();
  const t = useT();
  const router = useRouter();
  const { signUp } = useSignUp();
  const google = useGoogleAuth();

  const [phase, setPhase] = useState<Phase>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [emailError, setEmailError] = useState<StringKey | null>(null);
  const [passwordError, setPasswordError] = useState<StringKey | null>(null);
  const [codeError, setCodeError] = useState<StringKey | null>(null);
  const [formError, setFormError] = useState<StringKey | null>(null);
  const [info, setInfo] = useState<StringKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || google.pending;

  const validateCredentials = (): boolean => {
    const trimmed = email.trim();
    const nextEmail: StringKey | null = !trimmed
      ? 'auth.errorEmailRequired'
      : !isValidEmail(trimmed)
        ? 'auth.errorEmailInvalid'
        : null;
    const nextPassword: StringKey | null = !password
      ? 'auth.errorPasswordRequired'
      : password.length < MIN_PASSWORD_LENGTH
        ? 'auth.errorPasswordShort'
        : null;

    setEmailError(nextEmail);
    setPasswordError(nextPassword);
    return !nextEmail && !nextPassword;
  };

  /**
   * Shared tail: turn a completed sign-up into the active session.
   * Returns true when the account exists and the user is now signed in.
   */
  const finalizeIfComplete = async (): Promise<boolean> => {
    if (signUp.status !== 'complete') return false;
    const { error } = await signUp.finalize();
    if (error) {
      setFormError(authErrorKey(error));
      return false;
    }
    return true; // The root gate moves us into the app.
  };

  const handleCreate = async () => {
    if (busy) return;
    setFormError(null);
    setInfo(null);
    if (!validateCredentials()) return;

    setSubmitting(true);
    try {
      const { error } = await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      if (error) {
        setFormError(authErrorKey(error));
        return;
      }

      // Instances that do not require email verification complete here.
      if (await finalizeIfComplete()) return;

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(authErrorKey(sendError));
        return;
      }
      setPhase('verify');
    } catch (error) {
      setFormError(authErrorKey(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (busy) return;
    setFormError(null);
    setInfo(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setCodeError('auth.errorCodeRequired');
      return;
    }
    setCodeError(null);

    setSubmitting(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: trimmedCode });
      if (error) {
        setFormError(authErrorKey(error));
        return;
      }

      if (await finalizeIfComplete()) return;

      // Verified, but Clerk still wants something else (e.g. a required field
      // enabled in the dashboard that this form does not collect).
      setFormError('auth.errorGeneric');
    } catch (error) {
      setFormError(authErrorKey(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (busy) return;
    setFormError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) setFormError(authErrorKey(error));
      else setInfo('auth.resent');
    } catch (error) {
      setFormError(authErrorKey(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setFormError(null);
    setInfo(null);
    const outcome = await google.signIn();
    if (outcome.status === 'error') setFormError(outcome.messageKey);
    if (outcome.status === 'incomplete') setFormError('auth.errorGoogleFailed');
  };

  if (phase === 'verify') {
    return (
      <AuthScreen
        title={t('auth.verifyTitle')}
        subtitle={t('auth.verifySubtitle', { email: email.trim() })}
      >
        <View style={{ gap: spacing.lg }}>
          <TextField
            label={t('auth.code')}
            value={code}
            onChangeText={setCode}
            placeholder={t('auth.codePlaceholder')}
            error={codeError ? t(codeError) : undefined}
            editable={!busy}
            latin
            keyboardType="number-pad"
            autoCapitalize="none"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />

          {formError ? <AuthNotice message={t(formError)} /> : null}
          {info ? <AuthNotice tone="info" message={t(info)} /> : null}

          <Button
            label={submitting ? t('auth.verifying') : t('auth.verify')}
            onPress={handleVerify}
            size="lg"
            fullWidth
            loading={submitting}
            disabled={google.pending}
          />

          <View style={{ alignItems: 'center' }}>
            <AuthLink label={t('auth.resend')} onPress={handleResend} />
          </View>
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSubtitle')}
      footer={
        <AuthSwitchLink
          prompt={t('auth.haveAccount')}
          action={t('auth.signInLink')}
          onPress={() => router.replace('/(auth)/sign-in')}
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
          hint={t('auth.passwordHint')}
          editable={!busy}
          newPassword
          returnKeyType="go"
          onSubmitEditing={handleCreate}
        />

        {formError ? <AuthNotice message={t(formError)} /> : null}

        <Button
          label={submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
          onPress={handleCreate}
          size="lg"
          fullWidth
          loading={submitting}
          disabled={google.pending}
        />
      </View>
    </AuthScreen>
  );
}
