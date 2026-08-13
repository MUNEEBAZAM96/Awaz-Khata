/**
 * "Continue with Google" — the primary path on both auth screens.
 *
 * Styled from theme tokens (surface + border) so it sits inside the Awaz Khata
 * design system, with only the Google mark itself carrying brand colour.
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { GoogleMark } from './GoogleMark';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { disabledOpacity } from '@/theme/tokens';

export interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleButton({ onPress, loading = false, disabled = false }: GoogleButtonProps) {
  const { colors, spacing, radius, touchTarget } = useTheme();
  const dir = useDirection();
  const t = useT();

  const inactive = disabled || loading;
  const label = loading ? t('auth.connectingGoogle') : t('auth.continueWithGoogle');

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      haptic="medium"
      style={{
        minHeight: touchTarget.comfortable,
        flexDirection: dir.row,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        opacity: inactive ? disabledOpacity : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : (
        <View accessible={false}>
          <GoogleMark size={20} />
        </View>
      )}
      <Text variant="label" color="textPrimary" directional={false}>
        {label}
      </Text>
    </Pressable>
  );
}
