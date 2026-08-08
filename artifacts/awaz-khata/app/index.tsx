import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  runQuery,
  useListTransactions,
  getListTransactionsQueryKey,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceStatus } from '@/components/VoiceStatus';
import { SummaryHeader } from '@/components/SummaryHeader';
import { ActivityList } from '@/components/ActivityList';

export default function MainVoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, transcript, error, toggle } = useVoiceAssistant();

  const query = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });
  const transactions = query.data?.transactions ?? [];

  // The backend finance engine is the single calculation authority —
  // "today" is computed there (PKT), not on the device.
  const todayQuery = useQuery({
    queryKey: ['finance', 'today-expenses'],
    queryFn: () => runQuery({ query_type: 'total_expenses', period: 'today' }),
  });
  const todayExpenses =
    typeof todayQuery.data?.result?.['total'] === 'number'
      ? (todayQuery.data.result['total'] as number)
      : 0;

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + webTop + 20 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>آواز کھاتہ</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          اپنے پیسوں کا حساب، بس بول کر
        </Text>
      </View>

      <View style={styles.summaryWrap}>
        <SummaryHeader todayExpenses={todayExpenses} />
      </View>

      <View style={styles.centerArea}>
        <VoiceButton state={state} onPress={toggle} />
        <VoiceStatus state={state} transcript={transcript} error={error} />
      </View>

      <View style={styles.activitySection}>
        <ActivityList transactions={transactions} />
      </View>

      <View style={{ paddingBottom: insets.bottom + webBottom + 16 }}>
        <Pressable
          testID="open-ledger"
          onPress={() => router.push('/ledger')}
          style={({ pressed }) => [
            styles.ledgerButton,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="book" size={20} color={colors.secondaryForeground} />
          <Text style={[styles.ledgerButtonText, { color: colors.secondaryForeground }]}>
            پورا کھاتہ دیکھیں
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  tagline: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    writingDirection: 'rtl',
  },
  summaryWrap: {
    marginTop: 20,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  activitySection: {
    minHeight: 80,
    marginBottom: 12,
  },
  ledgerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  ledgerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
});
