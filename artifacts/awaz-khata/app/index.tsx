import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { fonts, urduLine } from '@/constants/typography';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceStatus } from '@/components/VoiceStatus';
import { SummaryHeader } from '@/components/SummaryHeader';
import { ActivityList } from '@/components/ActivityList';

export default function MainVoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, transcript, reply, error, toggle } = useVoiceAssistant();

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
      {/*
       * The column scrolls ONLY when it cannot fit (small screens, long
       * replies). On normal phones content fits, nothing scrolls, and the
       * mic stays visually centered via flexGrow.
       */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTop + 12 },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View>
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
          <VoiceStatus
            state={state}
            transcript={transcript}
            reply={reply}
            error={error}
          />
        </View>

        <View style={styles.activitySection}>
          <ActivityList transactions={transactions} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + webBottom + 16 },
        ]}
      >
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  title: {
    fontSize: 30,
    lineHeight: urduLine(30),
    fontFamily: fonts.urduBold,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  tagline: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: -4,
  },
  summaryWrap: {
    marginTop: 12,
  },
  centerArea: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  activitySection: {
    minHeight: 72,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  ledgerButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  ledgerButtonText: {
    fontSize: 16,
    lineHeight: urduLine(16),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
});
