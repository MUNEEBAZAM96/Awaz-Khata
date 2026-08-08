import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  todayExpenses: number;
}

export function SummaryHeader({ todayExpenses }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>آج کا خرچ</Text>
      <Text style={[styles.amount, { color: colors.foreground }]}>
        Rs. {todayExpenses.toLocaleString('en-PK')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 15,
    writingDirection: 'rtl',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
