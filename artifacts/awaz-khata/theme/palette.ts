/**
 * Semantic colour palettes.
 *
 * Components never reference a raw hex value — they read a semantic token
 * (`surface`, `textSecondary`, `danger`) so light, dark and high-contrast
 * variants stay in step automatically.
 *
 * The brand identity is unchanged from the original app: deep emerald +
 * warm cream + gold, after the bahi khata ledger books.
 */

export interface Palette {
  // Surfaces
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSunken: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Lines
  border: string;
  borderStrong: string;

  // Brand / actions
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  primaryBright: string;

  accent: string;
  accentSoft: string;

  // Status
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;

  // Voice recording state
  recording: string;
  recordingSoft: string;
  recordingDeep: string;
  recordingBright: string;

  // Decorative background blobs
  blobGreen: string;
  blobGold: string;

  /** Scrim behind modals and bottom sheets. */
  scrim: string;
}

const light: Palette = {
  background: '#F7F3EA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#EFE9DC',

  textPrimary: '#1C2A24',
  textSecondary: '#4A5952',
  textMuted: '#6E7B72',
  textOnPrimary: '#FFFFFF',

  border: '#DCD3BF',
  borderStrong: '#C6BBA2',

  primary: '#0E5F49',
  primarySoft: 'rgba(14, 95, 73, 0.10)',
  primaryDeep: '#0A4A38',
  primaryBright: '#15745A',

  accent: '#C9A227',
  accentSoft: 'rgba(201, 162, 39, 0.14)',

  success: '#1F7A4D',
  successSoft: 'rgba(31, 122, 77, 0.12)',
  danger: '#C03A2B',
  dangerSoft: 'rgba(192, 58, 43, 0.10)',
  warning: '#B4791B',
  warningSoft: 'rgba(180, 121, 27, 0.13)',

  recording: '#C03A2B',
  recordingSoft: 'rgba(192, 58, 43, 0.15)',
  recordingDeep: '#A32E21',
  recordingBright: '#D0503F',

  blobGreen: 'rgba(14, 95, 73, 0.05)',
  blobGold: 'rgba(201, 162, 39, 0.07)',

  scrim: 'rgba(15, 23, 20, 0.45)',
};

/**
 * Dark is a designed palette, not an inversion. Surfaces are warm-tinted
 * near-blacks so Nastaliq text keeps the paper-and-ink feel, and the emerald
 * is lifted because the original deep green is unreadable on a dark ground.
 */
const dark: Palette = {
  background: '#121715',
  surface: '#1A211E',
  surfaceElevated: '#222B27',
  surfaceSunken: '#0E1311',

  textPrimary: '#F2EFE6',
  textSecondary: '#B9C2BC',
  textMuted: '#8A948E',
  textOnPrimary: '#FFFFFF',

  border: '#2E3833',
  borderStrong: '#424E48',

  primary: '#3BA47F',
  primarySoft: 'rgba(59, 164, 127, 0.16)',
  primaryDeep: '#1B6D53',
  primaryBright: '#4FBE96',

  accent: '#E0BC4A',
  accentSoft: 'rgba(224, 188, 74, 0.16)',

  success: '#48B37C',
  successSoft: 'rgba(72, 179, 124, 0.16)',
  danger: '#E4685A',
  dangerSoft: 'rgba(228, 104, 90, 0.16)',
  warning: '#DDA43C',
  warningSoft: 'rgba(221, 164, 60, 0.16)',

  recording: '#E4685A',
  recordingSoft: 'rgba(228, 104, 90, 0.20)',
  recordingDeep: '#B7402F',
  recordingBright: '#F07E6D',

  blobGreen: 'rgba(59, 164, 127, 0.07)',
  blobGold: 'rgba(224, 188, 74, 0.06)',

  scrim: 'rgba(0, 0, 0, 0.62)',
};

/**
 * High-contrast overrides, applied on top of the active palette when the
 * accessibility toggle is on. Raises text and border contrast; it does not
 * change hue, so the app still looks like itself.
 */
const highContrastLight: Partial<Palette> = {
  textPrimary: '#000000',
  textSecondary: '#22302A',
  textMuted: '#3C4842',
  border: '#8E8570',
  borderStrong: '#5E5748',
  primary: '#084636',
  danger: '#8E2221',
  success: '#0E5A36',
};

const highContrastDark: Partial<Palette> = {
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8E4',
  textMuted: '#C2CBC6',
  border: '#6C7A74',
  borderStrong: '#93A19A',
  primary: '#63D6AC',
  danger: '#FF9182',
  success: '#6FD6A0',
};

export type ColorScheme = 'light' | 'dark';

export function getPalette(scheme: ColorScheme, highContrast: boolean): Palette {
  const base = scheme === 'dark' ? dark : light;
  if (!highContrast) return base;
  const overrides = scheme === 'dark' ? highContrastDark : highContrastLight;
  return { ...base, ...overrides };
}
