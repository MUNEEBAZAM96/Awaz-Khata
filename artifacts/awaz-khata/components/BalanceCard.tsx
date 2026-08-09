import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { MASKED_AMOUNT } from '@/lib/format';
import { useMoney } from '@/hooks/useMoney';

export interface BalanceCardProps {
  /** All three figures come from the backend summary — never computed here. */
  balance: number;
  income: number;
  expenses: number;
  loading?: boolean;
}

/**
 * The dashboard's headline figure.
 *
 * Income and expenses are distinguished by an arrow and a word as well as
 * colour, so the card still reads correctly in greyscale.
 */
export function BalanceCard({ balance, income, expenses, loading }: BalanceCardProps) {
  const { colors, spacing, radius, iconSize, iconStroke, text } = useTheme();
  const dir = useDirection();
  const t = useT();
  const { prefs, setPreference } = usePreferences();
  const money = useMoney();

  const hidden = prefs.hideBalances;

  const Row = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: typeof ArrowDownLeft;
    label: string;
    value: number;
  }) => (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.xs }}>
        <Icon
          size={iconSize.xs}
          color="rgba(255,255,255,0.75)"
          strokeWidth={iconStroke}
          accessible={false}
        />
        <Text
          variant="caption"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        variant="numericMedium"
        style={{ color: '#FFFFFF' }}
        directional={false}
        numberOfLines={1}
      >
        {hidden ? MASKED_AMOUNT : money(value)}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primaryBright]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radius.xl,
        padding: spacing.xl,
        gap: spacing.lg,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: dir.row,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <View style={{ gap: spacing.xs, flex: 1 }}>
          <Text variant="label" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('home.availableBalance')}
          </Text>
          <Text
            variant="numericLarge"
            style={{ color: '#FFFFFF' }}
            directional={false}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {loading ? '—' : hidden ? MASKED_AMOUNT : money(balance)}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={hidden ? t('a11y.revealBalance') : t('a11y.hideBalance')}
          onPress={() => setPreference('hideBalances', !hidden)}
          visualSize={32}
          style={{
            padding: spacing.sm,
            borderRadius: radius.full,
            backgroundColor: 'rgba(255,255,255,0.14)',
          }}
        >
          {hidden ? (
            <EyeOff size={iconSize.md} color="#FFFFFF" strokeWidth={iconStroke} />
          ) : (
            <Eye size={iconSize.md} color="#FFFFFF" strokeWidth={iconStroke} />
          )}
        </Pressable>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.18)',
        }}
      />

      <View style={{ flexDirection: dir.row, gap: spacing.lg }}>
        <Row icon={ArrowDownLeft} label={t('home.income')} value={income} />
        <Row icon={ArrowUpRight} label={t('home.expenses')} value={expenses} />
      </View>
    </LinearGradient>
  );
}
