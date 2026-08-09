/**
 * Theme access.
 *
 * `useTheme()` is the single entry point for colour, spacing and type. It
 * resolves the user's theme mode against the device scheme, applies the
 * high-contrast overrides, and exposes a `text()` helper that produces a
 * ready-to-spread style for a semantic type variant in the current language.
 */
import React, { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme, type TextStyle } from 'react-native';
import { useI18n } from '@/i18n';
import { TEXT_SCALE, usePreferences } from '@/store/preferences';
import { getPalette, type ColorScheme, type Palette } from './palette';
import { resolveTextStyle, type TypeVariant } from './typography';
import { duration, iconSize, iconStroke, radius, spacing, touchTarget } from './tokens';

export interface ThemeValue {
  colors: Palette;
  scheme: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  iconSize: typeof iconSize;
  iconStroke: number;
  touchTarget: typeof touchTarget;
  duration: typeof duration;
  /** Resolve a semantic type variant for the active language and text size. */
  text: (variant: TypeVariant) => TextStyle;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useColorScheme();
  const { prefs } = usePreferences();
  const { script } = useI18n();

  const scheme: ColorScheme =
    prefs.themeMode === 'system'
      ? deviceScheme === 'dark'
        ? 'dark'
        : 'light'
      : prefs.themeMode;

  const colors = useMemo(
    () => getPalette(scheme, prefs.highContrast),
    [scheme, prefs.highContrast],
  );

  const scale = TEXT_SCALE[prefs.textSize];
  const text = useCallback(
    (variant: TypeVariant) => resolveTextStyle(variant, script, scale),
    [script, scale],
  );

  const value = useMemo<ThemeValue>(
    () => ({
      colors,
      scheme,
      spacing,
      radius,
      iconSize,
      iconStroke,
      touchTarget,
      duration,
      text,
    }),
    [colors, scheme, text],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

export { spacing, radius, iconSize, iconStroke, touchTarget, duration } from './tokens';
export type { Palette } from './palette';
