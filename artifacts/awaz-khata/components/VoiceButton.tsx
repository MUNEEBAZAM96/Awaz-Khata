import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { VoiceState } from '@/hooks/useVoiceAssistant';

interface Props {
  state: VoiceState;
  onPress: () => void;
}

/** One expanding ripple ring — used in pairs, staggered, while listening. */
function Ripple({ color, delay, active }: { color: string; delay: number; active: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
          -1,
        ),
      );
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 150 });
    }
    return () => cancelAnimation(progress);
  }, [active, delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.5 * (1 - progress.value) : 0,
    transform: [{ scale: 1 + progress.value * 0.55 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.ripple, style, { borderColor: color }]} />;
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
          withTiming(1.16, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      );
    } else if (isSpeaking) {
      // Gentle glow-breath while the assistant talks back
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else if (state === 'idle') {
      // Subtle breathing so the hero mic feels alive at rest
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
    return () => cancelAnimation(pulse);
  }, [state, isListening, isSpeaking, pulse]);

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
  const gradient: [string, string] = isListening
    ? [colors.recordingBright, colors.recordingDeep]
    : isSpeaking
      ? [colors.accentBright, colors.accentDeep]
      : [colors.primaryBright, colors.primaryDeep];
  const iconColor = isSpeaking ? colors.accentForeground : colors.primaryForeground;
  const shadowColor = isListening
    ? colors.recordingDeep
    : isSpeaking
      ? colors.accentDeep
      : colors.primaryDeep;

  return (
    <Animated.View style={styles.wrap}>
      <Animated.View style={[styles.halo, haloStyle, { backgroundColor: haloColor }]} />
      <Ripple color={colors.recording} delay={0} active={isListening} />
      <Ripple color={colors.recording} delay={800} active={isListening} />
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
            styles.buttonShadow,
            { shadowColor, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.button}
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
          </LinearGradient>
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
  ripple: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 2,
  },
  ring: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 1.5,
  },
  buttonShadow: {
    borderRadius: 74,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  button: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
