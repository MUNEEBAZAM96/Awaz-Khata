import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
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
  error: string | null;
}

export function VoiceStatus({ state, transcript, error }: Props) {
  const colors = useColors();
  const isListening = state === 'listening';

  return (
    <View style={styles.wrap}>
      <View style={styles.statusRow}>
        {state === 'processing' ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : null}
        <Text
          style={[
            styles.label,
            { color: isListening ? colors.recording : colors.mutedForeground },
          ]}
        >
          {STATUS_LABELS[state]}
        </Text>
      </View>
      {transcript ? (
        <Text
          style={[styles.transcript, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          «{transcript}»
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]} numberOfLines={2}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 17,
    writingDirection: 'rtl',
  },
  transcript: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 16,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 16,
  },
});
