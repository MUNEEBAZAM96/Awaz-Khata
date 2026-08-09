import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import { TAB_BAR_CONTENT_HEIGHT } from '@/constants/layout';
import { useFinanceChat, type ChatBubble } from '@/hooks/useFinanceChat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ChatMessageBubble } from '@/components/ChatMessageBubble';

const EXAMPLE_QUESTIONS = [
  'کیا میں اگلے مہینے گاڑی لے سکتا ہوں؟',
  'میں پیسے کیسے بچا سکتا ہوں؟',
  'اس مہینے سب سے زیادہ خرچ کہاں ہوا؟',
];

const hasUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, pending, muted, speakingId, send, replay, toggleMute, stopSpeaking } =
    useFinanceChat();
  const voice = useVoiceInput(send);
  const [draft, setDraft] = useState('');
  const cancelVoice = voice.cancel;

  const webTop = Platform.OS === 'web' ? 67 : 0;
  const keyboardOffset =
    Platform.OS === 'ios' ? TAB_BAR_CONTENT_HEIGHT + insets.bottom : 0;

  // Inverted list => newest message first in data, auto-pinned to the bottom.
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  // Leaving the tab stops any answer still being read aloud (including TTS
  // requests still in flight) and abandons an in-progress recording.
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopSpeaking();
        void cancelVoice();
      };
    }, [stopSpeaking, cancelVoice]),
  );

  const canSend = draft.trim().length > 0 && !pending;
  const handleSend = () => {
    if (!canSend) return;
    const text = draft;
    setDraft('');
    void send(text);
  };

  const micDisabled = pending || voice.state === 'transcribing';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* RTL header: title on the right, mute toggle on the left */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + webTop + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>مالی مشیر</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            آپ کے اصل کھاتے کی بنیاد پر مشورہ
          </Text>
        </View>
        <Pressable
          testID="mute-toggle"
          accessibilityLabel={muted ? 'آواز کھولیں' : 'آواز بند کریں'}
          onPress={toggleMute}
          style={({ pressed }) => [
            styles.muteButton,
            {
              backgroundColor: muted ? colors.destructiveSoft : colors.secondary,
              borderColor: muted ? colors.destructive : colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name={muted ? 'volume-x' : 'volume-2'}
            size={20}
            color={muted ? colors.destructive : colors.secondaryForeground}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={keyboardOffset}
      >
        {messages.length === 0 ? (
          <EmptyState onPick={(question) => void send(question)} pending={pending} />
        ) : (
          <FlatList
            testID="chat-list"
            inverted
            data={invertedMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatMessageBubble
                bubble={item}
                isSpeaking={speakingId === item.id}
                onReplay={replay}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={pending ? <TypingIndicator /> : null}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        {voice.error ? (
          <Text style={[styles.voiceError, { color: colors.destructive }]}>
            {voice.error}
          </Text>
        ) : null}

        {/* RTL input row: text field on the right, mic + send to its left */}
        <View style={[styles.inputRow, { backgroundColor: colors.background }]}>
          <TextInput
            testID="chat-input"
            value={draft}
            onChangeText={setDraft}
            placeholder="اپنا سوال لکھیں…"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            submitBehavior="submit"
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.input,
                color: colors.foreground,
                fontFamily:
                  draft.length === 0 || hasUrdu(draft) ? fonts.urdu : fonts.number,
              },
            ]}
          />
          <Pressable
            testID="chat-mic"
            accessibilityLabel="بول کر پوچھیں"
            onPress={() => void voice.toggle()}
            disabled={micDisabled}
            style={({ pressed }) => [
              styles.roundButton,
              {
                backgroundColor:
                  voice.state === 'recording' ? colors.recording : colors.secondary,
                borderColor:
                  voice.state === 'recording' ? colors.recording : colors.border,
                opacity: micDisabled ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {voice.state === 'transcribing' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather
                name={voice.state === 'recording' ? 'square' : 'mic'}
                size={20}
                color={
                  voice.state === 'recording'
                    ? colors.destructiveForeground
                    : colors.secondaryForeground
                }
              />
            )}
          </Pressable>
          <Pressable
            testID="chat-send"
            accessibilityLabel="بھیجیں"
            onPress={handleSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.roundButton,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                opacity: !canSend ? 0.4 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather
              name="send"
              size={18}
              color={colors.primaryForeground}
              style={styles.sendIcon}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function TypingIndicator() {
  const colors = useColors();
  return (
    <View style={styles.typingRow}>
      <View
        style={[
          styles.typingBubble,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.typingText, { color: colors.mutedForeground }]}>
          سوچ رہا ہے…
        </Text>
      </View>
    </View>
  );
}

function EmptyState({
  onPick,
  pending,
}: {
  onPick: (question: string) => void;
  pending: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
        <Feather name="message-circle" size={30} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        اپنے پیسوں کے بارے میں کچھ بھی پوچھیں
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
        مشورہ آپ کے کھاتے کے اصل ہندسوں پر مبنی ہوگا۔ مثال کے طور پر:
      </Text>
      <View style={styles.chipColumn}>
        {EXAMPLE_QUESTIONS.map((question) => (
          <Pressable
            key={question}
            onPress={() => onPick(question)}
            disabled={pending}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pending ? 0.5 : pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: colors.foreground }]}>
              {question}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: urduLine(20),
    fontFamily: fonts.urduBold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 11,
    lineHeight: urduLine(11),
    fontFamily: fonts.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: -6,
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  typingRow: {
    flexDirection: 'row-reverse',
  },
  typingBubble: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
  voiceError: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 0,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'center',
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    transform: [{ scaleX: -1 }],
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontSize: 17,
    lineHeight: urduLine(17),
    fontFamily: fonts.urduBold,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  emptySubtitle: {
    fontSize: 12.5,
    lineHeight: urduLine(12.5),
    fontFamily: fonts.urdu,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  chipColumn: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13.5,
    lineHeight: urduLine(13.5),
    fontFamily: fonts.urduMedium,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
