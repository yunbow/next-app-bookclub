"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useTranslations } from "@/lib/i18n";

export function LPHeader() {
  const { t } = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center space-x-2" aria-label={t("accessibility.homeLink")}>
          <BrandLogo
            label={t("common.appName")}
            iconSize={32}
            textClassName="text-xl sm:text-2xl"
          />
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label={t("nav.home")}>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost">{t("common.login")}</Button>
          </Link>
          <Link href="/register">
            <Button className="px-3 sm:px-4">{t("common.register")}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
