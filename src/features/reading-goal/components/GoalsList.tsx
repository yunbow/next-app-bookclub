"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import { useGoals } from "../queries/goal-queries";

export function GoalsList() {
  const [showForm, setShowForm] = useState(false);
  const { data: goals, isLoading } = useGoals();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>読書目標</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "閉じる" : "目標を追加"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <GoalForm onSuccess={() => setShowForm(false)} />
        )}

        {goals && goals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(goals as any[]).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            まだ目標が設定されていません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
