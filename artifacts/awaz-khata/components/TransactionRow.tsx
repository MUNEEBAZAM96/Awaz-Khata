import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import type { Transaction } from '@workspace/api-client-react';
import { activityLabel, TYPE_ICONS } from '@/components/ActivityList';

const TYPE_LABELS: Record<Transaction['type'], string> = {
  expense: 'خرچ',
  income: 'آمدن',
  given: 'دیے',
  received: 'واپس ملے',
};

function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString('ur-PK', {
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return new Date(timestamp).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
    });
  }
}

interface Props {
  transaction: Transaction;
  /** Hide on the last row of a card list. */
  showDivider?: boolean;
}

export function TransactionRow({ transaction: t, showDivider = true }: Props) {
  const colors = useColors();
  const isOut = t.type === 'expense' || t.type === 'given';
  const tint = isOut ? colors.destructive : colors.success;
  const tintSoft = isOut ? colors.destructiveSoft : colors.successSoft;

  return (
    <View
      style={[
        styles.row,
        {
          borderColor: colors.border,
          borderBottomWidth: showDivider ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <View style={[styles.iconChip, { backgroundColor: tintSoft }]}>
        <Feather name={TYPE_ICONS[t.type]} size={16} color={tint} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>
          {activityLabel(t)}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {TYPE_LABELS[t.type]} · {formatDate(t.timestamp)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: tint }]}>
        {isOut ? '-' : '+'} Rs. {t.amount.toLocaleString('en-PK')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    minHeight: 64,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  meta: {
    fontSize: 12,
    lineHeight: 22,
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  amount: {
    fontSize: 15,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
  },
});
