import React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from './Text';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { useTheme } from '@/theme';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  compact?: boolean;
}

/**
 * Empty states always say what the user can do next — an empty Khata is the
 * first screen a new user sees, so it doubles as onboarding.
 */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  actionIcon,
  compact = false,
}: EmptyStateProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: compact ? spacing.xl : spacing['3xl'],
        paddingHorizontal: spacing.xl,
      }}
    >
      <IconBadge icon={icon} tone="neutral" size="lg" />
      <Text variant="headingSmall" align="center" style={{ marginTop: spacing.xs }}>
        {title}
      </Text>
      <Text variant="bodySmall" color="textMuted" align="center">
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          icon={actionIcon}
          variant="secondary"
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </View>
  );
}
