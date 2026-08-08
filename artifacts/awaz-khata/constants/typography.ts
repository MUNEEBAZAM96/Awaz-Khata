/**
 * Awaz Khata typography.
 *
 * Urdu text renders in Noto Nastaliq Urdu — the calligraphic style Pakistani
 * readers expect ("designed for Pakistan, not translated"). Nastaliq hangs
 * deep below the baseline, so every Urdu style must pair a generous
 * lineHeight (~2× fontSize) or glyphs clip, especially on Android.
 *
 * Amounts, digits, and Latin fragments use Inter with tabular figures.
 */

export const fonts = {
  /** Urdu body text */
  urdu: 'NotoNastaliqUrdu_400Regular',
  /** Urdu labels with mild emphasis */
  urduMedium: 'NotoNastaliqUrdu_500Medium',
  /** Urdu headings */
  urduBold: 'NotoNastaliqUrdu_700Bold',
  /** Numbers / Latin text */
  number: 'Inter_400Regular',
  numberMedium: 'Inter_500Medium',
  numberSemiBold: 'Inter_600SemiBold',
  numberBold: 'Inter_700Bold',
} as const;

/** Line height that keeps Nastaliq ascenders/descenders from clipping. */
export const urduLine = (fontSize: number): number => Math.round(fontSize * 2);
