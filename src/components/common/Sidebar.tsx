"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type { PlanType } from "@/lib/plans";
import {
  UsersIcon,
  UserIcon,
  SettingsIcon,
  BookmarkIcon,
  BellIcon,
} from "./icons";
import { useTranslations } from "@/lib/i18n";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ChevronLeft, ChevronRight, LayoutDashboard, Search } from "lucide-react";

type NavItem = {
  labelKey: "dashboard" | "books" | "clubs" | "bookmarks" | "notifications" | "profile" | "settings";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const getNavItems = (userId?: string): NavItem[] => [
  { labelKey: "dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { labelKey: "books", href: "/books", icon: <Search className="h-5 w-5" /> },
  { labelKey: "clubs", href: "/clubs", icon: <UsersIcon /> },
  { labelKey: "bookmarks", href: "/bookmarks", icon: <BookmarkIcon />, authRequired: true },
  { labelKey: "notifications", href: "/notifications", icon: <BellIcon />, authRequired: true },
  { labelKey: "profile", href: userId ? `/users/${userId}` : "/dashboard", icon: <UserIcon />, authRequired: true },
  { labelKey: "settings", href: "/settings", icon: <SettingsIcon />, authRequired: true },
];

const PLAN_BADGE_STYLES: Record<PlanType, string> = {
  free: "border-transparent bg-muted text-muted-foreground",
  basic: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  premium: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const PLAN_LABELS: Record<PlanType, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
};

function PlanBadge({ plan }: { plan: PlanType }) {
  return (
    <Badge className={cn("px-1.5 py-0 text-[10px] font-medium shrink-0", PLAN_BADGE_STYLES[plan])}>
      {PLAN_LABELS[plan]}
    </Badge>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // localStorageから初期値を読み込む
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/user/plan")
      .then((res) => res.json())
      .then((data) => setUserPlan(data.plan ?? "free"))
      .catch(() => {});
  }, [session?.user?.id]);

  const filteredNavItems = getNavItems(session?.user?.id).filter((item) => {
    // 認証が必要な項目はログイン済みユーザーのみ
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    setIsDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r h-screen sticky top-0 overflow-y-auto transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* ロゴ + 開閉ボタン */}
      <div
        className={cn(
          "flex border-b",
          isCollapsed ? "flex-col items-center gap-2 p-3" : "items-center justify-between p-4"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(isCollapsed && "mx-auto")}
          aria-label={t("accessibility.homeLink")}
        >
          <BrandLogo
            label={t("common.appName")}
            showText={!isCollapsed}
            iconSize={32}
            textClassName="text-xl"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const newState = !isCollapsed;
            setIsCollapsed(newState);
            // localStorageに保存
            if (typeof window !== 'undefined') {
              localStorage.setItem('sidebar-collapsed', String(newState));
            }
          }}
          className={cn(isCollapsed && "mx-auto")}
          title={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          aria-label={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground relative",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
              isCollapsed ? "justify-center px-2" : "gap-3"
            )}
            title={isCollapsed ? t(`nav.${item.labelKey}`) : undefined}
            aria-label={t(`nav.${item.labelKey}`)}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <span aria-hidden="true" className="transition-transform duration-200">{item.icon}</span>
            {!isCollapsed && (
              <span className="transition-opacity duration-200 whitespace-nowrap">
                {t(`nav.${item.labelKey}`)}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ユーザー情報（下部固定） */}
      {session && (
        <div className="border-t p-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCollapsed ? "justify-center px-2" : "gap-3"
                )}
                aria-label={t("accessibility.userMenu")}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback>
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm truncate">
                        {session.user?.name || t("common.nameNotSet")}
                      </p>
                      <PlanBadge plan={userPlan} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                )}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("logout.title")}</DialogTitle>
                <DialogDescription>
                  {t("logout.confirm")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  {t("common.logout")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </aside>
  );
}
