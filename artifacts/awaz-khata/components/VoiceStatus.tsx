import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import type { VoiceState } from '@/hooks/useVoiceAssistant';

const STATUS_LABELS: Record<VoiceState, string> = {
  idle: 'بولنے کے لیے دبائیں',
  listening: 'سن رہا ہوں...',
  processing: 'سمجھ رہا ہوں...',
  speaking: 'جواب دے رہا ہوں...',
};

interface Props {
  state: VoiceState;
  transcript: string | null;
  reply: string | null;
  error: string | null;
}

export function VoiceStatus({ state, transcript, reply, error }: Props) {
  const colors = useColors();
  const isListening = state === 'listening';

  // The assistant's reply is shown as a card during/after speaking so the
  // confirmation or answer can be read as well as heard.
  const showReply =
    Boolean(reply) && !error && (state === 'speaking' || state === 'idle');
  // The transcript («what you said») yields its slot to the reply card, and
  // the status label hides while speaking — the card itself is the status.
  const showTranscript = Boolean(transcript) && !showReply;
  const showLabel = !(state === 'speaking' && showReply);

  const replyOpacity = useSharedValue(0);
  useEffect(() => {
    replyOpacity.value = showReply ? withTiming(1, { duration: 350 }) : 0;
  }, [showReply, reply, replyOpacity]);
  const replyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: replyOpacity.value,
  }));

  return (
    <View style={styles.wrap}>
      {showLabel ? (
        <View style={styles.statusRow}>
          {state === 'processing' ? (
            <ActivityIndicator size="small" color={colors.primary} />
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

      {showTranscript ? (
        <Text
          style={[styles.transcript, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          «{transcript}»
        </Text>
      ) : null}

      {showReply ? (
        <Animated.View
          style={[
            styles.replyCard,
            replyAnimatedStyle,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.replyAccent, { backgroundColor: colors.accent }]} />
          <Text
            style={[styles.replyText, { color: colors.foreground }]}
            numberOfLines={3}
          >
            {reply}
          </Text>
        </Animated.View>
      ) : null}

      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]} numberOfLines={3}>
          {error}
        </Text>
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
  label: {
    fontSize: 15,
    lineHeight: urduLine(15),
    writingDirection: 'rtl',
  },
  transcript: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 16,
  },
  replyCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  replyAccent: {
    width: 26,
    height: 3,
    borderRadius: 999,
  },
  replyText: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urduMedium,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  error: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urduMedium,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 16,
  },
});
