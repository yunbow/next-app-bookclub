import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AccountDeleteSection } from "@/features/settings/components/AccountDeleteSection";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            設定に戻る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">アカウント情報</h1>
        <p className="text-muted-foreground mt-2">メールアドレス、ユーザーID、アカウント削除</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ユーザーID</p>
              <p className="text-sm mt-1">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">メールアドレス</p>
              <p className="text-sm mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">名前</p>
              <p className="text-sm mt-1">{user.name || "未設定"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">登録日</p>
              <p className="text-sm mt-1">{new Date(user.createdAt).toLocaleDateString("ja-JP")}</p>
            </div>
          </CardContent>
        </Card>

        <AccountDeleteSection />
      </div>
    </div>
  );
}
