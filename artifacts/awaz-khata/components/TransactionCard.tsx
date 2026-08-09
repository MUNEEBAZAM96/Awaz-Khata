import React from 'react';
import { View } from 'react-native';
import type { Transaction } from '@workspace/api-client-react';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { IconBadge } from '@/components/ui/IconBadge';
import { Amount, type MoneyDirection } from '@/components/ui/Amount';
import { useTheme } from '@/theme';
import { useDirection, useI18n, useT } from '@/i18n';
import { categoryIcon, categoryLabel, typeIcon } from '@/lib/categories';
import { timeLabel } from '@/lib/format';
import { useMoney } from '@/hooks/useMoney';

/**
 * Money direction per transaction type.
 *
 * This is presentation, not arithmetic: the backend stores every amount as a
 * positive number and owns all totals. This only decides which arrow and
 * sign to draw.
 */
export function directionFor(type: string): MoneyDirection {
  switch (type) {
    case 'income':
    case 'received':
      return 'in';
    case 'expense':
    case 'given':
      return 'out';
    default:
      return 'neutral';
  }
}

export function toneFor(type: string): 'success' | 'danger' | 'primary' | 'accent' {
  switch (type) {
    case 'income':
      return 'success';
    case 'expense':
      return 'danger';
    case 'given':
      return 'accent';
    default:
      return 'primary';
  }
}

export interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  /** Hide the time line when the list is already grouped by day. */
  showTime?: boolean;
}

export function TransactionCard({
  transaction,
  onPress,
  showTime = true,
}: TransactionCardProps) {
  const { spacing } = useTheme();
  const dir = useDirection();
  const { lang } = useI18n();
  const t = useT();
  const money = useMoney();

  const type = transaction.type;
  const direction = directionFor(type);
  const person = transaction.person?.trim();

  // Title: what the user actually said, falling back to the category, then
  // to the type. Never invent a description.
  const title =
    transaction.description?.trim() ||
    (person && (type === 'given' || type === 'received')
      ? person
      : categoryLabel(transaction.category, t));

  const subtitleParts = [
    type === 'given' || type === 'received'
      ? t(`txType.${type}` as const)
      : categoryLabel(transaction.category, t),
    showTime ? timeLabel(transaction.timestamp, lang) : null,
  ].filter(Boolean);

  const Icon =
    type === 'given' || type === 'received'
      ? typeIcon(type)
      : transaction.category
        ? categoryIcon(transaction.category)
        : typeIcon(type);

  const a11yAmount = money(transaction.amount, { alwaysVisible: true });
  const a11yLabel =
    type === 'given' || type === 'received'
      ? t(`a11y.${type}` as const, { amount: a11yAmount, person: person ?? '' })
      : t(`a11y.${type === 'income' ? 'income' : 'expense'}` as const, {
          amount: a11yAmount,
        });

  const body = (
    <View
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
      }}
    >
      <IconBadge icon={Icon} tone={toneFor(type)} />

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyLarge" numberOfLines={1}>
          {title}
        </Text>
        {subtitleParts.length ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {subtitleParts.join(' · ')}
          </Text>
        ) : null}
      </View>

      <Amount value={transaction.amount} direction={direction} withArrow />
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={a11yLabel}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={a11yLabel}
      accessibilityHint={t('detail.title')}
      onPress={() => onPress(transaction)}
      pressScale={0.99}
    >
      {body}
    </Pressable>
  );
}
