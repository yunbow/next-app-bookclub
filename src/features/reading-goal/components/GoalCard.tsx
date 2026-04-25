"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeleteGoal } from "../queries/goal-queries";
import { toast } from "sonner";

interface GoalCardProps {
  goal: {
    id: string;
    type: string;
    target: number;
    current: number;
    year: number;
    month?: number | null;
    genre?: string | null;
  };
}

const typeLabels: Record<string, string> = {
  yearly_books: "年間読書目標",
  monthly_books: "月間読書目標",
  genre_books: "ジャンル別目標",
  pages: "ページ数目標",
};

export function GoalCard({ goal }: GoalCardProps) {
  const deleteGoal = useDeleteGoal();
  const progress = Math.round((goal.current / goal.target) * 100);
  const isCompleted = goal.current >= goal.target;

  const handleDelete = async () => {
    if (!confirm("この目標を削除しますか？")) return;

    try {
      await deleteGoal.mutateAsync(goal.id);
      toast.success("目標を削除しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{typeLabels[goal.type]}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {goal.year}年
              {goal.month && `${goal.month}月`}
              {goal.genre && ` - ${goal.genre}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteGoal.isPending}
          >
            削除
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>進捗</span>
            <span className="font-semibold">
              {goal.current} / {goal.target}
              {goal.type === "pages" ? "ページ" : "冊"}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                isCompleted ? "bg-green-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {progress}% 達成
          </p>
        </div>

        {isCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
              🎉 目標達成！
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
