/**
 * Localization.
 *
 * `t('home.availableBalance')` is the only way a user-facing string should
 * reach the screen — components never hold literal copy, and never branch on
 * the active language.
 *
 * Direction (`isRTL`) is exposed for the handful of cases that genuinely need
 * it: writingDirection on text, and the direction of chevrons/arrows. Ordinary
 * layout should use flexbox `row` with `I18nManager`-independent styling —
 * see `useDirectionalStyles`.
 */
import React, { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePreferences } from '@/store/preferences';
import {
  LANGUAGE_META,
  type Direction,
  type Language,
  type Script,
} from './languages';
import en, { type Strings } from './locales/en';
import ur from './locales/ur';
import pa from './locales/pa';
import skr from './locales/skr';
import hi from './locales/hi';

const CATALOGUES: Record<Language, Strings> = { en, ur, pa, skr, hi };

type Section = keyof Strings;

/** Dotted key like `home.availableBalance`, checked at compile time. */
export type StringKey = {
  [S in Section]: `${S & string}.${keyof Strings[S] & string}`;
}[Section];

export type TranslateParams = Record<string, string | number>;

export interface I18nValue {
  lang: Language;
  dir: Direction;
  isRTL: boolean;
  script: Script;
  t: (key: StringKey, params?: TranslateParams) => string;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { prefs, setPreference } = usePreferences();
  const lang = prefs.language;
  const meta = LANGUAGE_META[lang];

  const t = useCallback(
    (key: StringKey, params?: TranslateParams): string => {
      const [section, name] = key.split('.') as [Section, string];
      const catalogue = CATALOGUES[lang];
      const table = catalogue[section] as Record<string, string> | undefined;
      const value = table?.[name];
      if (typeof value === 'string') return interpolate(value, params);

      // Every locale is type-checked against the English catalogue, so this
      // is only reachable if a key is constructed dynamically and wrongly.
      // Fall back to English rather than rendering a blank label.
      const fallback = (en[section] as Record<string, string> | undefined)?.[name];
      return fallback ? interpolate(fallback, params) : key;
    },
    [lang],
  );

  const setLanguage = useCallback(
    (next: Language) => setPreference('language', next),
    [setPreference],
  );

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: meta.dir,
      isRTL: meta.dir === 'rtl',
      script: meta.script,
      t,
      setLanguage,
    }),
    [lang, meta.dir, meta.script, t, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}

/** Convenience for the common case of only needing `t`. */
export function useT(): I18nValue['t'] {
  return useI18n().t;
}

/**
 * Layout helpers for direction-aware UI.
 *
 * We deliberately do NOT call `I18nManager.forceRTL`, which requires an app
 * restart to take effect and would make in-app language switching impossible.
 * Instead rows opt into `row`/`rowReverse` explicitly, which also keeps LTR
 * languages correct while the device itself is in an RTL locale.
 */
export function useDirection() {
  const { isRTL } = useI18n();

  return useMemo(
    () => ({
      isRTL,
      /** Main axis direction for a row that should follow reading order. */
      row: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
      /** Row that should always oppose reading order (e.g. trailing actions). */
      rowReverse: (isRTL ? 'row' : 'row-reverse') as 'row' | 'row-reverse',
      /** Text alignment following reading order. */
      textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
      textAlignOpposite: (isRTL ? 'left' : 'right') as 'left' | 'right',
      writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
      /**
       * Which chevron points "forward" (deeper into the stack). Back/forward
       * arrows must mirror; semantic icons like a mic must not.
       */
      forwardChevron: (isRTL ? 'left' : 'right') as 'left' | 'right',
      backChevron: (isRTL ? 'right' : 'left') as 'left' | 'right',
    }),
    [isRTL],
  );
}
