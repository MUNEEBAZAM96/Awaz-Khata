import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import type { Transaction } from '@workspace/api-client-react';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

/** Icon per transaction type — money out points up-right, money in comes down-left. */
export const TYPE_ICONS: Record<Transaction['type'], FeatherName> = {
  expense: 'arrow-up-right',
  income: 'arrow-down-left',
  given: 'user-minus',
  received: 'user-plus',
};

export function activityLabel(t: Transaction): string {
  if (t.type === 'given' && t.person) return `${t.person} کو دیے`;
  if (t.type === 'received' && t.person) return `${t.person} سے واپس`;
  if (t.type === 'income') return t.description || 'آمدن';
  return t.description || t.category || 'خرچ';
}

interface Props {
  transactions: Transaction[];
}

export function ActivityList({ transactions }: Props) {
  const colors = useColors();

  if (transactions.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.secondary }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
          <Feather name="mic" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.emptyText, { color: colors.secondaryForeground }]}>
          مثال کے طور پر کہیں:{'\n'}«آج میں نے آٹھ سو روپے پٹرول پر خرچ کیے»
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={[styles.heading, { color: colors.mutedForeground }]}>
        حالیہ سرگرمیاں
      </Text>
      {transactions.slice(0, 3).map((t) => {
        const isOut = t.type === 'expense' || t.type === 'given';
        const tint = isOut ? colors.destructive : colors.success;
        const tintSoft = isOut ? colors.destructiveSoft : colors.successSoft;
        return (
          <View
            key={t.id}
            style={[
              styles.row,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <View style={[styles.iconChip, { backgroundColor: tintSoft }]}>
              <Feather name={TYPE_ICONS[t.type]} size={16} color={tint} />
            </View>
            <Text
              style={[styles.label, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {activityLabel(t)}
            </Text>
            <Text style={[styles.amount, { color: tint }]}>
              {isOut ? '-' : '+'} Rs. {t.amount.toLocaleString('en-PK')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  heading: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: urduLine(14),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  amount: {
    fontSize: 15,
    fontFamily: fonts.numberSemiBold,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
