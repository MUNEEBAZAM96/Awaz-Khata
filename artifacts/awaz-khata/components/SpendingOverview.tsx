import React, { useMemo } from 'react';
import { View } from 'react-native';
import { PieChart } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Amount } from '@/components/ui/Amount';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { categoryLabel } from '@/lib/categories';

export interface CategorySlice {
  /** Raw category string as stored, or null for uncategorised. */
  category: string | null;
  amount: number;
}

export interface SpendingOverviewProps {
  /**
   * Category totals from the backend's `category_summary` query. The UI ranks
   * and draws them; it does not add anything up.
   */
  slices: CategorySlice[];
  total: number;
}

/**
 * Horizontal proportion bars, not a pie or donut.
 *
 * A bar list stays readable at small sizes, needs no legend (the label sits
 * on the row), and works in both reading directions — all of which a pie
 * chart with an external legend does badly on a phone.
 */
export function SpendingOverview({ slices, total }: SpendingOverviewProps) {
  const { colors, spacing, radius } = useTheme();
  const dir = useDirection();
  const t = useT();

  const ranked = useMemo(
    () => [...slices].filter((s) => s.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5),
    [slices],
  );

  if (!ranked.length || total <= 0) {
    return (
      <EmptyState
        icon={PieChart}
        title={t('empty.spendingTitle')}
        body={t('empty.spendingBody')}
        compact
      />
    );
  }

  // A fixed ramp of brand-derived tones. Order follows rank, so the largest
  // category is always the strongest colour.
  const ramp = [colors.primary, colors.primaryBright, colors.accent, colors.warning, colors.textMuted];

  return (
    <View style={{ gap: spacing.md }}>
      {ranked.map((slice, index) => {
        const share = Math.max(0.02, slice.amount / total);
        const label = categoryLabel(slice.category, t);
        const percent = Math.round(share * 100);

        return (
          <View
            key={`${slice.category ?? 'none'}-${index}`}
            accessible
            accessibilityLabel={`${label}, ${percent}%`}
            style={{ gap: spacing.xs }}
          >
            <View
              style={{
                flexDirection: dir.row,
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.sm,
              }}
            >
              <Text variant="bodySmall" numberOfLines={1} style={{ flexShrink: 1 }}>
                {label}
              </Text>
              <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
                {/* Percentage as well as bar length — the bar alone is hard
                    to read comparatively, and colour carries no meaning. */}
                <Text variant="caption" color="textMuted" directional={false}>
                  {percent}%
                </Text>
                <Amount value={slice.amount} variant="numericSmall" withCurrency={false} />
              </View>
            </View>

            <View
              style={{
                height: 8,
                borderRadius: radius.full,
                backgroundColor: colors.surfaceSunken,
                overflow: 'hidden',
                flexDirection: dir.row,
              }}
            >
              <View
                style={{
                  width: `${share * 100}%`,
                  backgroundColor: ramp[index % ramp.length],
                  borderRadius: radius.full,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
