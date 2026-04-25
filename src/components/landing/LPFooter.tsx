"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n";

export function LPFooter() {
  const { t } = useTranslations();

  return (
    <footer className="border-t bg-muted/50" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label={t("accessibility.footerNavigation")}>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              {t("footer.cookies")}
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              {t("footer.about")}
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
