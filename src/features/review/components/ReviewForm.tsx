"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createReviewSchema, type CreateReviewInput } from "../schema/review-schema";
import { useCreateReview } from "../queries/review-queries";

interface ReviewFormProps {
  bookId: string;
}

export function ReviewForm({ bookId }: ReviewFormProps) {
  const router = useRouter();
  const createReview = useCreateReview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      bookId,
      rating: 5,
      visibility: "public",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: CreateReviewInput) => {
    try {
      const result = await createReview.mutateAsync(data);
      toast.success("レビューを投稿しました");
      router.push(`/reviews/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>レビュー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>評価 *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("rating", value)}
                  className={`text-2xl ${
                    value <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">レビュー内容 *</Label>
            <Textarea
              id="content"
              placeholder="この本の感想を書いてください"
              rows={8}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>公開設定</Label>
            <RadioGroup
              defaultValue="public"
              onValueChange={(value) => setValue("visibility", value as "public" | "private" | "draft")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">公開</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">非公開</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={createReview.isPending}>
          {createReview.isPending ? "投稿中..." : "投稿"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
