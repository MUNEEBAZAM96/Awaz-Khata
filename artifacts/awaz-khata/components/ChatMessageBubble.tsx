import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import type { ChatBubble } from '@/hooks/useFinanceChat';

const hasUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

interface Props {
  bubble: ChatBubble;
  isSpeaking: boolean;
  onReplay: (bubble: ChatBubble) => void;
}

/**
 * One chat row. RTL convention (mirrored from LTR chat apps):
 * the user's own messages sit on the LEFT, the advisor's on the RIGHT.
 */
export function ChatMessageBubble({ bubble, isSpeaking, onReplay }: Props) {
  const colors = useColors();
  const isUser = bubble.role === 'user';
  const urdu = hasUrdu(bubble.content);

  const textColor = isUser
    ? colors.primaryForeground
    : bubble.isError
      ? colors.destructive
      : colors.foreground;

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary, borderBottomLeftRadius: 6 }
            : {
                backgroundColor: bubble.isError ? colors.destructiveSoft : colors.card,
                borderColor: bubble.isError ? colors.destructive : colors.border,
                borderWidth: 1,
                borderBottomRightRadius: 6,
              },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontFamily: urdu ? fonts.urdu : fonts.number,
              lineHeight: urdu ? urduLine(15) : 22,
              textAlign: urdu ? 'right' : 'left',
            },
          ]}
        >
          {bubble.content}
        </Text>
      </View>
      {!isUser && !bubble.isError ? (
        <Pressable
          testID={`replay-${bubble.id}`}
          accessibilityLabel="دوبارہ سنیں"
          onPress={() => onReplay(bubble)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.replayButton,
            {
              backgroundColor: isSpeaking ? colors.primarySoft : 'transparent',
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name="volume-2"
            size={14}
            color={isSpeaking ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: 6,
  },
  rowAssistant: {
    justifyContent: 'flex-start',
    paddingLeft: 40,
  },
  rowUser: {
    justifyContent: 'flex-end',
    paddingRight: 40,
  },
  bubble: {
    flexShrink: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  text: {
    fontSize: 15,
    writingDirection: 'rtl',
  },
  replayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
