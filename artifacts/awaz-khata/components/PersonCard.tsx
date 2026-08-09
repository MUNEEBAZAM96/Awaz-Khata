import React from 'react';
import { View } from 'react-native';
import { CircleCheck, Users } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { IconBadge } from '@/components/ui/IconBadge';
import { Amount } from '@/components/ui/Amount';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

export interface PersonSummary {
  person: string;
  given: number;
  received: number;
  /** given − received, from the backend. Never recomputed here. */
  balance: number;
}

export interface PersonCardProps {
  summary: PersonSummary;
  onPress?: (person: string) => void;
}

/**
 * A person's standing.
 *
 * Settled / owes-you / you-owe is stated in words and marked with an icon,
 * not conveyed by colour alone.
 */
export function PersonCard({ summary, onPress }: PersonCardProps) {
  const { colors, spacing, radius, iconSize, iconStroke } = useTheme();
  const dir = useDirection();
  const t = useT();

  const settled = Math.abs(summary.balance) < 0.005;
  const theyOwe = summary.balance > 0;

  const statusLabel = settled
    ? t('khata.settled')
    : theyOwe
      ? t('khata.theyOwe')
      : t('khata.youOwe');

  const body = (
    <View
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      }}
    >
      <IconBadge icon={settled ? CircleCheck : Users} tone={settled ? 'success' : 'primary'} />

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyLarge" numberOfLines={1}>
          {summary.person}
        </Text>
        <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.xs }}>
          <Text variant="caption" color="textMuted">
            {t('khata.youGave')}
          </Text>
          <Amount
            value={summary.given}
            variant="caption"
            withCurrency={false}
            color="textMuted"
          />
          <Text variant="caption" color="textMuted">
            ·
          </Text>
          <Text variant="caption" color="textMuted">
            {t('khata.youReceived')}
          </Text>
          <Amount
            value={summary.received}
            variant="caption"
            withCurrency={false}
            color="textMuted"
          />
        </View>
      </View>

      <View style={{ alignItems: dir.isRTL ? 'flex-start' : 'flex-end', gap: 2 }}>
        <Text variant="caption" color="textMuted" directional={false}>
          {statusLabel}
        </Text>
        {settled ? (
          <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.xs }}>
            <CircleCheck
              size={iconSize.sm}
              color={colors.success}
              strokeWidth={iconStroke}
              accessible={false}
            />
            <Text variant="numericSmall" color="success" directional={false}>
              0
            </Text>
          </View>
        ) : (
          <Amount
            value={Math.abs(summary.balance)}
            variant="numericSmall"
            color={theyOwe ? 'primary' : 'danger'}
          />
        )}
      </View>
    </View>
  );

  const a11y = `${summary.person}, ${statusLabel}`;

  if (!onPress) return <View accessible accessibilityLabel={a11y}>{body}</View>;

  return (
    <Pressable
      accessibilityLabel={a11y}
      onPress={() => onPress(summary.person)}
      pressScale={0.99}
      style={{
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      {body}
    </Pressable>
  );
}
