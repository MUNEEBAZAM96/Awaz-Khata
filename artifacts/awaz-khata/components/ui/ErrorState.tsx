import React from 'react';
import { View } from 'react-native';
import { CircleAlert, WifiOff } from 'lucide-react-native';
import { Text } from './Text';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

export interface ErrorStateProps {
  /** Already-localized message. Backend errors arrive pre-localized. */
  message: string;
  body?: string;
  onRetry?: () => void;
  offline?: boolean;
  compact?: boolean;
}

/**
 * Errors are always shown as a sentence the user can act on. Raw transport
 * detail (status codes, "AxiosError", "undefined") must never reach here —
 * callers map failures to a localized message first.
 */
export function ErrorState({ message, body, onRetry, offline, compact }: ErrorStateProps) {
  const { spacing } = useTheme();
  const t = useT();

  return (
    <View
      accessibilityRole="alert"
      style={{
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: compact ? spacing.lg : spacing['3xl'],
        paddingHorizontal: spacing.xl,
      }}
    >
      <IconBadge icon={offline ? WifiOff : CircleAlert} tone="danger" size="lg" />
      <Text variant="headingSmall" align="center" style={{ marginTop: spacing.xs }}>
        {message}
      </Text>
      {body ? (
        <Text variant="bodySmall" color="textMuted" align="center">
          {body}
        </Text>
      ) : null}
      {onRetry ? (
        <Button
          label={t('common.retry')}
          onPress={onRetry}
          variant="secondary"
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </View>
  );
}
