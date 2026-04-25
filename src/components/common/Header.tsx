"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useTranslations } from "@/lib/i18n";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const { t } = useTranslations();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/books" className="text-xl font-bold">
            {t("common.appName")}
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/books"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("nav.books")}
            </Link>
            <Link
              href="/events"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("nav.events")}
            </Link>
            <Link
              href="/profile"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("nav.profile")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
          )}
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
