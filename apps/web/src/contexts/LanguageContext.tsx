// ============================================
// ArogyaX — i18n Language Provider
// ============================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SupportedLanguage } from '../types';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

type TranslationDict = typeof en;

const translations: Record<SupportedLanguage, TranslationDict> = { en, hi };

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

/**
 * Get nested value from object by dot-separated key.
 * Example: getNestedValue(obj, "consent.title") → obj.consent.title
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Fallback: return the key itself
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[language] || translations.en;
      const value = getNestedValue(dict as unknown as Record<string, unknown>, key);
      // Fallback to English if key not found in current language
      if (value === key && language !== 'en') {
        return getNestedValue(en as unknown as Record<string, unknown>, key);
      }
      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
