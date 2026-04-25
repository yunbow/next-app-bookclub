"use client";

import { createCookieContext } from "@/lib/utils/create-cookie-context";
import { COOKIE_NAMES } from "@/lib/constants/cookies";
import {
  type Locale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "./types";

// Locale Context を作成
const { Context, Provider, useValue: useLocaleValue } = createCookieContext<Locale>({
  cookieName: COOKIE_NAMES.LOCALE,
  defaultValue: DEFAULT_LOCALE,
  supportedValues: SUPPORTED_LOCALES,
  validator: (value): value is Locale =>
    SUPPORTED_LOCALES.includes(value as Locale),
  applyEffect: (locale) => {
    // HTML lang属性を更新
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  },
});

export const LocaleContext = Context;
export const LocaleProvider = Provider;

// カスタムフックで期待されるプロパティ名にマッピング
export function useLocale() {
  const { value: locale, setValue: setLocale } = useLocaleValue();
  return { locale, setLocale };
}
