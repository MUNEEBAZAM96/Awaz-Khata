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
import { ScreenBackground } from '@/components/ScreenBackground';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

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

/** آج / کل / «12 اگست» — friendly section headers for the history list. */
function dayLabel(timestamp: string): string {
  const d = new Date(timestamp);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round(
    (startOf(today).getTime() - startOf(d).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return 'آج';
  if (diffDays === 1) return 'کل';
  try {
    return d.toLocaleDateString('ur-PK', { day: 'numeric', month: 'long' });
  } catch {
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  }
}

interface DayGroup {
  label: string;
  transactions: Transaction[];
}

function groupByDay(transactions: Transaction[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const t of transactions) {
    const label = dayLabel(t.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.transactions.push(t);
    else groups.push({ label, transactions: [t] });
  }
  return groups;
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
  const dayGroups = useMemo(() => groupByDay(transactions), [transactions]);

  const webTop = Platform.OS === 'web' ? 67 : 0;

  const summaryBlocks: {
    label: string;
    value: number;
    color: string;
    icon: FeatherName;
    iconBg: string;
  }[] = [
    {
      label: 'آمدن',
      value: summary?.income ?? 0,
      color: colors.success,
      icon: 'arrow-down-left',
      iconBg: colors.successSoft,
    },
    {
      label: 'خرچ',
      value: summary?.expenses ?? 0,
      color: colors.destructive,
      icon: 'arrow-up-right',
      iconBg: colors.destructiveSoft,
    },
    {
      label: 'لوگوں کو دیے',
      value: summary?.given ?? 0,
      color: colors.foreground,
      icon: 'user-minus',
      iconBg: colors.primarySoft,
    },
    {
      label: 'واپس آئے',
      value: summary?.received ?? 0,
      color: colors.foreground,
      icon: 'user-plus',
      iconBg: colors.accentSoft,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenBackground />
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>میرا کھاتہ</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          آپ کے پیسوں کا مکمل حساب
        </Text>
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
                <View style={[styles.summaryIcon, { backgroundColor: block.iconBg }]}>
                  <Feather name={block.icon} size={14} color={block.color} />
                </View>
                <View style={styles.summaryTextWrap}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                    {block.label}
                  </Text>
                  <Text style={[styles.summaryValue, { color: block.color }]}>
                    Rs. {block.value.toLocaleString('en-PK')}
                  </Text>
                </View>
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
                {people.map((p, index) => {
                  const settled = p.balance === 0;
                  return (
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
                      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}>
                          {p.person.trim().charAt(0)}
                        </Text>
                      </View>
                      <Text
                        style={[styles.personName, { color: colors.foreground }]}
                        numberOfLines={1}
                      >
                        {p.person}
                      </Text>
                      {settled ? (
                        <View style={styles.personBalanceWrap}>
                          <View style={styles.settledRow}>
                            <Feather name="check-circle" size={14} color={colors.success} />
                            <Text style={[styles.settledText, { color: colors.success }]}>
                              حساب برابر
                            </Text>
                          </View>
                        </View>
                      ) : (
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
                      )}
                    </View>
                  );
                })}
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
              dayGroups.map((group) => (
                <View key={group.label} style={styles.dayGroup}>
                  <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>
                    {group.label}
                  </Text>
                  <View
                    style={[
                      styles.cardList,
                      { borderColor: colors.border, backgroundColor: colors.card },
                    ]}
                  >
                    {group.transactions.map((t, index) => (
                      <TransactionRow
                        key={t.id}
                        transaction={t}
                        showDivider={index < group.transactions.length - 1}
                      />
                    ))}
                  </View>
                </View>
              ))
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
    fontSize: 24,
    lineHeight: urduLine(24),
    fontFamily: fonts.urduBold,
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
    marginTop: -4,
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
  summaryValue: {
    fontSize: 16,
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
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  dayGroup: {
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 6,
  },
  personRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    minHeight: 60,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduBold,
    writingDirection: 'rtl',
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
  settledRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  settledText: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  personBalance: {
    fontSize: 16,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
  },
  personDirection: {
    fontSize: 11,
    lineHeight: urduLine(11),
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
