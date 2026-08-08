import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import type { VoiceInteraction } from '@/hooks/useVoiceAssistant';

interface Props {
  interactions: VoiceInteraction[];
}

/**
 * Session-only conversation view for the Home voice screen: the last few
 * voice exchanges rendered as آپ / آواز کھاتہ pairs so judges can see
 * VOICE → TEXT → UNDERSTANDING → ACTION → VOICE RESPONSE at a glance.
 * Lives purely in React state — cleared when the app closes, by design.
 */
export function ConversationHistory({ interactions }: Props) {
  const colors = useColors();

  if (interactions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {interactions.map((item) => (
        <Animated.View key={item.id} entering={FadeInDown.duration(300)} style={styles.pair}>
          <View style={styles.userRow}>
            <View
              style={[
                styles.bubble,
                styles.userBubble,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text style={[styles.speaker, { color: colors.mutedForeground }]}>آپ</Text>
              <Text style={[styles.text, { color: colors.foreground }]}>
                {item.userText}
              </Text>
            </View>
          </View>
          <View style={styles.assistantRow}>
            <View
              style={[
                styles.bubble,
                styles.assistantBubble,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.speaker, { color: colors.mutedForeground }]}>
                آواز کھاتہ
              </Text>
              <Text style={[styles.text, { color: colors.foreground }]}>
                {item.assistantText}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 8,
  },
  pair: {
    gap: 6,
  },
  // RTL conversation: the user's bubble sits on the right, the assistant's
  // on the left — mirroring a familiar messaging layout for Urdu readers.
  userRow: {
    flexDirection: 'row-reverse',
  },
  assistantRow: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 2,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  speaker: {
    fontSize: 11,
    lineHeight: urduLine(11),
    fontFamily: fonts.urduMedium,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  text: {
    fontSize: 14,
    lineHeight: urduLine(14),
    fontFamily: fonts.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
