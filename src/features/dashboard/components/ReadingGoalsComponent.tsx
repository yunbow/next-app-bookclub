"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingGoal {
  id: string;
  type: string;
  target: number;
  current: number;
  month?: number | null;
  genre?: string | null;
}

interface ReadingGoalsComponentProps {
  goals: ReadingGoal[];
}

const goalLabels: Record<string, string> = {
  yearly_books: "年間読書目標",
  monthly_books: "月間読書目標",
  genre_books: "ジャンル目標",
  pages: "ページ数目標",
};

export function ReadingGoalsComponent({ goals }: ReadingGoalsComponentProps) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>読書目標</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            読書目標が設定されていません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>読書目標</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = Math.round((goal.current / goal.target) * 100);
            const label = goalLabels[goal.type] || goal.type;

            return (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    {goal.genre && (
                      <p className="text-xs text-muted-foreground">
                        {goal.genre}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold">
                    {goal.current}/{goal.target}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {progress}%
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
