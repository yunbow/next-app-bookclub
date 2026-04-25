import type { Locale } from "../types";
import { ja, type Translations } from "./ja";
import { en } from "./en";

export const locales: Record<Locale, Translations> = {
  ja,
  en,
};

export type { Translations };
