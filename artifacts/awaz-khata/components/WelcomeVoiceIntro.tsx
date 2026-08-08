import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { speakText } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';
import { playBase64Audio, stopPlayback } from '@/lib/audio';

const STORAGE_KEY = 'awaz_khata_welcome_completed';

// Module-level guard: survives StrictMode unmount/remount in dev, so the
// greeting can never auto-play twice in one app session.
let sessionStarted = false;

const GREETING_TEXT =
  'السلام علیکم! آواز کھاتہ میں خوش آمدید۔ میں آپ کا ذاتی مالی معاون ہوں۔ آپ مجھ سے اپنے پیسوں کے بارے میں بات کر سکتے ہیں۔';

const GREETING_LINES = [
  'السلام علیکم!',
  'آواز کھاتہ میں خوش آمدید۔',
  'میں آپ کا ذاتی مالی معاون ہوں۔ آپ مجھ سے اپنے پیسوں کے بارے میں بات کر سکتے ہیں۔',
];

type IntroState =
  | 'checking' // reading the first-launch flag
  | 'ready' // waiting for a tap to start playback (web autoplay rules)
  | 'loading' // fetching TTS audio
  | 'speaking' // greeting is playing
  | 'error' // TTS unavailable — app must stay usable
  | 'hiding'; // fade-out into Home

/** Expanding, fading ring around the orb while the greeting plays. */
function OrbRing({ delay, color, active }: { delay: number; color: string; active: boolean }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 150 });
      return () => cancelAnimation(progress);
    }
    progress.value = 0;
    const begin = () => {
      progress.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1,
      );
    };
    const id = delay > 0 ? setTimeout(begin, delay) : (begin(), null);
    return () => {
      if (id != null) clearTimeout(id);
      cancelAnimation(progress);
    };
  }, [active, delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.45 * (1 - progress.value) : 0,
    transform: [{ scale: 1 + progress.value * 0.6 }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.orbRing, style, { borderColor: color }]} />;
}

/** Pulsing dot for the «بات کر رہا ہوں» indicator. */
function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.pulsingDot, style, { backgroundColor: color }]} />;
}

/**
 * First-launch voice welcome: the assistant introduces itself in Urdu using
 * the existing /api/voice/speak pipeline, then fades into Home. Shown once —
 * a local AsyncStorage flag remembers completion. Purely an overlay; Home
 * stays mounted underneath so the hand-off is seamless.
 */
export function WelcomeVoiceIntro() {
  const colors = useColors();
  const [state, setState] = useState<IntroState>('checking');
  const [visible, setVisible] = useState(true);
  const mountedRef = useRef(true);
  const speechRef = useRef<Promise<{ audio: string }> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const overlayOpacity = useSharedValue(1);
  const orbScale = useSharedValue(1);
  const pulse = useSharedValue(1);

  const isSpeaking = state === 'speaking';

  // Gentle breath while the assistant talks.
  useEffect(() => {
    if (isSpeaking) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
    return () => cancelAnimation(pulse);
  }, [isSpeaking, pulse]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * orbScale.value }],
  }));

  /** Mark completed and fade the whole overlay into Home. */
  const finish = useCallback(() => {
    setState('hiding');
    AsyncStorage.setItem(STORAGE_KEY, 'true').catch(() => {
      // Storage failure just means the greeting may play again next launch.
    });
    orbScale.value = withTiming(0.85, { duration: 400, easing: Easing.in(Easing.quad) });
    overlayOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) });
    setTimeout(() => {
      if (mountedRef.current) setVisible(false);
    }, 420);
  }, [orbScale, overlayOpacity]);

  const skip = useCallback(() => {
    stopPlayback();
    finish();
  }, [finish]);

  /** Fetch (or reuse prefetched) audio and play the greeting once. */
  const start = useCallback(async () => {
    if (sessionStarted) return;
    sessionStarted = true;
    setState('loading');
    try {
      const speech = await (speechRef.current ?? speakText({ text: GREETING_TEXT }));
      setState('speaking');
      await playBase64Audio(speech.audio);
      // Small beat so the last word lands before the transition.
      setTimeout(finish, 250);
    } catch {
      setState('error');
    }
  }, [finish]);

  // First-launch check + audio prefetch.
  useEffect(() => {
    let mounted = true;
    (async () => {
      let completed = false;
      try {
        completed = (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
      } catch {
        // Unreadable storage: err on the side of not annoying the user.
        completed = true;
      }
      if (!mounted) return;
      if (completed || sessionStarted) {
        setVisible(false);
        return;
      }
      // Prefetch TTS so playback starts instantly on tap/autoplay.
      speechRef.current = speakText({ text: GREETING_TEXT });
      speechRef.current.catch(() => {
        // Handled where it's awaited — this just avoids an unhandled rejection.
      });
      if (Platform.OS === 'web') {
        // Browsers block audio without a user gesture — ask for a tap.
        setState('ready');
      } else {
        void start();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [start]);

  if (!visible) return null;

  const statusLine =
    state === 'loading'
      ? 'تیار ہو رہا ہوں...'
      : state === 'speaking'
        ? 'آپ سے بات کر رہا ہوں...'
        : null;

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle, { backgroundColor: colors.background }]}
      pointerEvents={state === 'hiding' ? 'none' : 'auto'}
    >
      {state === 'checking' ? null : (
        <View style={styles.content}>
          <View style={styles.brandBlock}>
            <Text style={[styles.brandTitle, { color: colors.foreground }]}>
              آواز کھاتہ
            </Text>
            <View style={styles.brandLineRow}>
              <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.brandSubtitle, { color: colors.mutedForeground }]}>
                آپ کے پیسوں کی آواز
              </Text>
              <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
            </View>
          </View>

          <View style={styles.orbArea}>
            <View style={[styles.orbHalo, { backgroundColor: colors.primarySoft }]} />
            <OrbRing delay={0} color={colors.primary} active={isSpeaking} />
            <OrbRing delay={900} color={colors.primary} active={isSpeaking} />
            <Animated.View style={orbStyle}>
              <LinearGradient
                colors={[colors.primaryBright, colors.primaryDeep]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[styles.orb, { shadowColor: colors.primaryDeep }]}
                accessibilityLabel="آواز کھاتہ کا تعارف"
              >
                <Feather
                  name={isSpeaking ? 'volume-2' : 'mic'}
                  size={44}
                  color={colors.primaryForeground}
                />
              </LinearGradient>
            </Animated.View>
          </View>

          {state === 'error' ? (
            <View style={styles.greetingBlock}>
              <Text style={[styles.greetingLead, { color: colors.foreground }]}>
                معذرت، آواز ابھی دستیاب نہیں۔
              </Text>
              <Text style={[styles.greetingBody, { color: colors.mutedForeground }]}>
                آپ ابھی بھی ایپ استعمال کر سکتے ہیں۔
              </Text>
            </View>
          ) : (
            <View style={styles.greetingBlock}>
              <Text style={[styles.greetingLead, { color: colors.foreground }]}>
                {GREETING_LINES[0]}
              </Text>
              <Text style={[styles.greetingTitle, { color: colors.foreground }]}>
                {GREETING_LINES[1]}
              </Text>
              <Text style={[styles.greetingBody, { color: colors.mutedForeground }]}>
                {GREETING_LINES[2]}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            {statusLine ? (
              <View style={styles.statusRow}>
                <PulsingDot color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                  {statusLine}
                </Text>
              </View>
            ) : null}

            {state === 'ready' ? (
              <Pressable
                onPress={() => void start()}
                accessibilityLabel="تعارف سنیں"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
                ]}
              >
                <Feather name="play" size={16} color={colors.primaryForeground} />
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  تعارف سنیں
                </Text>
              </Pressable>
            ) : null}

            {state === 'error' ? (
              <Pressable
                onPress={finish}
                accessibilityLabel="شروع کریں"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  شروع کریں
                </Text>
              </Pressable>
            ) : null}

            {state !== 'error' && state !== 'hiding' ? (
              <Pressable
                onPress={skip}
                accessibilityLabel="تعارف چھوڑیں"
                hitSlop={10}
                style={({ pressed }) => [styles.skipButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                  بعد میں
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 96,
    paddingBottom: 48,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 2,
  },
  brandTitle: {
    fontSize: 34,
    lineHeight: urduLine(34),
    fontFamily: fonts.urduBold,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  brandLineRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: -6,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  brandSubtitle: {
    fontSize: 14,
    lineHeight: urduLine(14),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  orbArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbHalo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  orbRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
  },
  orb: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  greetingBlock: {
    alignItems: 'center',
    gap: 2,
    alignSelf: 'stretch',
  },
  greetingLead: {
    fontSize: 20,
    lineHeight: urduLine(20),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  greetingTitle: {
    fontSize: 24,
    lineHeight: urduLine(24),
    fontFamily: fonts.urduBold,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  greetingBody: {
    fontSize: 15,
    lineHeight: urduLine(15),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 14,
    lineHeight: urduLine(14),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 36,
    borderRadius: 999,
    shadowColor: '#0A4A38',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    lineHeight: urduLine(16),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
  skipButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urdu,
    writingDirection: 'rtl',
  },
});
