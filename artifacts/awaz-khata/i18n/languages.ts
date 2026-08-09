/**
 * Supported UI languages and their writing systems.
 *
 * `script` drives font selection and line-height (Nastaliq hangs far below the
 * baseline and clips without generous leading); `dir` drives layout mirroring.
 */

export const LANGUAGES = ['ur', 'en', 'pa', 'skr', 'hi'] as const;
export type Language = (typeof LANGUAGES)[number];

export type Script = 'nastaliq' | 'latin' | 'devanagari';
export type Direction = 'rtl' | 'ltr';

export interface LanguageMeta {
  code: Language;
  /** Name written in the language itself. */
  nativeName: string;
  /** Name in English, shown as a secondary line. */
  englishName: string;
  script: Script;
  dir: Direction;
}

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  ur: {
    code: 'ur',
    nativeName: 'اردو',
    englishName: 'Urdu',
    script: 'nastaliq',
    dir: 'rtl',
  },
  pa: {
    code: 'pa',
    // Shahmukhi, the script Punjabi is written in in Pakistan.
    nativeName: 'پنجابی',
    englishName: 'Punjabi',
    script: 'nastaliq',
    dir: 'rtl',
  },
  skr: {
    code: 'skr',
    nativeName: 'سرائیکی',
    englishName: 'Saraiki',
    script: 'nastaliq',
    dir: 'rtl',
  },
  hi: {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    script: 'devanagari',
    dir: 'ltr',
  },
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    script: 'latin',
    dir: 'ltr',
  },
};

/** Display order on the language picker: Pakistani languages first. */
export const LANGUAGE_ORDER: Language[] = ['ur', 'pa', 'skr', 'hi', 'en'];

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}
