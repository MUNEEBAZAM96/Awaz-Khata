/**
 * Password input with a reveal toggle.
 *
 * The toggle is a real labelled control (not a decorative icon) so it is
 * reachable and understandable with a screen reader.
 */
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable } from '@/components/ui/Pressable';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

export interface PasswordFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  editable?: boolean;
  /** `new-password` on sign-up lets the OS offer to generate and store one. */
  newPassword?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go';
}

export function PasswordField({
  value,
  onChangeText,
  error,
  hint,
  editable = true,
  newPassword = false,
  onSubmitEditing,
  returnKeyType = 'done',
}: PasswordFieldProps) {
  const { colors, iconSize, iconStroke } = useTheme();
  const t = useT();
  const [revealed, setRevealed] = useState(false);

  const Icon = revealed ? EyeOff : Eye;

  return (
    <TextField
      label={t('auth.password')}
      value={value}
      onChangeText={onChangeText}
      placeholder={t('auth.passwordPlaceholder')}
      error={error}
      hint={hint}
      editable={editable}
      latin
      secureTextEntry={!revealed}
      autoCapitalize="none"
      autoComplete={newPassword ? 'new-password' : 'current-password'}
      textContentType={newPassword ? 'newPassword' : 'password'}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      trailing={
        <Pressable
          accessibilityLabel={
            revealed ? t('auth.a11yHidePassword') : t('auth.a11yShowPassword')
          }
          accessibilityState={{ checked: revealed }}
          onPress={() => setRevealed((current) => !current)}
          haptic="none"
          visualSize={iconSize.lg}
        >
          <Icon size={iconSize.lg} color={colors.textMuted} strokeWidth={iconStroke} />
        </Pressable>
      }
    />
  );
}
