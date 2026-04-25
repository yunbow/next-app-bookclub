import { cookies, headers } from "next/headers";
import { locales } from "./locales";
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./types";

/**
 * Accept-Languageヘッダーからロケールを検出
 * @param acceptLanguage Accept-Languageヘッダー値
 * @returns 検出されたロケール（デフォルトは英語）
 */
function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Accept-Language: ja,en-US;q=0.9,en;q=0.8 のような形式をパース
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(), // "en-US" -> "en"
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  // サポートされている言語を優先度順に検索
  for (const { code } of languages) {
    if (SUPPORTED_LOCALES.includes(code as Locale)) {
      return code as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * サーバーサイドでロケールを取得
 * 1. Cookieがあればその値を使用
 * 2. なければAccept-Languageヘッダーから検出
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (SUPPORTED_LOCALES.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // Cookieがない場合はAccept-Languageヘッダーから検出
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  return detectLocaleFromAcceptLanguage(acceptLanguage);
}

/**
 * Server-side translation helper for use in Server Components and generateMetadata
 */
export async function getServerTranslations() {
  const locale = await getServerLocale();

  const translations = locales[locale];

  /**
   * Translate a key with optional interpolation
   */
  function t(key: string, params?: Record<string, string>): string {
    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if not found
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Handle interpolation
    if (params) {
      return Object.entries(params).reduce(
        (result, [paramKey, paramValue]) =>
          result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), paramValue),
        value
      );
    }

    return value;
  }

  return { t, locale };
}
