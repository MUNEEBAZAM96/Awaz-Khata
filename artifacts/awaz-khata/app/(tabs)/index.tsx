import React, { useCallback, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
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
import { ConversationHistory } from '@/components/ConversationHistory';
import { SummaryHeader } from '@/components/SummaryHeader';
import { ActivityList } from '@/components/ActivityList';
import { SuggestionPills } from '@/components/SuggestionPills';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function MainVoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    state,
    transcript,
    reply,
    replyMeta,
    error,
    interactions,
    toggle,
    ask,
    cancel,
  } = useVoiceAssistant();

  // Switching tabs mid-recording/mid-speech must never leave the mic or
  // voice running — abandon both on blur.
  useFocusEffect(
    useCallback(() => {
      return () => {
        void cancel();
      };
    }, [cancel]),
  );

  // Gentle header entrance (timing-based, so it also runs on web).
  const intro = useSharedValue(0);
  useEffect(() => {
    intro.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) });
  }, [intro]);
  const introStyle = useAnimatedStyle(() => ({
    opacity: intro.value,
    transform: [{ translateY: (1 - intro.value) * 8 }],
  }));

  const query = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });
  const transactions = query.data?.transactions ?? [];

  // The backend finance engine is the single calculation authority —
  // "today" is computed there (PKT), not on the device.
  const todayQuery = useQuery({
    queryKey: ['finance', 'today-summary'],
    queryFn: () => runQuery({ query_type: 'today_summary' }),
  });
  const todayNumber = (key: string): number => {
    const value = todayQuery.data?.result?.[key];
    return typeof value === 'number' ? value : 0;
  };

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const busy = state !== 'idle';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenBackground />
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
        <Animated.View style={introStyle}>
          <View style={styles.brandRow}>
            <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.brand, { color: colors.mutedForeground }]}>
              آواز کھاتہ
            </Text>
          </View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            السلام علیکم
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            آج کا حساب کیا ہے؟
          </Text>
        </Animated.View>

        <View style={styles.summaryWrap}>
          <SummaryHeader
            todayExpenses={todayNumber('expenses')}
            todayGiven={todayNumber('given')}
            todayReceived={todayNumber('received')}
          />
        </View>

        <View style={styles.centerArea}>
          <VoiceButton state={state} onPress={toggle} />
          <VoiceStatus
            state={state}
            transcript={transcript}
            reply={reply}
            replyMeta={replyMeta}
            error={error}
          />
        </View>

        <ConversationHistory interactions={interactions} />

        <View style={styles.pillsWrap}>
          <SuggestionPills onAsk={(text) => void ask(text)} disabled={busy} />
        </View>

        <View style={styles.activitySection}>
          <ActivityList
            transactions={transactions}
            onSeeAll={() => router.push('/(tabs)/ledger')}
          />
        </View>
      </ScrollView>
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
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  brand: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  greeting: {
    fontSize: 14,
    lineHeight: urduLine(14),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  title: {
    fontSize: 26,
    lineHeight: urduLine(26),
    fontFamily: fonts.urduBold,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: -6,
  },
  summaryWrap: {
    marginTop: 10,
  },
  centerArea: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  pillsWrap: {
    marginBottom: 14,
  },
  activitySection: {
    minHeight: 72,
  },
});
