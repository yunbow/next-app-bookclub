"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "@/lib/i18n";

// useSyncExternalStore用のマウント状態管理
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslations();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label={t("accessibility.switchLanguage")}>
        <span className="text-lg" aria-hidden="true">🌐</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("accessibility.switchLanguage")}>
          <span className="text-lg" aria-hidden="true">{locale === "ja" ? "🇯🇵" : "🇺🇸"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("ja")} aria-current={locale === "ja" ? "true" : undefined}>
          <span className="mr-2" aria-hidden="true">🇯🇵</span>
          {t("language.ja")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")} aria-current={locale === "en" ? "true" : undefined}>
          <span className="mr-2" aria-hidden="true">🇺🇸</span>
          {t("language.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
