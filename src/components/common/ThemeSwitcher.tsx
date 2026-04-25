"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

// useSyncExternalStore用のマウント状態管理
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslations();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label={t("accessibility.switchTheme")}>
        <Sun className="h-5 w-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("accessibility.switchTheme")}>
          {theme === "dark" ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : theme === "light" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Monitor className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} aria-current={theme === "light" ? "true" : undefined}>
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} aria-current={theme === "dark" ? "true" : undefined}>
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} aria-current={theme === "system" ? "true" : undefined}>
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
