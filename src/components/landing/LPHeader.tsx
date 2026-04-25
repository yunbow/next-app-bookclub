"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n";

export function LPHeader() {
  const { t } = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2" aria-label={t("accessibility.homeLink")}>
          <span className="text-2xl font-bold">{t("common.appName")}</span>
        </Link>

        <nav className="flex items-center gap-2" aria-label={t("nav.home")}>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Link href="/login">
            <Button variant="ghost">{t("common.login")}</Button>
          </Link>
          <Link href="/register">
            <Button>{t("common.register")}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
