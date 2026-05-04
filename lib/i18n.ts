import id from "@/locales/id.json";

type LocaleData = typeof id;

// Extend here when adding new languages: { id, en, ja, ... }
const locales = { id } as const;
let currentLocale: keyof typeof locales = "id";

/** Change locale at runtime (for future language switcher) */
export const setLocale = (locale: keyof typeof locales) => {
  currentLocale = locale;
};

/** Get current locale key */
export const getLocale = () => currentLocale;

/**
 * Translate a dot-separated key: t("sholat.title") → "Jadwal Sholat"
 * Falls back to the key string if not found.
 */
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

/**
 * Get an array of strings from a JSON array key.
 * ta("sholat.hijriMonths") → ["", "Muharram", ...]
 */
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

/**
 * Get a nested object (e.g. for prayer names map).
 * Used when you need the full Record<string, string> at once.
 */
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

export type { LocaleData };
