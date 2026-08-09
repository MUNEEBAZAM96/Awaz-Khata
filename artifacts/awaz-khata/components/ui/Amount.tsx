import React from 'react';
import { View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { useMoney } from '@/hooks/useMoney';
import { usePreferences } from '@/store/preferences';
import type { TypeVariant } from '@/theme/typography';
import type { Palette } from '@/theme/palette';

export type MoneyDirection = 'in' | 'out' | 'neutral';

export interface AmountProps {
  value: number;
  direction?: MoneyDirection;
  variant?: TypeVariant;
  /** Show the "Rs." prefix. */
  withCurrency?: boolean;
  /** Render the direction arrow. Off for headline figures that have a label. */
  withArrow?: boolean;
  color?: keyof Palette;
  /** Ignore the global hide-balances preference (e.g. inside the reveal). */
  alwaysVisible?: boolean;
}

/**
 * Money display.
 *
 * Direction is communicated by an arrow glyph and a +/- sign as well as
 * colour, so the meaning survives colour blindness and greyscale — §24's
 * "never communicate meaning through colour alone".
 */
export function Amount({
  value,
  direction = 'neutral',
  variant = 'numericSmall',
  withCurrency = true,
  withArrow = false,
  color,
  alwaysVisible = false,
}: AmountProps) {
  const { colors, spacing, iconSize, iconStroke } = useTheme();
  const { prefs } = usePreferences();
  const money = useMoney();

  const hidden = prefs.hideBalances && !alwaysVisible;

  const toneColor: keyof Palette =
    color ?? (direction === 'in' ? 'success' : direction === 'out' ? 'danger' : 'textPrimary');

  const text = money(value, {
    withCurrency,
    alwaysVisible,
    signed: hidden
      ? false
      : direction === 'in'
        ? 'positive'
        : direction === 'out'
          ? 'negative'
          : false,
  });

  const Arrow = direction === 'in' ? ArrowDownLeft : ArrowUpRight;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      {withArrow && direction !== 'neutral' && !hidden ? (
        <Arrow
          size={iconSize.sm}
          color={colors[toneColor]}
          strokeWidth={iconStroke}
          accessible={false}
        />
      ) : null}
      {/*
       * Amounts never take the RTL writing direction: a rupee figure reads
       * left-to-right in every one of our languages, and flipping it puts the
       * minus sign on the wrong end.
       *
       * Kept to a single line and allowed to shrink — "- 39,100 روپے" is wide,
       * and wrapping it splits the number from its unit.
       */}
      <Text
        variant={variant}
        color={toneColor}
        directional={false}
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ flexShrink: 1 }}
      >
        {text}
      </Text>
    </View>
  );
}
