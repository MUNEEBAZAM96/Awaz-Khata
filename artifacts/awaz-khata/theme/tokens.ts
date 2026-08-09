/**
 * Scheme-independent design tokens.
 *
 * Every spacing, radius, shadow, duration and icon size in the app comes from
 * here. If a component needs a value that is not in this file, the value is
 * probably wrong — add it here first so it stays consistent everywhere.
 */

/** 4pt base scale. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 999,
} as const;

export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 44,
} as const;

/** Lucide stroke width. One value app-wide keeps icons visually consistent. */
export const iconStroke = 2;

/**
 * Minimum interactive size. Anything tappable must reach this in both axes,
 * via size or hitSlop.
 */
export const touchTarget = {
  min: 44,
  comfortable: 52,
} as const;

export const buttonSize = {
  sm: 36,
  md: 44,
  lg: 52,
  /** Hero microphone. */
  mic: 132,
  micCompact: 104,
} as const;

/**
 * Animation durations in ms. Kept short — the app should feel fast, and long
 * animations are the first thing that makes a finance app feel unresponsive.
 */
export const duration = {
  instant: 120,
  fast: 180,
  normal: 260,
  slow: 420,
  /** Continuous loops (mic pulse, waveform). */
  pulse: 1400,
} as const;

/** Opacity applied to a control the user cannot currently use. */
export const disabledOpacity = 0.4;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
