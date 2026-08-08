import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  createTransaction,
  extractIntent,
  getCustomerLedger,
  getListCustomersQueryKey,
  speakText,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { transcribeRecording, playBase64Audio } from '@/lib/voice';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ActivityEntry {
  id: string;
  customer: string;
  amount: number | null;
  type: 'credit' | 'payment' | 'query';
  detail: string;
}

const STATUS_LABELS: Record<VoiceState, string> = {
  idle: 'بولنے کے لیے مائیک دبائیں',
  listening: 'سن رہا ہوں…',
  processing: 'سمجھ رہا ہوں…',
  speaking: 'جواب دے رہا ہوں…',
};

function formatRupees(amount: number): string {
  return `${Math.abs(amount).toLocaleString('en-PK')} روپے`;
}

export default function MainVoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const busyRef = useRef(false);

  const pulse = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (voiceState === 'listening') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [voiceState, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pushActivity = useCallback((entry: ActivityEntry) => {
    setActivity((prev) => [entry, ...prev].slice(0, 5));
  }, []);

  const runPipeline = useCallback(
    async (uri: string) => {
      setVoiceState('processing');
      setErrorMessage(null);
      try {
        const text = await transcribeRecording(uri);
        setTranscript(text);

        const intent = await extractIntent({ text });
        let reply: string;

        if (intent.mode === 'transaction' && intent.amount != null && intent.type) {
          const saved = await createTransaction({
            customer: intent.customer,
            amount: intent.amount,
            type: intent.type,
            item: intent.item ?? null,
          });
          queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          reply =
            saved.type === 'credit'
              ? `${formatRupees(saved.amount)} ${saved.customer} کے کھاتے میں لکھ دیے`
              : `${formatRupees(saved.amount)} ${saved.customer} کے کھاتے سے کم کر دیے`;
          pushActivity({
            id: saved.id,
            customer: saved.customer,
            amount: saved.amount,
            type: saved.type,
            detail: saved.item ? saved.item : reply,
          });
        } else {
          try {
            const ledger = await getCustomerLedger(intent.customer);
            reply =
              ledger.balance > 0
                ? `${ledger.customer} کے ذمے ${formatRupees(ledger.balance)} ہیں`
                : `${ledger.customer} کا حساب برابر ہے`;
            pushActivity({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              customer: ledger.customer,
              amount: ledger.balance,
              type: 'query',
              detail: reply,
            });
          } catch {
            reply = `${intent.customer} کا کھاتہ نہیں ملا`;
          }
        }

        const speech = await speakText({ text: reply });
        setVoiceState('speaking');
        await playBase64Audio(speech.audioBase64);
        setVoiceState('idle');
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'معاف کیجیے، دوبارہ کوشش کریں';
        setErrorMessage(message);
        setVoiceState('idle');
      }
    },
    [pushActivity, queryClient],
  );

  const onMicPress = useCallback(async () => {
    if (busyRef.current) return;
    scale.value = withSequence(withSpring(0.92), withSpring(1));

    if (voiceState === 'idle') {
      busyRef.current = true;
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          setErrorMessage('مائیکروفون کی اجازت درکار ہے');
          return;
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setErrorMessage(null);
        setTranscript(null);
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setVoiceState('listening');
      } catch {
        setErrorMessage('ریکارڈنگ شروع نہیں ہو سکی');
      } finally {
        busyRef.current = false;
      }
      return;
    }

    if (voiceState === 'listening') {
      busyRef.current = true;
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) {
          setErrorMessage('ریکارڈنگ محفوظ نہیں ہوئی، دوبارہ کوشش کریں');
          setVoiceState('idle');
          return;
        }
        await runPipeline(uri);
      } catch {
        setErrorMessage('معاف کیجیے، دوبارہ کوشش کریں');
        setVoiceState('idle');
      } finally {
        busyRef.current = false;
      }
    }
  }, [voiceState, recorder, runPipeline, scale]);

  const isListening = voiceState === 'listening';
  const micColor = isListening ? colors.recording : colors.primary;
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + webTop + 24 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>آواز کھاتہ</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          بول کر لکھیں، بول کر پوچھیں
        </Text>
      </View>

      <View style={styles.centerArea}>
        <View style={styles.statusRow}>
          {voiceState === 'processing' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
          <Text
            style={[
              styles.statusLabel,
              { color: isListening ? colors.recording : colors.mutedForeground },
            ]}
          >
            {STATUS_LABELS[voiceState]}
          </Text>
        </View>

        <View style={styles.micWrap}>
          <Animated.View
            style={[
              styles.halo,
              haloStyle,
              {
                backgroundColor: isListening
                  ? 'rgba(192, 58, 43, 0.15)'
                  : 'rgba(14, 95, 73, 0.10)',
              },
            ]}
          />
          <Animated.View style={buttonStyle}>
            <Pressable
              testID="mic-button"
              accessibilityLabel="ریکارڈ کریں"
              onPress={onMicPress}
              disabled={voiceState === 'processing' || voiceState === 'speaking'}
              style={({ pressed }) => [
                styles.micButton,
                {
                  backgroundColor: micColor,
                  opacity:
                    voiceState === 'processing' || voiceState === 'speaking'
                      ? 0.55
                      : pressed
                        ? 0.9
                        : 1,
                },
              ]}
            >
              <Feather
                name={isListening ? 'square' : voiceState === 'speaking' ? 'volume-2' : 'mic'}
                size={56}
                color={colors.primaryForeground}
              />
            </Pressable>
          </Animated.View>
        </View>

        {transcript ? (
          <Text
            style={[styles.transcript, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            «{transcript}»
          </Text>
        ) : null}
        {errorMessage ? (
          <Text style={[styles.error, { color: colors.destructive }]} numberOfLines={2}>
            {errorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.activitySection}>
        {activity.length > 0 ? (
          <ScrollView
            style={styles.activityList}
            contentContainerStyle={{ gap: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {activity.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.activityRow,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Feather name="check-circle" size={20} color={colors.success} />
                <View style={styles.activityTextWrap}>
                  <Text
                    style={[styles.activityCustomer, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {entry.customer}
                  </Text>
                  <Text
                    style={[styles.activityDetail, { color: colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {entry.type === 'query'
                      ? 'بقایا پوچھا'
                      : entry.type === 'credit'
                        ? 'ادھار لکھا'
                        : 'وصولی ہوئی'}
                  </Text>
                </View>
                {entry.amount != null ? (
                  <Text
                    style={[
                      styles.activityAmount,
                      {
                        color:
                          entry.type === 'payment' ? colors.success : colors.destructive,
                      },
                    ]}
                  >
                    {Math.abs(entry.amount).toLocaleString('en-PK')}
                  </Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyActivity}>
            <Feather name="book-open" size={20} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              مثال: «علی کو پانچ سو روپے کا ادھار دیا»
            </Text>
          </View>
        )}
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
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    writingDirection: 'rtl',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },
  statusLabel: {
    fontSize: 17,
    writingDirection: 'rtl',
  },
  micWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
  },
  halo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  transcript: {
    fontSize: 15,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 12,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 12,
  },
  activitySection: {
    minHeight: 92,
    maxHeight: 220,
    marginBottom: 12,
  },
  activityList: {
    flexGrow: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityCustomer: {
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  activityDetail: {
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  emptyActivity: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
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
