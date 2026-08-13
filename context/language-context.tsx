import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Codes match the keys in lib/translations.ts. 'en' is the source language -
// no dictionary needed, everything just renders as written.
export type LanguageCode = 'en' | 'es' | 'zh' | 'hi' | 'vi' | 'ko' | 'ar' | 'fr' | 'tl' | 'pt';

// Each name is written in its OWN language (not English) - this list is how
// a rider finds their language in the first place, so "Español"/"中文" reads
// at a glance where "Spanish"/"Chinese" wouldn't for someone who doesn't
// already read English.
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिन्दी',
  vi: 'Tiếng Việt',
  ko: '한국어',
  ar: 'العربية',
  fr: 'Français',
  tl: 'Tagalog',
  pt: 'Português',
};

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

const PREFS_KEY = 'language-pref';

// For spots outside the component tree (or above LanguageProvider, like
// app/_layout.tsx's silent push-token re-registration) that need the current
// language without being able to call useLanguage(). Same validation as the
// provider's own load, so an unrecognized/corrupt stored value can't leak
// through as a bogus language code.
export async function getStoredLanguage(): Promise<LanguageCode> {
  const value = await AsyncStorage.getItem(PREFS_KEY);
  return value && value in LANGUAGE_NAMES ? (value as LanguageCode) : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(value => {
      if (value && value in LANGUAGE_NAMES) setLanguageState(value as LanguageCode);
    });
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(PREFS_KEY, lang).catch(() => {});
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
