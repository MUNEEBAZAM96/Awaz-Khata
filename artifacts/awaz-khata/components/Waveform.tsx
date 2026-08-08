import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const BAR_COUNT = 7;
/** Per-bar peak heights — an asymmetric pattern reads as "speech", not a metronome. */
const PEAKS = [10, 18, 26, 14, 22, 12, 20];

function Bar({ index, color, active }: { index: number; color: string; active: boolean }) {
  const height = useSharedValue(6);

  useEffect(() => {
    if (active) {
      height.value = withDelay(
        index * 90,
        withRepeat(
          withSequence(
            withTiming(PEAKS[index % PEAKS.length], {
              duration: 320,
              easing: Easing.inOut(Easing.quad),
            }),
            withTiming(6, { duration: 320, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
        ),
      );
    } else {
      cancelAnimation(height);
      height.value = withTiming(6, { duration: 150 });
    }
    return () => cancelAnimation(height);
  }, [active, height, index]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return <Animated.View style={[styles.bar, style, { backgroundColor: color }]} />;
}

interface Props {
  color: string;
  /** Bars animate only while true — keeps the screen calm otherwise. */
  active?: boolean;
}

/** Small animated audio-wave indicator for the listening/speaking states. */
export function Waveform({ color, active = true }: Props) {
  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <Bar key={i} index={i} color={color} active={active} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 28,
  },
  bar: {
    width: 3.5,
    borderRadius: 999,
  },
});
