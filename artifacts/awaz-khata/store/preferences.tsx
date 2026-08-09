/**
 * User preferences, persisted on-device only.
 *
 * Nothing here is ever sent to the backend: the API has no concept of a user
 * or a session, and the product spec is explicit that onboarding and
 * appearance state must not touch the server.
 *
 * Writes are fire-and-forget per key so a slow disk never blocks the UI, and
 * a failed write degrades to "setting resets next launch" rather than a crash.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLanguage, type Language } from '@/i18n/languages';

export type ThemeMode = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'default' | 'large' | 'xlarge';

/** Multiplier applied to every font size in the type scale. */
export const TEXT_SCALE: Record<TextSize, number> = {
  small: 0.9,
  default: 1,
  large: 1.15,
  xlarge: 1.3,
};

export interface Preferences {
  language: Language;
  /** Language the user wants spoken replies in. See voiceLanguageNote. */
  voiceLanguage: Language;
  themeMode: ThemeMode;
  textSize: TextSize;
  highContrast: boolean;
  haptics: boolean;
  /** Speak replies aloud after a voice exchange. */
  voiceResponses: boolean;
  hideBalances: boolean;
  userName: string;
  onboardingComplete: boolean;
}

const DEFAULTS: Preferences = {
  language: 'ur',
  voiceLanguage: 'ur',
  themeMode: 'system',
  textSize: 'default',
  highContrast: false,
  haptics: true,
  voiceResponses: true,
  hideBalances: false,
  userName: '',
  onboardingComplete: false,
};

const STORAGE_KEY = 'awaz.preferences.v1';

interface PreferencesContextValue {
  prefs: Preferences;
  /** True until the stored preferences have been read from disk. */
  hydrated: boolean;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/** Narrow an unknown parsed blob to the fields we recognise. */
function coerce(raw: unknown): Partial<Preferences> {
  if (!raw || typeof raw !== 'object') return {};
  const value = raw as Record<string, unknown>;
  const out: Partial<Preferences> = {};

  if (isLanguage(value['language'])) out.language = value['language'];
  if (isLanguage(value['voiceLanguage'])) out.voiceLanguage = value['voiceLanguage'];
  if (
    value['themeMode'] === 'light' ||
    value['themeMode'] === 'dark' ||
    value['themeMode'] === 'system'
  ) {
    out.themeMode = value['themeMode'];
  }
  if (
    value['textSize'] === 'small' ||
    value['textSize'] === 'default' ||
    value['textSize'] === 'large' ||
    value['textSize'] === 'xlarge'
  ) {
    out.textSize = value['textSize'];
  }
  for (const key of [
    'highContrast',
    'haptics',
    'voiceResponses',
    'hideBalances',
    'onboardingComplete',
  ] as const) {
    if (typeof value[key] === 'boolean') out[key] = value[key];
  }
  if (typeof value['userName'] === 'string') out.userName = value['userName'];

  return out;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        setPrefs((current) => ({ ...current, ...coerce(JSON.parse(stored)) }));
      })
      .catch(() => {
        // Unreadable/corrupt preferences fall back to defaults rather than
        // blocking startup — none of this is data the user can't re-set.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs((current) => {
        const next = { ...current, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ prefs, hydrated, setPreference }),
    [prefs, hydrated, setPreference],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return context;
}
