import React from 'react';
import { View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Text } from './Text';
import { Pressable } from './Pressable';
import { useTheme } from '@/theme';
import { useDirection } from '@/i18n';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, spacing, iconSize, iconStroke } = useTheme();
  const dir = useDirection();
  // The affordance chevron points "forward" in reading order, so it mirrors
  // between Urdu and English — unlike semantic icons, which never mirror.
  const Chevron = dir.forwardChevron === 'left' ? ChevronLeft : ChevronRight;

  return (
    <View
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        gap: spacing.md,
      }}
    >
      <Text variant="headingSmall" style={{ flexShrink: 1 }}>
        {title}
      </Text>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          onPress={onAction}
          visualSize={28}
          style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.xs }}
        >
          <Text variant="label" color="primary" directional={false}>
            {actionLabel}
          </Text>
          <Chevron size={iconSize.sm} color={colors.primary} strokeWidth={iconStroke} />
        </Pressable>
      ) : null}
    </View>
  );
}
