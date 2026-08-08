import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Transaction } from '@workspace/api-client-react';

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
      <View style={styles.empty}>
        <Feather name="book-open" size={20} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          مثال: «آج میں نے آٹھ سو روپے پٹرول پر خرچ کیے»
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={[styles.heading, { color: colors.mutedForeground }]}>
        حالیہ سرگرمیاں
      </Text>
      {transactions.slice(0, 4).map((t) => {
        const isOut = t.type === 'expense' || t.type === 'given';
        return (
          <View
            key={t.id}
            style={[
              styles.row,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Feather name="check" size={18} color={colors.success} />
            <Text
              style={[styles.label, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {activityLabel(t)}
            </Text>
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
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  heading: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
