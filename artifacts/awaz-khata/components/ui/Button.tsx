import React from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from './Pressable';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { useDirection } from '@/i18n';
import { disabledOpacity } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors, spacing, radius, iconSize, iconStroke, touchTarget } = useTheme();
  const dir = useDirection();

  const height = size === 'lg' ? touchTarget.comfortable : touchTarget.min;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: colors.textOnPrimary, border: colors.primary },
    secondary: { bg: colors.primarySoft, fg: colors.primary, border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.textSecondary, border: colors.border },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: 'transparent' },
  };
  const tone = palette[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={inactive}
      haptic={variant === 'primary' ? 'medium' : 'light'}
      style={[
        {
          minHeight: height,
          flexDirection: dir.row,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.sm,
          borderRadius: radius.full,
          backgroundColor: tone.bg,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: tone.border,
          opacity: inactive ? disabledOpacity : 1,
          ...(fullWidth ? { alignSelf: 'stretch' } : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : (
        <>
          {Icon ? (
            <View accessible={false}>
              <Icon size={iconSize.md} color={tone.fg} strokeWidth={iconStroke} />
            </View>
          ) : null}
          <Text variant="label" style={{ color: tone.fg }} directional={false}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
