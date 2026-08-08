import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import { Waveform } from '@/components/Waveform';
import type { ReplyMeta, VoiceState } from '@/hooks/useVoiceAssistant';

const STATUS_LABELS: Record<VoiceState, string> = {
  idle: 'بولنے کے لیے دبائیں',
  listening: 'سن رہا ہوں...',
  processing: 'آپ کی بات سمجھ رہا ہوں...',
  speaking: 'آپ کو جواب دے رہا ہوں...',
};

// Softer secondary lines that make the assistant feel attentive.
const SECONDARY_LABELS: Partial<Record<VoiceState, string>> = {
  idle: 'اپنے پیسوں کے بارے میں بتائیں یا پوچھیں',
};

/** Three pulsing dots — an "understanding" indicator, not a generic spinner. */
function ThinkingDot({ index, color }: { index: number; color: string }) {
  const opacity = useSharedValue(0.25);
  useEffect(() => {
    opacity.value = withDelay(
      index * 180,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 360, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 360, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [index, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style, { backgroundColor: color }]} />;
}

/** Gold check that pops in when a transaction lands in the khata. */
function SuccessCheck({ background, color }: { background: string; color: string }) {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.15, { duration: 220, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 120 }),
    );
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.check, style, { backgroundColor: background }]}>
      <Feather name="check" size={18} color={color} />
    </Animated.View>
  );
}

interface Props {
  state: VoiceState;
  transcript: string | null;
  reply: string | null;
  replyMeta: ReplyMeta | null;
  error: string | null;
}

export function VoiceStatus({ state, transcript, reply, replyMeta, error }: Props) {
  const colors = useColors();
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  // The assistant's reply is shown as a card during/after speaking so the
  // confirmation or answer can be read as well as heard.
  const showReply = Boolean(reply) && !error && (isSpeaking || state === 'idle');
  // The transcript («what you said») yields its slot to the reply card, and
  // the status label hides while speaking — the card itself is the status.
  const showTranscript = Boolean(transcript) && !showReply && !error;
  const showLabel = !(isSpeaking && showReply);

  const cardProgress = useSharedValue(0);
  useEffect(() => {
    if (showReply || showTranscript) {
      cardProgress.value = 0;
      cardProgress.value = withTiming(1, {
        duration: 320,
        easing: Easing.out(Easing.quad),
      });
    } else {
      cardProgress.value = 0;
    }
  }, [showReply, showTranscript, reply, transcript, cardProgress]);
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [{ translateY: (1 - cardProgress.value) * 10 }],
  }));

  // Person-balance style query results get a structured breakdown card.
  const q = replyMeta?.kind === 'query' ? replyMeta.result : undefined;
  const hasBalanceBreakdown =
    q != null &&
    typeof q['given'] === 'number' &&
    typeof q['received'] === 'number' &&
    typeof q['balance'] === 'number';

  return (
    <View style={styles.wrap}>
      {showLabel ? (
        <View style={styles.statusRow}>
          {state === 'processing' ? (
            <View style={styles.dotsRow}>
              <ThinkingDot index={0} color={colors.primary} />
              <ThinkingDot index={1} color={colors.primary} />
              <ThinkingDot index={2} color={colors.primary} />
            </View>
          ) : null}
          <Text
            style={[
              styles.label,
              {
                color: isListening ? colors.recording : colors.mutedForeground,
                fontFamily: isListening ? fonts.urduMedium : fonts.urdu,
              },
            ]}
          >
            {STATUS_LABELS[state]}
          </Text>
        </View>
      ) : null}

      {isListening || isSpeaking ? (
        <Waveform
          color={isListening ? colors.recording : colors.accent}
          active
        />
      ) : null}

      {showLabel && SECONDARY_LABELS[state] && !transcript && !error ? (
        <Text style={[styles.secondary, { color: colors.mutedForeground }]}>
          {SECONDARY_LABELS[state]}
        </Text>
      ) : null}

      {showTranscript ? (
        <Animated.View
          style={[
            styles.floatCard,
            cardAnimatedStyle,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.captionRow}>
            <Feather name="mic" size={11} color={colors.mutedForeground} />
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>
              آپ نے کہا
            </Text>
          </View>
          <Text
            style={[styles.transcript, { color: colors.foreground }]}
            numberOfLines={2}
          >
            «{transcript}»
          </Text>
        </Animated.View>
      ) : null}

      {showReply ? (
        <Animated.View
          style={[
            styles.floatCard,
            cardAnimatedStyle,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {replyMeta?.kind === 'transaction' ? (
            <SuccessCheck background={colors.successSoft} color={colors.success} />
          ) : (
            <View style={[styles.replyAccent, { backgroundColor: colors.accent }]} />
          )}

          {hasBalanceBreakdown ? (
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>
                  دیا گیا
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.foreground }]}>
                  Rs. {(q['given'] as number).toLocaleString('en-PK')}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>
                  واپس ملا
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.foreground }]}>
                  Rs. {(q['received'] as number).toLocaleString('en-PK')}
                </Text>
              </View>
              <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
              <View style={styles.breakdownRow}>
                <Text
                  style={[
                    styles.breakdownLabel,
                    { color: colors.foreground, fontFamily: fonts.urduMedium },
                  ]}
                >
                  باقی
                </Text>
                <Text style={[styles.breakdownTotal, { color: colors.primary }]}>
                  Rs. {Math.abs(q['balance'] as number).toLocaleString('en-PK')}
                </Text>
              </View>
            </View>
          ) : null}

          <Text
            style={[styles.replyText, { color: colors.foreground }]}
            numberOfLines={3}
          >
            {reply}
          </Text>
        </Animated.View>
      ) : null}

      {error ? (
        <View
          style={[
            styles.errorCard,
            { backgroundColor: colors.destructiveSoft, borderColor: colors.destructiveSoft },
          ]}
        >
          <Feather name="alert-circle" size={16} color={colors.destructive} />
          <Text style={[styles.error, { color: colors.destructive }]} numberOfLines={3}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 4,
    minHeight: 56,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  label: {
    fontSize: 15,
    lineHeight: urduLine(15),
    writingDirection: 'rtl',
  },
  secondary: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  floatCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#1C2A24',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  captionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  caption: {
    fontSize: 11,
    lineHeight: urduLine(11),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
    opacity: 0.8,
  },
  transcript: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 16,
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyAccent: {
    width: 26,
    height: 3,
    borderRadius: 999,
  },
  breakdown: {
    alignSelf: 'stretch',
    gap: 2,
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  breakdownRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
  breakdownValue: {
    fontSize: 14,
    fontFamily: fonts.numberMedium,
    fontVariant: ['tabular-nums'],
  },
  breakdownDivider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 2,
  },
  breakdownTotal: {
    fontSize: 17,
    fontFamily: fonts.numberBold,
    fontVariant: ['tabular-nums'],
  },
  replyText: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  errorCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    maxWidth: '100%',
  },
  error: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urduMedium,
    textAlign: 'right',
    writingDirection: 'rtl',
    flexShrink: 1,
  },
});
