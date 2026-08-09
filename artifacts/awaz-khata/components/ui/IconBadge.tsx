/**
 * Icon in a soft tinted container — the app's standard way of giving an icon
 * presence without relying on a coloured background block.
 */
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';

export type BadgeTone = 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

const BOX: Record<BadgeSize, number> = { sm: 32, md: 40, lg: 48 };

export interface IconBadgeProps {
  icon: LucideIcon;
  tone?: BadgeTone;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
}

export function IconBadge({ icon: Icon, tone = 'neutral', size = 'md', style }: IconBadgeProps) {
  const { colors, radius, iconSize, iconStroke } = useTheme();

  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    neutral: { bg: colors.surfaceSunken, fg: colors.textSecondary },
  };
  const { bg, fg } = tones[tone];
  const box = BOX[size];

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: box,
          height: box,
          borderRadius: radius.md,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icon
        size={size === 'sm' ? iconSize.sm : size === 'lg' ? iconSize.lg : iconSize.md}
        color={fg}
        strokeWidth={iconStroke}
      />
    </View>
  );
}
