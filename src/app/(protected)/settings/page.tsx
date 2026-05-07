import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Lock, KeyRound, History, Palette, CreditCard } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const settingsItems = [
    {
      icon: CreditCard,
      title: "サブスクリプション",
      description: "プランの確認・変更、支払い管理",
      href: "/settings/billing",
    },
    {
      icon: Palette,
      title: "外観",
      description: "表示言語とテーマの設定",
      href: "/settings/appearance",
    },
    {
      icon: Lock,
      title: "アカウント情報",
      description: "メールアドレス、ユーザーID、アカウント削除",
      href: "/settings/account",
    },
    {
      icon: KeyRound,
      title: "パスワード変更",
      description: "パスワードを変更",
      href: "/settings/password",
    },
    {
      icon: History,
      title: "ログイン履歴",
      description: "最近のログイン履歴を確認",
      href: "/settings/login-history",
    },
  ];

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8" />
        <h1 className="text-2xl font-bold">設定</h1>
      </div>

      <div className="space-y-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
