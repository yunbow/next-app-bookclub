export type Locale = "ja" | "en";

export const LOCALE_COOKIE_NAME = "locale";
export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: readonly Locale[] = ["ja", "en"] as const;
