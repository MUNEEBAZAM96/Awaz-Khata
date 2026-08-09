import React, { useEffect } from 'react';
import { View } from 'react-native';
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
import { useTheme } from '@/theme';

const BAR_COUNT = 7;
/** Resting heights, so the shape reads as a waveform even when static. */
const PROFILE = [0.35, 0.6, 0.9, 1, 0.85, 0.55, 0.3];

export interface WaveformProps {
  active: boolean;
  color?: string;
}

/**
 * Recording indicator.
 *
 * These bars are decorative — they are not driven by microphone amplitude,
 * because expo-audio does not expose metering here and animating fake
 * "levels" would imply the app is hearing more than it is.
 */
export function Waveform({ active, color }: WaveformProps) {
  const { colors, spacing, radius } = useTheme();
  const tint = color ?? colors.recording;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        height: 28,
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <Bar
          key={index}
          index={index}
          active={active}
          color={tint}
          radius={radius.full}
        />
      ))}
    </View>
  );
}

function Bar({
  index,
  active,
  color,
  radius,
}: {
  index: number;
  active: boolean;
  color: string;
  radius: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withDelay(
        index * 90,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        ),
      );
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 180 });
    }
    return () => cancelAnimation(progress);
  }, [active, index, progress]);

  const base = (PROFILE[index] ?? 0.5) * 26;

  const style = useAnimatedStyle(() => ({
    height: base * (0.4 + progress.value * 0.6),
    opacity: 0.55 + progress.value * 0.45,
  }));

  return (
    <Animated.View
      style={[{ width: 4, borderRadius: radius, backgroundColor: color }, style]}
    />
  );
}
