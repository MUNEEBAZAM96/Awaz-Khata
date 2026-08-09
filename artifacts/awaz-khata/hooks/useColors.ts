/**
 * Compatibility bridge for components written against the original colour
 * token names (`foreground`, `mutedForeground`, `card`, `destructive`…).
 *
 * New code should use `useTheme()` from `@/theme` and the semantic tokens
 * directly. This shim maps the old names onto the new palette so preserved
 * components — notably WelcomeVoiceIntro and the advisor chat — keep working
 * and pick up dark mode and high contrast for free.
 *
 * @deprecated Use `useTheme()` from `@/theme`.
 */
import { useMemo } from 'react';
import { useTheme } from '@/theme';
import { radius } from '@/theme/tokens';

export function useColors() {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      // Legacy aliases
      text: colors.textPrimary,
      tint: colors.primary,

      background: colors.background,
      foreground: colors.textPrimary,

      card: colors.surface,
      cardForeground: colors.textPrimary,

      primary: colors.primary,
      primaryForeground: colors.textOnPrimary,

      secondary: colors.surfaceSunken,
      secondaryForeground: colors.textSecondary,

      muted: colors.surfaceSunken,
      mutedForeground: colors.textMuted,

      accent: colors.accent,
      accentForeground: colors.textPrimary,

      destructive: colors.danger,
      destructiveForeground: colors.textOnPrimary,

      success: colors.success,
      recording: colors.recording,

      primarySoft: colors.primarySoft,
      accentSoft: colors.accentSoft,
      successSoft: colors.successSoft,
      destructiveSoft: colors.dangerSoft,
      recordingSoft: colors.recordingSoft,

      border: colors.border,
      input: colors.border,

      primaryDeep: colors.primaryDeep,
      primaryBright: colors.primaryBright,
      recordingDeep: colors.recordingDeep,
      recordingBright: colors.recordingBright,
      accentDeep: colors.accent,
      accentBright: colors.accent,

      blobGreen: colors.blobGreen,
      blobGold: colors.blobGold,

      radius: radius.lg,
    }),
    [colors],
  );
}
