/**
 * Semantic typography.
 *
 * Two things vary by language and must never be hardcoded in a component:
 *
 *  - font family: Nastaliq for Urdu/Punjabi/Saraiki, Inter for English,
 *    and the system font for Hindi (see note below).
 *  - line height: Nastaliq needs ~2x the font size or descenders clip on
 *    Android; Latin and Devanagari need far less.
 *
 * Hindi deliberately resolves to `undefined` fontFamily. Inter has no
 * Devanagari coverage, so naming it would render tofu; leaving it unset hands
 * off to the platform's Devanagari font, which both Android and iOS ship.
 * Numerals always use Inter, which has tabular figures — amounts must stay
 * column-aligned regardless of UI language.
 */
import type { TextStyle } from 'react-native';
import type { Script } from '@/i18n/languages';

export const fonts = {
  urdu: 'NotoNastaliqUrdu_400Regular',
  urduMedium: 'NotoNastaliqUrdu_500Medium',
  urduBold: 'NotoNastaliqUrdu_700Bold',
  number: 'Inter_400Regular',
  numberMedium: 'Inter_500Medium',
  numberSemiBold: 'Inter_600SemiBold',
  numberBold: 'Inter_700Bold',
} as const;

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

/** Multiplier applied to font size to get a non-clipping line height. */
const LINE_HEIGHT: Record<Script, number> = {
  nastaliq: 2,
  devanagari: 1.55,
  latin: 1.4,
};

export function lineHeightFor(script: Script, fontSize: number): number {
  return Math.round(fontSize * LINE_HEIGHT[script]);
}

export function fontFamilyFor(script: Script, weight: Weight): string | undefined {
  if (script === 'nastaliq') {
    if (weight === 'bold') return fonts.urduBold;
    if (weight === 'semibold' || weight === 'medium') return fonts.urduMedium;
    return fonts.urdu;
  }
  if (script === 'latin') {
    if (weight === 'bold') return fonts.numberBold;
    if (weight === 'semibold') return fonts.numberSemiBold;
    if (weight === 'medium') return fonts.numberMedium;
    return fonts.number;
  }
  // Devanagari — platform font. Weight is expressed via fontWeight instead.
  return undefined;
}

/** Fallback fontWeight for scripts with no loaded weighted family. */
const NUMERIC_WEIGHT: Record<Weight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export interface TypeSpec {
  size: number;
  weight: Weight;
  /** Letter spacing, only meaningful for Latin. */
  tracking?: number;
}

/**
 * The semantic scale. Financial amounts use the `numeric*` entries, which are
 * always Inter so digits stay tabular and comparable down a column.
 */
export const typeScale = {
  display: { size: 30, weight: 'bold' },
  headingLarge: { size: 24, weight: 'bold' },
  headingMedium: { size: 19, weight: 'semibold' },
  headingSmall: { size: 16, weight: 'semibold' },
  bodyLarge: { size: 16, weight: 'regular' },
  bodyMedium: { size: 14, weight: 'regular' },
  bodySmall: { size: 13, weight: 'regular' },
  label: { size: 13, weight: 'medium' },
  caption: { size: 11, weight: 'regular' },
  numericLarge: { size: 34, weight: 'bold', tracking: -0.5 },
  numericMedium: { size: 20, weight: 'semibold', tracking: -0.2 },
  numericSmall: { size: 15, weight: 'semibold' },
} as const satisfies Record<string, TypeSpec>;

export type TypeVariant = keyof typeof typeScale;

/** Variants that are always rendered in Inter, whatever the UI language. */
const NUMERIC_VARIANTS = new Set<TypeVariant>([
  'numericLarge',
  'numericMedium',
  'numericSmall',
]);

export function isNumericVariant(variant: TypeVariant): boolean {
  return NUMERIC_VARIANTS.has(variant);
}

/**
 * Resolve a semantic variant into a concrete style.
 *
 * `scale` is the user's text-size preference; it multiplies the font size and
 * the line height together so larger text never clips.
 */
export function resolveTextStyle(
  variant: TypeVariant,
  script: Script,
  scale: number,
): TextStyle {
  const spec: TypeSpec = typeScale[variant];
  const effectiveScript: Script = isNumericVariant(variant) ? 'latin' : script;
  const size = Math.round(spec.size * scale);
  const family = fontFamilyFor(effectiveScript, spec.weight);

  return {
    fontSize: size,
    lineHeight: lineHeightFor(effectiveScript, size),
    ...(family ? { fontFamily: family } : { fontWeight: NUMERIC_WEIGHT[spec.weight] }),
    ...(spec.tracking != null && effectiveScript === 'latin'
      ? { letterSpacing: spec.tracking }
      : {}),
  };
}
