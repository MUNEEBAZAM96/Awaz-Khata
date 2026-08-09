import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Keyboard, Send } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Surface } from '@/components/ui/Surface';
import { Pressable } from '@/components/ui/Pressable';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { MicButton } from '@/components/voice/MicButton';
import { VoiceStateView } from '@/components/voice/VoiceStateView';
import { TranscriptCard } from '@/components/voice/TranscriptCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { MicPermissionGate } from '@/components/voice/MicPermissionGate';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

/**
 * The hero screen.
 *
 * Everything above the fold serves one action: tap, speak, see what was
 * understood. The typed fallback shares the same intent pipeline — there is
 * no second code path for text.
 */
export default function AwazScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const t = useT();

  const {
    state,
    transcript,
    reply,
    error,
    saving,
    pending,
    interactions,
    toggle,
    ask,
    cancel,
    confirmPending,
    cancelPending,
  } = useVoiceAssistant();

  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');

  // Switching tabs mid-recording/mid-speech must never leave the mic or
  // voice running — abandon both on blur.
  useFocusEffect(
    useCallback(() => {
      return () => {
        void cancel();
      };
    }, [cancel]),
  );

  const busy = state !== 'idle' && state !== 'confirming';

  const submitDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setTyping(false);
    void ask(text);
  };

  const suggestions = [
    t('suggestions.todaySpend'),
    t('suggestions.monthSummary'),
    t('suggestions.topCategory'),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenBackground />
      <MicPermissionGate />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['3xl'],
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="headingLarge" align="center">
            {t('voice.title')}
          </Text>
          <Text variant="bodySmall" color="textMuted" align="center">
            {t('voice.prompt')}
          </Text>
        </View>

        {/* Mic + state, vertically centred when the content fits. */}
        <View
          style={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          {state === 'idle' && !transcript ? (
            <Text variant="headingMedium" color="textSecondary" align="center">
              {t('voice.idleHeading')}
            </Text>
          ) : null}

          <MicButton state={state === 'confirming' ? 'idle' : state} onPress={toggle} />
          <VoiceStateView state={state} error={error} saving={saving} />
        </View>

        {/* What was heard and understood, before anything is written. */}
        {transcript ? (
          <TranscriptCard
            transcript={transcript}
            understood={pending}
            needsConfirmation={state === 'confirming' && !!pending}
            onConfirm={() => void confirmPending()}
            onCancel={cancelPending}
            confirming={saving}
          />
        ) : null}

        {reply && !pending ? (
          <Surface padding="lg" sunken bordered={false}>
            <Text variant="bodyLarge">{reply}</Text>
          </Surface>
        ) : null}

        {/* Typed fallback — same pipeline, no separate finance path. */}
        {typing ? (
          <View style={{ gap: spacing.md }}>
            <TextField
              value={draft}
              onChangeText={setDraft}
              placeholder={t('voice.typePlaceholder')}
              accessibilityLabel={t('voice.typeInstead')}
              autoFocus
              returnKeyType="send"
              onSubmitEditing={submitDraft}
            />
            <View style={{ flexDirection: dir.row, gap: spacing.md }}>
              <Button
                label={t('common.cancel')}
                variant="ghost"
                style={{ flex: 1 }}
                onPress={() => {
                  setTyping(false);
                  setDraft('');
                }}
              />
              <Button
                label={t('voice.send')}
                icon={Send}
                style={{ flex: 1 }}
                disabled={!draft.trim() || busy}
                onPress={submitDraft}
              />
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityLabel={t('voice.typeInstead')}
            onPress={() => setTyping(true)}
            disabled={busy}
            style={{
              flexDirection: dir.row,
              alignItems: 'center',
              alignSelf: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
            }}
          >
            <Keyboard size={18} color={colors.textMuted} strokeWidth={2} />
            <Text variant="label" color="textMuted" directional={false}>
              {t('voice.typeInstead')}
            </Text>
          </Pressable>
        )}

        {/* Suggestions double as a hint that the assistant answers questions. */}
        {state === 'idle' && !transcript ? (
          <View style={{ gap: spacing.sm }}>
            <Text variant="label" color="textMuted">
              {t('home.askByVoice')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  accessibilityLabel={suggestion}
                  onPress={() => void ask(suggestion)}
                  disabled={busy}
                  style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text variant="bodySmall" color="textSecondary">
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Session history — in memory only, never persisted. */}
        {interactions.length ? (
          <View style={{ gap: spacing.sm }}>
            <Text variant="label" color="textMuted">
              {t('voice.recentExchanges')}
            </Text>
            {interactions
              .slice()
              .reverse()
              .map((item) => (
                <Surface key={item.id} padding="md" sunken bordered={false}>
                  <Text variant="caption" color="textMuted">
                    {item.userText}
                  </Text>
                  <Text variant="bodySmall">{item.assistantText}</Text>
                </Surface>
              ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
