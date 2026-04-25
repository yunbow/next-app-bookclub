"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { LPHeader, LPFooter } from "@/components/landing";
import { useTranslations } from "@/lib/i18n";

function SkipLink() {
  const { t } = useTranslations();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
    >
      {t("accessibility.skipToContent")}
    </a>
  );
}

// LPページのパスリスト（ページ自体がLP用レイアウトを持つ）
const LP_PATHS = ["/"];

// LP風ヘッダーを使うページ（検索ボックスなし）
const LP_HEADER_PATHS = ["/login", "/register", "/terms", "/privacy", "/cookies", "/about"];

// 認証不要ページ（ログイン前でも表示）
const PUBLIC_PATHS = ["/login", "/register", "/terms", "/privacy", "/cookies", "/about", "/search"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isLPPage = LP_PATHS.includes(pathname);
  const useLPHeader = LP_HEADER_PATHS.some(path => pathname.startsWith(path));
  const isPublicPage = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // LPページ: ローディング中または未ログイン時はLP用レイアウト
  // ログイン済みの場合はサイドバー付きレイアウトに遷移
  if (isLPPage) {
    if (isLoading) {
      // ローディング中はLPレイアウト（フラッシュ防止）
      return <>{children}</>;
    }
    if (!isAuthenticated) {
      return <>{children}</>;
    }
    // isAuthenticated の場合は下のサイドバー付きレイアウトへ
  }

  // LP風ヘッダーページ（login/register等）: 認証状態に関係なくサイドバーを表示しない
  if (useLPHeader) {
    return (
      <>
        <SkipLink />
        <LPHeader />
        <main id="main-content">{children}</main>
        <LPFooter />
      </>
    );
  }

  // セッション確認中（保護されたページ）: ローディング表示でフラッシュを防止
  if (isLoading && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // ログイン済み: サイドバー（デスクトップ）+ ボトムナビ（モバイル）
  if (isAuthenticated) {
    return (
      <>
        <SkipLink />
        <div className="flex min-h-screen">
          <Sidebar />
          <main id="main-content" className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
          <MobileNav />
        </div>
      </>
    );
  }

  // 未ログイン（その他 public pages）: 通常ヘッダー + コンテンツ
  if (isPublicPage) {
    return (
      <>
        <SkipLink />
        <Header />
        <main id="main-content">{children}</main>
      </>
    );
  }

  // その他: ヘッダー + コンテンツ
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content">{children}</main>
    </>
  );
}
