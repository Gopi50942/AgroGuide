"use client";

// ─────────────────────────────────────────────
// Global language selection (English / Tamil).
//
// - Unauthenticated users: preference lives in localStorage only.
// - Authenticated users: preference syncs to/from the Firestore
//   `preferredLanguage` field on their farmer profile (via useAuth's
//   updateProfile), so it follows them across devices.
// - Reading localStorage happens only after mount to avoid a
//   server/client hydration mismatch — the first render always
//   uses the default ("en"), then swaps in the stored value.
// ─────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { en, ta, type TranslationKey } from "@/lib/i18n/translations";
import type { Language } from "@/types";

const DICTS: Record<Language, Record<TranslationKey, string>> = { en, ta };
const STORAGE_KEY = "agroguide:language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { profile, isDemoMode, updateProfile } = useAuth();
  const [language, setLanguageState] = useState<Language>("en");
  const [hydrated, setHydrated] = useState(false);

  // Read the stored preference once, client-side only (avoids hydration mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "ta") {
        setLanguageState(stored);
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  // Authenticated user's saved preference wins once their profile loads if no local storage override.
  useEffect(() => {
    if (!hydrated) return;
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!stored && profile?.preferredLanguage && profile.preferredLanguage !== language) {
      setLanguageState(profile.preferredLanguage);
    }
  }, [profile?.preferredLanguage, hydrated, language]);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore storage errors (private browsing, quota, etc.)
      }
      if (!isDemoMode && profile) {
        updateProfile({ preferredLanguage: lang }).catch(() => {});
      }
    },
    [isDemoMode, profile, updateProfile]
  );

  const t = useCallback(
    (key: TranslationKey) => DICTS[language][key] ?? en[key] ?? key,
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
