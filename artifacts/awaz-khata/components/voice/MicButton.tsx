import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Loader, Mic, Square, Volume2 } from 'lucide-react-native';
import { Pressable } from '@/components/ui/Pressable';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { buttonSize, duration } from '@/theme/tokens';
import type { VoiceState } from '@/hooks/useVoiceAssistant';

export interface MicButtonProps {
  state: VoiceState;
  onPress: () => void;
  compact?: boolean;
}

/**
 * The product's primary control.
 *
 * One continuous animation only — a slow halo pulse while recording. No
 * bouncing, no particles: this is a finance app and the mic must read as
 * dependable, not playful.
 */
export function MicButton({ state, onPress, compact = false }: MicButtonProps) {
  const { colors, radius } = useTheme();
  const t = useT();

  const size = compact ? buttonSize.micCompact : buttonSize.mic;
  const recording = state === 'listening';
  const busy = state === 'processing';
  const speaking = state === 'speaking';

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (recording) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration.pulse, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: duration.fast });
    }
    return () => cancelAnimation(pulse);
  }, [recording, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.35 }],
  }));

  const spin = useSharedValue(0);
  useEffect(() => {
    if (busy) {
      spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(spin);
      spin.value = withTiming(0, { duration: duration.fast });
    }
    return () => cancelAnimation(spin);
  }, [busy, spin]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const gradient: [string, string] = recording
    ? [colors.recordingDeep, colors.recordingBright]
    : [colors.primaryDeep, colors.primaryBright];

  const label = recording
    ? t('a11y.micRecording')
    : busy || speaking
      ? t('a11y.micBusy')
      : t('a11y.micIdle');

  const Glyph = recording ? Square : busy ? Loader : speaking ? Volume2 : Mic;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size * 1.5, height: size * 1.5 }}>
      {/* Expanding halo, purely decorative. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: radius.full,
            backgroundColor: recording ? colors.recordingSoft : colors.primarySoft,
          },
          haloStyle,
        ]}
      />

      <Pressable
        accessibilityLabel={label}
        accessibilityState={{ busy: busy || speaking }}
        onPress={onPress}
        disabled={busy || speaking}
        haptic="medium"
        pressScale={0.94}
        style={{ borderRadius: radius.full }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/*
           * The spin style is applied unconditionally. Swapping it for
           * `undefined` when idle leaves the last committed native transform
           * in place, which left the mic glyph rotated after a processing
           * cycle — driving rotation back to 0 is what actually resets it.
           */}
          <Animated.View style={spinStyle}>
            <Glyph size={size * 0.32} color="#FFFFFF" strokeWidth={2.2} />
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
