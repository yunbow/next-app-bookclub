"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createHighlightSchema, type CreateHighlightInput } from "../schema/highlight-schema";
import { useCreateHighlight } from "../queries/highlight-queries";
import { toast } from "sonner";

interface HighlightFormProps {
  bookId: string;
  onSuccess?: () => void;
}

export function HighlightForm({ bookId, onSuccess }: HighlightFormProps) {
  const createHighlight = useCreateHighlight();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateHighlightInput>({
    resolver: zodResolver(createHighlightSchema),
    defaultValues: {
      bookId,
      color: "yellow",
      isPublic: false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const color = watch("color");
  const isPublic = watch("isPublic");

  const onSubmit = async (data: CreateHighlightInput) => {
    try {
      await createHighlight.mutateAsync(data);
      toast.success("ハイライトを作成しました");
      reset({ bookId, color: "yellow", isPublic: false });
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const colorOptions = [
    { value: "yellow", label: "イエロー", bg: "bg-yellow-200" },
    { value: "green", label: "グリーン", bg: "bg-green-200" },
    { value: "blue", label: "ブルー", bg: "bg-blue-200" },
    { value: "pink", label: "ピンク", bg: "bg-pink-200" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>ハイライトを追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">引用文 *</Label>
            <Textarea
              id="content"
              placeholder="印象的な文章を入力..."
              rows={4}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageNumber">ページ番号</Label>
              <Input
                id="pageNumber"
                type="number"
                placeholder="42"
                {...register("pageNumber", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter">章</Label>
              <Input
                id="chapter"
                placeholder="第3章"
                {...register("chapter")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">メモ</Label>
            <Textarea
              id="note"
              placeholder="この部分について..."
              rows={2}
              {...register("note")}
            />
          </div>

          <div className="space-y-2">
            <Label>カラー</Label>
            <Select value={color} onValueChange={(value) => setValue("color", value as "yellow" | "green" | "blue" | "pink")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${option.bg}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue("isPublic", checked as boolean)}
            />
            <Label htmlFor="isPublic">公開する</Label>
          </div>

          <Button type="submit" disabled={createHighlight.isPending} className="w-full">
            {createHighlight.isPending ? "作成中..." : "ハイライトを作成"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
