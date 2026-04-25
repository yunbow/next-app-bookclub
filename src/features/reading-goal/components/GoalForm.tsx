"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGoalSchema, type CreateGoalInput } from "../schema/goal-schema";
import { useCreateGoal } from "../queries/goal-queries";
import { toast } from "sonner";

type GoalFormProps = {
  onSuccess?: () => void;
};

export function GoalForm({ onSuccess }: GoalFormProps) {
  const createGoal = useCreateGoal();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      type: "yearly_books",
      year: currentYear,
      month: currentMonth,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const goalType = watch("type");

  const onSubmit = async (data: CreateGoalInput) => {
    try {
      await createGoal.mutateAsync(data);
      toast.success("目標を作成しました");
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しい目標を作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">目標タイプ</Label>
            <Select
              value={goalType}
              onValueChange={(value) => setValue("type", value as "yearly_books" | "monthly_books" | "genre_books" | "pages")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly_books">年間読書目標</SelectItem>
                <SelectItem value="monthly_books">月間読書目標</SelectItem>
                <SelectItem value="genre_books">ジャンル別目標</SelectItem>
                <SelectItem value="pages">ページ数目標</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">年</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            {(goalType === "monthly_books" || goalType === "genre_books") && (
              <div className="space-y-2">
                <Label htmlFor="month">月</Label>
                <Input
                  id="month"
                  type="number"
                  min={1}
                  max={12}
                  {...register("month", { valueAsNumber: true })}
                />
                {errors.month && (
                  <p className="text-sm text-destructive">{errors.month.message}</p>
                )}
              </div>
            )}
          </div>

          {goalType === "genre_books" && (
            <div className="space-y-2">
              <Label htmlFor="genre">ジャンル</Label>
              <Input
                id="genre"
                placeholder="例: SF、ミステリー"
                {...register("genre")}
              />
              {errors.genre && (
                <p className="text-sm text-destructive">{errors.genre.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target">
              目標{goalType === "pages" ? "ページ数" : "冊数"}
            </Label>
            <Input
              id="target"
              type="number"
              min={1}
              {...register("target", { valueAsNumber: true })}
            />
            {errors.target && (
              <p className="text-sm text-destructive">{errors.target.message}</p>
            )}
          </div>

          <Button type="submit" disabled={createGoal.isPending} className="w-full">
            {createGoal.isPending ? "作成中..." : "目標を作成"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
