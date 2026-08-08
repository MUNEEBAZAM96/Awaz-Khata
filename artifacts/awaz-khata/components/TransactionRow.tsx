import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Transaction } from '@workspace/api-client-react';
import { activityLabel } from '@/components/ActivityList';

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
}

export function TransactionRow({ transaction: t }: Props) {
  const colors = useColors();
  const isOut = t.type === 'expense' || t.type === 'given';

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>
          {activityLabel(t)}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {TYPE_LABELS[t.type]} · {formatDate(t.timestamp)}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isOut ? colors.destructive : colors.success },
        ]}
      >
        {isOut ? '-' : '+'} Rs. {t.amount.toLocaleString('en-PK')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 14,
    minHeight: 60,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
