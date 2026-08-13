/**
 * Form-level message above the submit button.
 *
 * Errors are never signalled by colour alone: the banner carries an icon, an
 * `alert` role and a localized "Error" prefix for screen readers.
 */
import React from 'react';
import { View } from 'react-native';
import { CircleAlert, CircleCheck } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

export type NoticeTone = 'error' | 'info';

export interface AuthNoticeProps {
  message: string;
  tone?: NoticeTone;
}

export function AuthNotice({ message, tone = 'error' }: AuthNoticeProps) {
  const { colors, spacing, radius, iconSize, iconStroke } = useTheme();
  const dir = useDirection();
  const t = useT();

  const isError = tone === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;
  const fg = isError ? colors.danger : colors.success;
  const bg = isError ? colors.dangerSoft : colors.successSoft;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={isError ? `${t('auth.a11yErrorLabel')}: ${message}` : message}
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: dir.row,
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: bg,
      }}
    >
      <View accessible={false} style={{ paddingTop: 2 }}>
        <Icon size={iconSize.sm} color={fg} strokeWidth={iconStroke} />
      </View>
      <Text
        variant="bodySmall"
        style={{ flex: 1, color: fg }}
        // The banner as a whole carries the label; the inner text would
        // otherwise be announced a second time.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {message}
      </Text>
    </View>
  );
}
