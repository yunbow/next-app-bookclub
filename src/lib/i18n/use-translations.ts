"use client";

import { useMemo } from "react";
import { useLocale } from "./use-locale";
import { locales, type Translations } from "./locales";

type PathKeys<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? PathKeys<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

export type TranslationKey = PathKeys<Translations>;

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split(".");
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof value === "string" ? value : path;
}

export function useTranslations() {
  const { locale } = useLocale();

  const t = useMemo(() => {
    const translations = locales[locale];

    return (key: TranslationKey, params?: Record<string, string>): string => {
      let value = getNestedValue(translations, key);

      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          value = value.replace(`{${paramKey}}`, paramValue);
        }
      }

      return value;
    };
  }, [locale]);

  return { t, locale };
}
