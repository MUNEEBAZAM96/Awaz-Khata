import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Waveform } from './Waveform';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { VoiceState } from '@/hooks/useVoiceAssistant';

export interface VoiceStateViewProps {
  state: VoiceState;
  /** Localized error message, already user-facing. */
  error?: string | null;
  /** True while the pipeline is committing a transaction. */
  saving?: boolean;
}

/**
 * The line of text under the mic.
 *
 * Every state has its own wording so the user always knows what the app is
 * doing with their money — "saving" in particular is never shown after the
 * fact, only while the write is genuinely in flight.
 */
export function VoiceStateView({ state, error, saving }: VoiceStateViewProps) {
  const { spacing } = useTheme();
  const t = useT();

  if (error) {
    return (
      <View style={{ minHeight: 56, justifyContent: 'center', paddingHorizontal: spacing.xl }}>
        <Text variant="bodyMedium" color="danger" align="center" accessibilityRole="alert">
          {error}
        </Text>
      </View>
    );
  }

  const caption =
    state === 'listening'
      ? t('voice.listening')
      : state === 'processing'
        ? saving
          ? t('voice.saving')
          : t('voice.understanding')
        : state === 'speaking'
          ? t('voice.speaking')
          : t('voice.tapToSpeak');

  return (
    <View
      style={{ minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}
    >
      <Text
        variant={state === 'idle' ? 'bodyMedium' : 'headingSmall'}
        color={state === 'listening' ? 'recording' : state === 'idle' ? 'textMuted' : 'textSecondary'}
        align="center"
        accessibilityLiveRegion="polite"
      >
        {caption}
      </Text>
      {state === 'listening' ? <Waveform active /> : null}
    </View>
  );
}
