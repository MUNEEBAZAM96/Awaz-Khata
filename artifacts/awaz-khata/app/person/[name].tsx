import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CircleCheck, Plus } from 'lucide-react-native';
import { getPersonLedger, type Transaction } from '@workspace/api-client-react';
import { Text } from '@/components/ui/Text';
import { Surface } from '@/components/ui/Surface';
import { Button } from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { Amount } from '@/components/ui/Amount';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconBadge } from '@/components/ui/IconBadge';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

/**
 * One person's ledger.
 *
 * Every figure here — given, received, balance — is fetched from
 * `/transactions/person/{name}`, so it is the finance engine's arithmetic and
 * not a client-side re-derivation of the list screen's grouping.
 */
export default function PersonLedgerScreen() {
  const { colors, spacing, iconSize, iconStroke, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string }>();
  const name = typeof params.name === 'string' ? params.name : '';

  const [selected, setSelected] = useState<Transaction | null>(null);

  const ledger = useQuery({
    queryKey: ['person', name],
    queryFn: () => getPersonLedger(name),
    enabled: !!name,
  });

  const Back = dir.backChevron === 'right' ? ArrowRight : ArrowLeft;
  const data = ledger.data;
  const settled = data ? Math.abs(data.balance) < 0.005 : false;
  const theyOwe = (data?.balance ?? 0) > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['4xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.md }}>
          <Pressable
            accessibilityLabel={t('a11y.back')}
            onPress={() => router.back()}
            visualSize={40}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceSunken,
            }}
          >
            <Back size={iconSize.md} color={colors.textPrimary} strokeWidth={iconStroke} />
          </Pressable>
          <Text variant="headingLarge" style={{ flex: 1 }} numberOfLines={1}>
            {name}
          </Text>
        </View>

        {ledger.isError ? (
          <ErrorState
            message={t('error.loadFailed')}
            onRetry={() => void ledger.refetch()}
          />
        ) : (
          <>
            {/* Standing */}
            <Surface elevation="raised" padding="xl" style={{ gap: spacing.lg }}>
              <View style={{ alignItems: 'center', gap: spacing.xs }}>
                <View
                  style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}
                >
                  {settled ? (
                    <CircleCheck
                      size={iconSize.sm}
                      color={colors.success}
                      strokeWidth={iconStroke}
                    />
                  ) : null}
                  <Text variant="label" color="textMuted">
                    {settled
                      ? t('khata.settled')
                      : theyOwe
                        ? t('khata.theyOwe')
                        : t('khata.youOwe')}
                  </Text>
                </View>
                <Amount
                  value={Math.abs(data?.balance ?? 0)}
                  variant="numericLarge"
                  color={settled ? 'success' : theyOwe ? 'primary' : 'danger'}
                />
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: dir.row, gap: spacing.lg }}>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text variant="caption" color="textMuted">
                    {t('khata.youGave')}
                  </Text>
                  <Amount
                    value={data?.given ?? 0}
                    variant="numericMedium"
                    direction="out"
                  />
                </View>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text variant="caption" color="textMuted">
                    {t('khata.youReceived')}
                  </Text>
                  <Amount
                    value={data?.received ?? 0}
                    variant="numericMedium"
                    direction="in"
                  />
                </View>
              </View>
            </Surface>

            <Button
              label={t('home.addTransaction')}
              icon={Plus}
              variant="secondary"
              fullWidth
              onPress={() =>
                router.push({ pathname: '/entry/new', params: { person: name } })
              }
            />

            {/* History */}
            <View style={{ gap: spacing.sm }}>
              <Text variant="headingSmall">{t('khata.history')}</Text>
              <Surface padding="lg">
                {(data?.transactions ?? []).map((item, index) => (
                  <View key={item.id}>
                    {index > 0 ? (
                      <View style={{ height: 1, backgroundColor: colors.border }} />
                    ) : null}
                    <TransactionCard transaction={item} onPress={setSelected} />
                  </View>
                ))}
                {!data?.transactions?.length ? (
                  <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
                    <IconBadge icon={CircleCheck} tone="neutral" />
                    <Text variant="bodySmall" color="textMuted" align="center">
                      {t('empty.peopleBody')}
                    </Text>
                  </View>
                ) : null}
              </Surface>
            </View>
          </>
        )}
      </ScrollView>

      <TransactionDetailSheet transaction={selected} onClose={() => setSelected(null)} />
    </View>
  );
}
