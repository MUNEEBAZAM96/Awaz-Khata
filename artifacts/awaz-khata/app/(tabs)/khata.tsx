import React, { useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search, Users, Wallet } from 'lucide-react-native';
import {
  getListTransactionsQueryKey,
  useListTransactions,
  type Transaction,
} from '@workspace/api-client-react';
import { Text } from '@/components/ui/Text';
import { Surface } from '@/components/ui/Surface';
import { Segmented } from '@/components/ui/Segmented';
import { TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pressable } from '@/components/ui/Pressable';
import { TransactionCard } from '@/components/TransactionCard';
import { PersonCard, type PersonSummary } from '@/components/PersonCard';
import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';
import { useTheme } from '@/theme';
import { useDirection, useI18n, useT } from '@/i18n';
import { dayLabel, pktDayKey } from '@/lib/format';

type Tab = 'transactions' | 'people';
type Filter = 'all' | 'expense' | 'income' | 'given' | 'received';

const FILTERS: Filter[] = ['all', 'expense', 'income', 'given', 'received'];

export default function KhataScreen() {
  const { colors, spacing, iconSize, iconStroke, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const { lang } = useI18n();
  const t = useT();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('transactions');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Transaction | null>(null);

  const list = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });
  const transactions = list.data?.transactions ?? [];

  /** Text + type filtering. Pure display filtering — no totals recomputed. */
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (!needle) return true;
      const haystack = [
        item.description,
        item.category,
        item.person,
        String(item.amount),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [transactions, query, filter]);

  /** Group into day sections, newest first. */
  const sections = useMemo(() => {
    const buckets = new Map<string, Transaction[]>();
    for (const item of filtered) {
      const key = pktDayKey(item.timestamp);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(item);
      else buckets.set(key, [item]);
    }
    return [...buckets.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, data]) => ({
        key,
        title: dayLabel(
          data[0]!.timestamp,
          { today: t('common.today'), yesterday: t('common.yesterday') },
          lang,
        ),
        data,
      }));
  }, [filtered, lang, t]);

  /**
   * People are derived by grouping the ledger the backend returned. The
   * per-person balance still uses the backend's own definition
   * (given − received) and the detail screen re-fetches the authoritative
   * figures from `/transactions/person/{name}`.
   */
  const people = useMemo<PersonSummary[]>(() => {
    const byPerson = new Map<string, PersonSummary>();
    for (const item of transactions) {
      const name = item.person?.trim();
      if (!name) continue;
      if (item.type !== 'given' && item.type !== 'received') continue;
      const key = name.toLowerCase();
      const entry = byPerson.get(key) ?? {
        person: name,
        given: 0,
        received: 0,
        balance: 0,
      };
      if (item.type === 'given') entry.given += item.amount;
      else entry.received += item.amount;
      entry.balance = entry.given - entry.received;
      byPerson.set(key, entry);
    }
    const needle = query.trim().toLowerCase();
    return [...byPerson.values()]
      .filter((p) => !needle || p.person.toLowerCase().includes(needle))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [transactions, query]);

  const header = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
      <View
        style={{
          flexDirection: dir.row,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <Text variant="headingLarge">{t('khata.title')}</Text>
        <Pressable
          accessibilityLabel={t('home.addTransaction')}
          onPress={() => router.push('/entry/new')}
          visualSize={40}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primarySoft,
          }}
        >
          <Plus size={iconSize.md} color={colors.primary} strokeWidth={iconStroke} />
        </Pressable>
      </View>

      <Segmented
        options={[
          { value: 'transactions', label: t('khata.tabTransactions') },
          { value: 'people', label: t('khata.tabPeople') },
        ]}
        value={tab}
        onChange={setTab}
      />

      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={t('khata.searchPlaceholder')}
        accessibilityLabel={t('common.search')}
      />

      {tab === 'transactions' ? (
        <View style={{ flexDirection: dir.row, flexWrap: 'wrap', gap: spacing.sm }}>
          {FILTERS.map((value) => {
            const active = filter === value;
            const label =
              value === 'all' ? t('khata.filterAll') : t(`txType.${value}` as const);
            return (
              <Pressable
                key={value}
                accessibilityLabel={active ? `${label}, ${t('a11y.selected')}` : label}
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(value)}
                visualSize={36}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.surface,
                }}
              >
                <Text
                  variant="caption"
                  color={active ? 'primary' : 'textMuted'}
                  directional={false}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );

  if (list.isError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xl,
        }}
      >
        {header}
        <ErrorState message={t('error.loadFailed')} onRetry={() => void list.refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'transactions' ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{
            paddingTop: insets.top + spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['4xl'],
          }}
          showsVerticalScrollIndicator={false}
          refreshing={list.isRefetching}
          onRefresh={() => void list.refetch()}
          renderSectionHeader={({ section }) => (
            <Text
              variant="label"
              color="textMuted"
              style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}
            >
              {section.title}
            </Text>
          )}
          renderItem={({ item, index, section }) => (
            <Surface
              padding="none"
              radius="lg"
              style={{
                paddingHorizontal: spacing.lg,
                borderTopLeftRadius: index === 0 ? radiusValue(radius.lg) : 0,
                borderTopRightRadius: index === 0 ? radiusValue(radius.lg) : 0,
                borderBottomLeftRadius:
                  index === section.data.length - 1 ? radiusValue(radius.lg) : 0,
                borderBottomRightRadius:
                  index === section.data.length - 1 ? radiusValue(radius.lg) : 0,
                borderBottomWidth: index === section.data.length - 1 ? 1 : 0,
              }}
            >
              <TransactionCard
                transaction={item}
                onPress={setSelected}
                showTime
              />
            </Surface>
          )}
          ListEmptyComponent={
            query || filter !== 'all' ? (
              <EmptyState
                icon={Search}
                title={t('empty.searchTitle')}
                body={t('empty.searchBody')}
              />
            ) : (
              <EmptyState
                icon={Wallet}
                title={t('empty.transactionsTitle')}
                body={t('empty.transactionsBody')}
                actionLabel={t('empty.transactionsAction')}
                onAction={() => router.push('/(tabs)/awaz')}
              />
            )
          }
        />
      ) : (
        <SectionList
          sections={[{ key: 'people', title: '', data: people }]}
          keyExtractor={(item) => item.person}
          ListHeaderComponent={header}
          contentContainerStyle={{
            paddingTop: insets.top + spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['4xl'],
            gap: spacing.sm,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={list.isRefetching}
          onRefresh={() => void list.refetch()}
          renderSectionHeader={() => null}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.sm }}>
              <PersonCard
                summary={item}
                onPress={(person) =>
                  router.push({ pathname: '/person/[name]', params: { name: person } })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={Users}
              title={query ? t('empty.searchTitle') : t('empty.peopleTitle')}
              body={query ? t('empty.searchBody') : t('empty.peopleBody')}
            />
          }
        />
      )}

      <TransactionDetailSheet transaction={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

/** SectionList rows need numeric radii for the corner-rounding maths. */
function radiusValue(value: number): number {
  return value;
}
