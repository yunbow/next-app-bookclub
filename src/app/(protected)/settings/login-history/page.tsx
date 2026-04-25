import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginHistoryList } from "@/features/settings/components/LoginHistoryList";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export default async function LoginHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let loginHistories: Awaited<ReturnType<typeof prisma.loginHistory.findMany>> = [];
  try {
    loginHistories = await prisma.loginHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch login history");
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div>
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            設定に戻る
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">ログイン履歴</h1>
        <p className="text-muted-foreground mt-2">最近のログイン履歴を確認</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ログイン履歴</CardTitle>
          <CardDescription>
            最近のログイン履歴を表示します
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginHistories.length > 0 ? (
            <LoginHistoryList loginHistories={loginHistories} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              ログイン履歴がありません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
