"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

export function AccountDeleteSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "アカウントを削除") {
      toast.error("確認テキストが正しくありません");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      toast.success("アカウントを削除しました");
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      toast.error("アカウントの削除に失敗しました");
      console.error("Account deletion error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          アカウント削除
        </CardTitle>
        <CardDescription>
          アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              アカウントを削除
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                アカウント削除の確認
              </DialogTitle>
              <DialogDescription>
                この操作は取り消せません。本当にアカウントを削除しますか？
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-destructive mb-2">
                  削除されるデータ：
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• プロフィール情報</li>
                  <li>• 読書記録と進捗</li>
                  <li>• レビューとコメント</li>
                  <li>• イベント参加情報</li>
                  <li>• フォロー/フォロワー情報</li>
                  <li>• すべての個人データ</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">
                  確認のため「アカウントを削除」と入力してください
                </Label>
                <Input
                  id="confirm"
                  placeholder="アカウントを削除"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading || confirmText !== "アカウントを削除"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      削除中...
                    </>
                  ) : (
                    "削除"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
