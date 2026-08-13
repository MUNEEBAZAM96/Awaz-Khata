import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

/** Hairline rules either side of a localized "or". */
export function AuthDivider() {
  const { colors, spacing } = useTheme();
  const t = useT();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text variant="caption" color="textMuted" directional={false}>
        {t('auth.dividerOr')}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}
