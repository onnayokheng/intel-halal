import id from "@/locales/id.json";
import en from "@/locales/en.json";

export type Locale = "id" | "en";

const locales = { id, en } as const;

const STORAGE_KEY = "intel-halal-locale";
const LOCALE_EVENT = "intel-halal-locale-change";

let currentLocale: Locale = "id";

/** Initialise locale from localStorage (call once on app mount) */
export const initLocale = () => {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && saved in locales) currentLocale = saved;
};

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

/** React hook — triggers re-render when locale changes */
export function useLocale(): [Locale, (l: Locale) => void] {
  const { useState, useEffect } = require("react") as typeof import("react");
  const [locale, setLocaleState] = useState<Locale>(() => {
    initLocale();
    return currentLocale;
  });

  useEffect(() => {
    const handler = (e: Event) => setLocaleState((e as CustomEvent<Locale>).detail);
    window.addEventListener(LOCALE_EVENT, handler);
    return () => window.removeEventListener(LOCALE_EVENT, handler);
  }, []);

  return [locale, (l: Locale) => { setLocale(l); }];
}
