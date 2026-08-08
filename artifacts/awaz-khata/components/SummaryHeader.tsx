import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import { useCountUp } from '@/hooks/useCountUp';

interface Props {
  todayExpenses: number;
  todayGiven: number;
  todayReceived: number;
}

/**
 * "Today's khata" hero card — deep emerald gradient with the gold margin
 * rule of a classic bahi khata on the right edge. The expense figure
 * counts up when it changes so a fresh entry feels acknowledged.
 */
export function SummaryHeader({ todayExpenses, todayGiven, todayReceived }: Props) {
  const colors = useColors();
  const animatedExpenses = useCountUp(todayExpenses);

  const stats = [
    { label: 'خرچ', value: todayExpenses },
    { label: 'دیا', value: todayGiven },
    { label: 'وصول', value: todayReceived },
  ];

  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primaryBright]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={[styles.marginRule, { backgroundColor: colors.accent }]} />

      <Text style={[styles.label, { color: 'rgba(255,255,255,0.85)' }]}>
        آج کا حساب
      </Text>
      <Text style={[styles.amount, { color: colors.primaryForeground }]}>
        <Text style={[styles.currency, { color: 'rgba(255,255,255,0.7)' }]}>Rs. </Text>
        {animatedExpenses.toLocaleString('en-PK')}
      </Text>
      <Text style={[styles.sublabel, { color: 'rgba(255,255,255,0.65)' }]}>
        آج کے اخراجات
      </Text>

      <View style={[styles.statsRow, { borderColor: 'rgba(255,255,255,0.18)' }]}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
              {stat.label}
            </Text>
            <Text style={[styles.statValue, { color: colors.primaryForeground }]}>
              {stat.value.toLocaleString('en-PK')}
            </Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0A4A38',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  marginRule: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    right: 12,
    width: 3,
    borderRadius: 999,
    opacity: 0.9,
  },
  label: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  amount: {
    fontSize: 40,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
    marginTop: -2,
  },
  currency: {
    fontSize: 18,
    fontFamily: fonts.numberSemiBold,
  },
  sublabel: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
    marginTop: -6,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    alignSelf: 'stretch',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 0,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
  statValue: {
    fontSize: 16,
    fontFamily: fonts.numberSemiBold,
    fontVariant: ['tabular-nums'],
  },
});
