/**
 * Pressable wrapper that enforces the app's interaction rules:
 *
 *  - a minimum 44pt touch target, via hitSlop when the visual size is smaller
 *  - haptic feedback, honouring the user's accessibility preference
 *  - a consistent press-down scale/opacity
 *  - an accessibility role and label on every instance (label is required)
 */
import React, { useCallback } from 'react';
import {
  Platform,
  Pressable as RNPressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePreferences } from '@/store/preferences';
import { duration, touchTarget } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type HapticStrength = 'light' | 'medium' | 'none';

export interface AppPressableProps extends Omit<PressableProps, 'style'> {
  /** Required — every interactive element must be reachable by screen reader. */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  haptic?: HapticStrength;
  /** Visual height, used to decide whether hitSlop padding is needed. */
  visualSize?: number;
  pressScale?: number;
}

export function Pressable({
  accessibilityLabel,
  accessibilityRole = 'button',
  style,
  haptic = 'light',
  visualSize,
  pressScale = 0.97,
  onPress,
  disabled,
  children,
  ...rest
}: AppPressableProps) {
  const { prefs } = usePreferences();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - pressScale) }],
    opacity: 1 - pressed.value * 0.12,
  }));

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (event) => {
      if (haptic !== 'none' && prefs.haptics && Platform.OS !== 'web') {
        Haptics.impactAsync(
          haptic === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => undefined);
      }
      onPress?.(event);
    },
    [haptic, prefs.haptics, onPress],
  );

  // Grow the tappable area when the control is visually smaller than the
  // minimum target, rather than inflating the design.
  const slop =
    visualSize != null && visualSize < touchTarget.min
      ? Math.ceil((touchTarget.min - visualSize) / 2)
      : 0;

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, ...(rest.accessibilityState ?? {}) }}
      disabled={disabled}
      hitSlop={slop || undefined}
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: duration.instant });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: duration.fast });
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
