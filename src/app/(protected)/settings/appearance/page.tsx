import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default async function AppearancePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl pb-8">
      <div className="mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            設定に戻る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">外観</h1>
        <p className="text-muted-foreground mt-2">表示言語とテーマの設定</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>表示言語</CardTitle>
            <CardDescription>表示言語を選択</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>テーマ</CardTitle>
            <CardDescription>ライト、ダーク、またはシステム設定</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
