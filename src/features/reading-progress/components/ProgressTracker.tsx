"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProgressAction } from "../server/progress-actions";
import { toast } from "sonner";

interface ProgressTrackerProps {
  bookId: string;
  currentPage: number;
  totalPages?: number;
  onUpdate?: () => void;
}

export function ProgressTracker({
  bookId,
  currentPage,
  totalPages,
  onUpdate,
}: ProgressTrackerProps) {
  const [page, setPage] = useState(currentPage);
  const [isUpdating, setIsUpdating] = useState(false);

  const progress = totalPages ? Math.round((currentPage / totalPages) * 100) : 0;
  const remainingPages = totalPages ? totalPages - currentPage : 0;

  const handleUpdate = async () => {
    if (page < 0 || (totalPages && page > totalPages)) {
      toast.error("無効なページ数です");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateProgressAction({
        bookId,
        currentPage: page,
      });

      if (result.success) {
        toast.success("進捗を更新しました");
        onUpdate?.();
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>読書進捗</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalPages && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進捗率</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">現在のページ</p>
                <p className="text-2xl font-bold">{currentPage}</p>
              </div>
              <div>
                <p className="text-muted-foreground">残りページ</p>
                <p className="text-2xl font-bold">{remainingPages}</p>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="currentPage">ページを更新</Label>
          <div className="flex gap-2">
            <Input
              id="currentPage"
              type="number"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value) || 0)}
              min={0}
              max={totalPages}
            />
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "更新中..." : "更新"}
            </Button>
          </div>
        </div>

        {totalPages && (
          <p className="text-xs text-muted-foreground">
            総ページ数: {totalPages}ページ
          </p>
        )}
      </CardContent>
    </Card>
  );
}
