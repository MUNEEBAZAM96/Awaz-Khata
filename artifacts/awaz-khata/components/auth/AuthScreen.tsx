/**
 * Shared shell for the sign-in / sign-up screens.
 *
 * Keeps the two screens visually identical above the form so moving between
 * them reads as one continuous flow rather than two separate pages.
 *
 * The entrance animation is a short staggered fade-up. It is deliberately
 * restrained — this is the first screen of a money app, and bounce reads as
 * unserious — and it never gates interaction: the form is mounted and usable
 * from the first frame.
 */
import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { IconBadge } from '@/components/ui/IconBadge';
import { ScreenBackground } from '@/components/ScreenBackground';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

export interface AuthScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Sign-in ⇄ sign-up cross link. */
  footer?: ReactNode;
}

export function AuthScreen({ title, subtitle, children, footer }: AuthScreenProps) {
  const { colors, spacing, duration } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenBackground />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          gap: spacing['2xl'],
          paddingTop: insets.top + spacing['3xl'],
          paddingBottom: insets.bottom + spacing['3xl'],
          paddingHorizontal: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(duration.slow)}
          style={{ alignItems: 'center', gap: spacing.md }}
        >
          <IconBadge icon={Wallet} tone="primary" size="lg" />
          <Text variant="label" color="primary" align="center">
            {t('common.appName')}
          </Text>
          <View style={{ gap: spacing.xs, alignSelf: 'stretch' }}>
            <Text variant="headingLarge" align="center">
              {title}
            </Text>
            <Text variant="bodyMedium" color="textSecondary" align="center">
              {subtitle}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(duration.slow).delay(90)}
          style={{ gap: spacing.lg }}
        >
          {children}
        </Animated.View>

        {footer ? (
          <Animated.View entering={FadeInDown.duration(duration.slow).delay(160)}>
            {footer}
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

/** "Don't have an account? Sign up" — the cross link at the bottom. */
export function AuthSwitchLink({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  const { spacing } = useTheme();
  const dir = useDirection();

  return (
    <View
      style={{
        // Prompt then link must follow reading order, so this row mirrors.
        flexDirection: dir.row,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
      }}
    >
      <Text variant="bodySmall" color="textMuted" align="center">
        {prompt}
      </Text>
      <AuthLink label={action} onPress={onPress} />
    </View>
  );
}

/** Inline text link sized to the 44pt minimum via hitSlop. */
export function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { spacing } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="link"
      onPress={onPress}
      visualSize={24}
      style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.xs }}
    >
      <Text variant="label" color="primary">
        {label}
      </Text>
    </Pressable>
  );
}
