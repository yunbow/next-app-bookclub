import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PasswordChangeForm } from "@/features/settings/components/PasswordChangeForm";

export default async function PasswordPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
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
        <h1 className="text-2xl font-bold">パスワード変更</h1>
        <p className="text-muted-foreground mt-2">パスワードを変更</p>
      </div>

      <PasswordChangeForm />
    </div>
  );
}
