import id from "@/locales/id.json";
import en from "@/locales/en.json";

export type Locale = "id" | "en";

const locales = { id, en } as const;

const STORAGE_KEY = "intel-halal-locale";
const LOCALE_EVENT = "intel-halal-locale-change";

let currentLocale: Locale = "id";

/** Change locale, persist to localStorage, emit event for React re-render */
export const setLocale = (locale: Locale) => {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, locale);
    window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }));
  }
};

export const getLocale = (): Locale => currentLocale;
export const getLocales = () => Object.keys(locales) as Locale[];

/** Translate a dot-separated key. Falls back to key if not found. */
export function t(key: string): string {
  const data = locales[currentLocale] as Record<string, unknown>;
  const parts = key.split(".");
  let result: unknown = data;
  for (const part of parts) {
    if (typeof result !== "object" || result === null) return key;
    result = (result as Record<string, unknown>)[part];
  }
  return typeof result === "string" ? result : key;
}

/** Get an array from JSON (e.g. hijriMonths) */
export function ta(key: string): string[] {
  const data = locales[currentLocale] as Record<string, unknown>;
  const parts = key.split(".");
  let result: unknown = data;
  for (const part of parts) {
    if (typeof result !== "object" || result === null) return [];
    result = (result as Record<string, unknown>)[part];
  }
  return Array.isArray(result) ? result.map(String) : [];
}

/** Get a nested object as Record<string, string> */
export function tObj(key: string): Record<string, string> {
  const data = locales[currentLocale] as Record<string, unknown>;
  const parts = key.split(".");
  let result: unknown = data;
  for (const part of parts) {
    if (typeof result !== "object" || result === null) return {};
    result = (result as Record<string, unknown>)[part];
  }
  if (typeof result === "object" && result !== null) {
    return Object.fromEntries(
      Object.entries(result as Record<string, unknown>)
        .filter(([, v]) => typeof v === "string")
        .map(([k, v]) => [k, v as string])
    );
  }
  return {};
}

/**
 * React hook — reads locale from localStorage on mount and keeps all
 * useLocale() instances in sync via a custom DOM event.
 *
 * Root cause of the bug: the lazy useState initializer only runs during
 * React's server-side render pass (where localStorage is undefined), so the
 * client hydrates with "id" even when localStorage has "en". The fix is to
 * read localStorage inside useEffect (client-only) and immediately update
 * both the module variable and the React state.
 */
export function useLocale(): [Locale, (l: Locale) => void] {
  const { useState, useEffect } = require("react") as typeof import("react");

  // Start with server-safe default; useEffect will correct it on the client.
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    // 1. Read saved locale from localStorage and sync both module var + state.
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in locales) {
      currentLocale = saved as Locale;
      setLocaleState(saved as Locale);
    }

    // 2. Listen for future changes triggered by setLocale().
    const handler = (e: Event) =>
      setLocaleState((e as CustomEvent<Locale>).detail);
    window.addEventListener(LOCALE_EVENT, handler);
    return () => window.removeEventListener(LOCALE_EVENT, handler);
  }, []);

  return [locale, (l: Locale) => { setLocale(l); }];
}
