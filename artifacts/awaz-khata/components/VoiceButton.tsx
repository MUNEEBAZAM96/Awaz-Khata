import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
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
  const disabled = state === 'processing' || state === 'speaking';

  useEffect(() => {
    if (isListening) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isListening, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName =
    state === 'listening' ? 'square' : state === 'speaking' ? 'volume-2' : 'mic';

  return (
    <Animated.View style={styles.wrap}>
      <Animated.View
        style={[
          styles.halo,
          haloStyle,
          {
            backgroundColor: isListening
              ? 'rgba(192, 58, 43, 0.15)'
              : 'rgba(14, 95, 73, 0.10)',
          },
        ]}
      />
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
              backgroundColor: isListening ? colors.recording : colors.primary,
              opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
            },
          ]}
        >
          <Feather name={iconName} size={56} color={colors.primaryForeground} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 210,
    height: 210,
  },
  halo: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
