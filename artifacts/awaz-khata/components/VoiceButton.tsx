import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { VoiceState } from '@/hooks/useVoiceAssistant';

interface Props {
  state: VoiceState;
  onPress: () => void;
}

export function VoiceButton({ state, onPress }: Props) {
  const colors = useColors();
  const pulse = useSharedValue(1);
  const scale = useSharedValue(1);

  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isProcessing = state === 'processing';
  const disabled = isProcessing || isSpeaking;

  useEffect(() => {
    if (isListening) {
      // Urgent heartbeat while recording
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      );
    } else if (isSpeaking) {
      // Gentle breathing while the assistant talks back
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isListening, isSpeaking, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const haloColor = isListening
    ? colors.recordingSoft
    : isSpeaking
      ? colors.accentSoft
      : colors.primarySoft;
  const ringColor = isListening
    ? colors.recording
    : isSpeaking
      ? colors.accent
      : colors.border;
  const buttonColor = isListening
    ? colors.recording
    : isSpeaking
      ? colors.accent
      : colors.primary;
  const iconColor = isSpeaking ? colors.accentForeground : colors.primaryForeground;

  return (
    <Animated.View style={styles.wrap}>
      <Animated.View style={[styles.halo, haloStyle, { backgroundColor: haloColor }]} />
      <View style={[styles.ring, { borderColor: ringColor }]} />
      <Animated.View style={buttonStyle}>
        <Pressable
          testID="mic-button"
          accessibilityLabel="ریکارڈ کریں"
          onPress={() => {
            scale.value = withSequence(withSpring(0.92), withSpring(1));
            onPress();
          }}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: buttonColor,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color={colors.primaryForeground} />
          ) : (
            <Feather
              name={isListening ? 'square' : isSpeaking ? 'volume-2' : 'mic'}
              size={54}
              color={iconColor}
            />
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  ring: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 1.5,
  },
  button: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
