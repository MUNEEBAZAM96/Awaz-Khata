import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useListTransactions,
  getListTransactionsQueryKey,
  type Transaction,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { TransactionRow } from '@/components/TransactionRow';

interface PersonBalance {
  person: string;
  balance: number;
}

function peopleFrom(transactions: Transaction[]): PersonBalance[] {
  const map = new Map<string, { person: string; given: number; received: number }>();
  for (const t of transactions) {
    if (!t.person || (t.type !== 'given' && t.type !== 'received')) continue;
    const key = t.person.trim().toLowerCase();
    let entry = map.get(key);
    if (!entry) {
      entry = { person: t.person.trim(), given: 0, received: 0 };
      map.set(key, entry);
    }
    if (t.type === 'given') entry.given += t.amount;
    else entry.received += t.amount;
  }
  return [...map.values()]
    .map((e) => ({ person: e.person, balance: e.given - e.received }))
    .sort((a, b) => b.balance - a.balance);
}

export default function LedgerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const query = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });
  const transactions = query.data?.transactions ?? [];
  const summary = query.data?.summary;
  const people = useMemo(() => peopleFrom(transactions), [transactions]);

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;

  const summaryBlocks = [
    { label: 'آمدن', value: summary?.income ?? 0, color: colors.success },
    { label: 'خرچ', value: summary?.expenses ?? 0, color: colors.destructive },
    { label: 'لوگوں کو دیے', value: summary?.given ?? 0, color: colors.foreground },
    { label: 'واپس آئے', value: summary?.received ?? 0, color: colors.foreground },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Pressable
          testID="back-button"
          accessibilityLabel="واپس"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>میرا کھاتہ</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {query.isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : query.isError ? (
        <View style={styles.centerFill}>
          <Feather name="wifi-off" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            کھاتہ لوڈ نہیں ہو سکا
          </Text>
          <Pressable
            onPress={() => query.refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>
              دوبارہ کوشش کریں
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + webBottom + 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => query.refetch()}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.summaryGrid}>
            {summaryBlocks.map((block) => (
              <View
                key={block.label}
                style={[
                  styles.summaryCell,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  {block.label}
                </Text>
                <Text style={[styles.summaryValue, { color: block.color }]}>
                  Rs. {block.value.toLocaleString('en-PK')}
                </Text>
              </View>
            ))}
          </View>

          {people.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                لوگوں کا حساب
              </Text>
              {people.map((p) => (
                <View
                  key={p.person}
                  style={[styles.personRow, { borderColor: colors.border }]}
                >
                  <Text
                    style={[styles.personName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {p.person}
                  </Text>
                  <Text
                    style={[
                      styles.personBalance,
                      { color: p.balance > 0 ? colors.destructive : colors.success },
                    ]}
                  >
                    Rs. {Math.abs(p.balance).toLocaleString('en-PK')}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              تمام لین دین
            </Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Feather name="book-open" size={26} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  ابھی کھاتہ خالی ہے{'\n'}مائیک دبا کر پہلا اندراج کریں
                </Text>
              </View>
            ) : (
              transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  summaryCell: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 14,
    writingDirection: 'rtl',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 14,
    gap: 16,
    minHeight: 56,
  },
  personName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  personBalance: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  retryButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
});
