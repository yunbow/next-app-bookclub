export { LocaleProvider, LocaleContext } from "./context";
export { useLocale } from "./use-locale";
export { useTranslations, type TranslationKey } from "./use-translations";
export {
  type Locale,
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "./types";
export { locales } from "./locales";
export type { Translations } from "./locales";
// Note: getServerTranslations must be imported directly from "@/lib/i18n/server"
// to avoid "next/headers" being imported in client components
