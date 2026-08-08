import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';

interface Props {
  todayExpenses: number;
}

/**
 * "Today's spend" card — the gold rule on the right edge nods to the margin
 * line of a classic bahi khata (ledger book).
 */
export function SummaryHeader({ todayExpenses }: Props) {
  const colors = useColors();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.marginRule, { backgroundColor: colors.accent }]} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>آج کا خرچ</Text>
      <Text style={[styles.amount, { color: colors.foreground }]}>
        <Text style={[styles.currency, { color: colors.mutedForeground }]}>Rs. </Text>
        {todayExpenses.toLocaleString('en-PK')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 24,
    overflow: 'hidden',
  },
  marginRule: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    right: 10,
    width: 3,
    borderRadius: 999,
  },
  label: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  amount: {
    fontSize: 30,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
  },
  currency: {
    fontSize: 16,
    fontFamily: fonts.numberSemiBold,
  },
});
