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
import {
  useListTransactions,
  getListTransactionsQueryKey,
  type Transaction,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
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

function balanceDirection(balance: number): string {
  if (balance > 0) return 'ان سے لینے ہیں';
  if (balance < 0) return 'ان کو دینے ہیں';
  return 'حساب برابر';
}

export default function LedgerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const query = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });
  const transactions = query.data?.transactions ?? [];
  const summary = query.data?.summary;
  const people = useMemo(() => peopleFrom(transactions), [transactions]);

  const webTop = Platform.OS === 'web' ? 67 : 0;

  const summaryBlocks = [
    { label: 'آمدن', value: summary?.income ?? 0, color: colors.success },
    { label: 'خرچ', value: summary?.expenses ?? 0, color: colors.destructive },
    { label: 'لوگوں کو دیے', value: summary?.given ?? 0, color: colors.foreground },
    { label: 'واپس آئے', value: summary?.received ?? 0, color: colors.foreground },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>میرا کھاتہ</Text>
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
            paddingBottom: 24,
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
              <View
                style={[
                  styles.cardList,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                {people.map((p, index) => (
                  <View
                    key={p.person}
                    style={[
                      styles.personRow,
                      index < people.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.personName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {p.person}
                    </Text>
                    <View style={styles.personBalanceWrap}>
                      <Text
                        style={[
                          styles.personBalance,
                          {
                            color:
                              p.balance > 0 ? colors.destructive : colors.success,
                          },
                        ]}
                      >
                        Rs. {Math.abs(p.balance).toLocaleString('en-PK')}
                      </Text>
                      <Text
                        style={[
                          styles.personDirection,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {balanceDirection(p.balance)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              تمام لین دین
            </Text>
            {transactions.length === 0 ? (
              <View
                style={[
                  styles.cardList,
                  styles.emptyWrap,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Feather name="book-open" size={26} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  ابھی کھاتہ خالی ہے{'\n'}مائیک دبا کر پہلا اندراج کریں
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.cardList,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                {transactions.map((t, index) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    showDivider={index < transactions.length - 1}
                  />
                ))}
              </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    lineHeight: urduLine(22),
    fontFamily: fonts.urduBold,
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
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  summaryCell: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: urduLine(16),
    fontFamily: fonts.urduBold,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 8,
  },
  cardList: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  personRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 16,
    minHeight: 60,
  },
  personName: {
    flex: 1,
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  personBalanceWrap: {
    alignItems: 'flex-start',
  },
  personBalance: {
    fontSize: 16,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
  },
  personDirection: {
    fontSize: 11,
    lineHeight: 20,
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: urduLine(14),
    fontFamily: fonts.urdu,
    textAlign: 'center',
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
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
});
