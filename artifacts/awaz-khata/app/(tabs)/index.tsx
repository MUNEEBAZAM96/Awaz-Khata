import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, MessagesSquare, Mic, Plus, Wallet } from 'lucide-react-native';
import {
  getListTransactionsQueryKey,
  runQuery,
  useListTransactions,
  type Transaction,
} from '@workspace/api-client-react';
import { Text } from '@/components/ui/Text';
import { Surface } from '@/components/ui/Surface';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickAction, QuickActionRow } from '@/components/QuickAction';
import { TransactionCard } from '@/components/TransactionCard';
import { SpendingOverview, type CategorySlice } from '@/components/SpendingOverview';
import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { pktHour } from '@/lib/format';

const RECENT_LIMIT = 5;

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const t = useT();
  const router = useRouter();
  const { prefs } = usePreferences();

  const [selected, setSelected] = React.useState<Transaction | null>(null);

  const list = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });

  // Category breakdown comes from the finance engine, scoped to this month.
  const categories = useQuery({
    queryKey: ['finance', 'category-summary', 'this_month'],
    queryFn: () => runQuery({ query_type: 'category_summary', period: 'this_month' }),
  });

  const monthly = useQuery({
    queryKey: ['finance', 'monthly-summary'],
    queryFn: () => runQuery({ query_type: 'monthly_summary' }),
  });

  const summary = list.data?.summary;
  const transactions = list.data?.transactions ?? [];
  const recent = useMemo(() => transactions.slice(0, RECENT_LIMIT), [transactions]);

  const slices = useMemo<CategorySlice[]>(() => {
    const raw = categories.data?.result?.['categories'];
    if (!raw || typeof raw !== 'object') return [];
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, amount]) => typeof amount === 'number')
      .map(([category, amount]) => ({ category, amount: amount as number }));
  }, [categories.data]);

  const monthExpenses = useMemo(() => {
    const value = monthly.data?.result?.['expenses'];
    return typeof value === 'number' ? value : 0;
  }, [monthly.data]);

  const greeting = useMemo(() => {
    const hour = pktHour();
    const key =
      hour < 12 ? 'greeting.morning' : hour < 17 ? 'greeting.afternoon' : 'greeting.evening';
    const base = t(key as 'greeting.morning');
    const name = prefs.userName.trim();
    return name ? t('greeting.withName', { greeting: base, name }) : base;
  }, [t, prefs.userName]);

  const refreshing =
    list.isRefetching || categories.isRefetching || monthly.isRefetching;

  const refresh = () => {
    void list.refetch();
    void categories.refetch();
    void monthly.refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenBackground />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['4xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={{ gap: spacing.xs }}>
          <Text variant="bodyMedium" color="textMuted">
            {greeting}
          </Text>
          <Text variant="headingLarge">{t('common.appName')}</Text>
        </View>

        {list.isError ? (
          <ErrorState
            message={t('error.loadFailed')}
            onRetry={() => void list.refetch()}
            compact
          />
        ) : (
          <BalanceCard
            balance={summary?.balance ?? 0}
            income={summary?.income ?? 0}
            expenses={summary?.expenses ?? 0}
            loading={list.isLoading}
          />
        )}

        {/* Quick actions */}
        <View style={{ gap: spacing.md }}>
          <Text variant="label" color="textMuted">
            {t('home.quickActions')}
          </Text>
          <QuickActionRow>
            <QuickAction
              icon={Mic}
              label={t('home.speak')}
              tone="primary"
              onPress={() => router.push('/(tabs)/awaz')}
            />
            <QuickAction
              icon={Plus}
              label={t('home.addTransaction')}
              tone="accent"
              onPress={() => router.push('/entry/new')}
            />
            <QuickAction
              icon={BookOpen}
              label={t('home.openKhata')}
              tone="neutral"
              onPress={() => router.push('/(tabs)/khata')}
            />
          </QuickActionRow>
        </View>

        {/* Spending overview */}
        <View>
          <SectionHeader title={t('home.spendingTitle')} />
          <Surface padding="lg">
            <SpendingOverview slices={slices} total={monthExpenses} />
          </Surface>
        </View>

        {/* Recent activity */}
        <View>
          <SectionHeader
            title={t('home.recentTransactions')}
            actionLabel={transactions.length ? t('common.seeAll') : undefined}
            onAction={
              transactions.length ? () => router.push('/(tabs)/khata') : undefined
            }
          />
          <Surface padding="lg">
            {recent.length ? (
              recent.map((transaction, index) => (
                <View key={transaction.id}>
                  {index > 0 ? (
                    <View style={{ height: 1, backgroundColor: colors.border }} />
                  ) : null}
                  <TransactionCard transaction={transaction} onPress={setSelected} />
                </View>
              ))
            ) : (
              <EmptyState
                icon={Wallet}
                title={t('empty.transactionsTitle')}
                body={t('empty.transactionsBody')}
                actionLabel={t('empty.transactionsAction')}
                actionIcon={Mic}
                onAction={() => router.push('/(tabs)/awaz')}
                compact
              />
            )}
          </Surface>
        </View>

        {/* Voice-first reminder: the assistant can answer anything on this page. */}
        <Surface padding="lg" sunken bordered={false}>
          <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.md }}>
            <MessagesSquare size={20} color={colors.primary} strokeWidth={2} />
            <Text variant="bodySmall" color="textSecondary" style={{ flex: 1 }}>
              {t('suggestions.todaySpend')}
            </Text>
          </View>
        </Surface>
      </ScrollView>

      <TransactionDetailSheet
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
