"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEventSchema, type CreateEventInput } from "../schema/event-schema";
import { useCreateEvent } from "../queries/event-queries";

export function EventForm() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      isOnline: false,
      requiresApproval: false,
    },
  });

  const isOnline = watch("isOnline");
  const requiresApproval = watch("requiresApproval");

  const onSubmit = async (data: CreateEventInput) => {
    try {
      const result = await createEvent.mutateAsync(data);
      toast.success("イベントを作成しました");
      router.push(`/events/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>イベント情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              placeholder="読書会のタイトル"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              placeholder="イベントの説明"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">開催日時 *</Label>
            <Input
              id="eventDate"
              type="datetime-local"
              {...register("eventDate")}
            />
            {errors.eventDate && (
              <p className="text-sm text-destructive">{errors.eventDate.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOnline"
              checked={isOnline}
              onCheckedChange={(checked) => setValue("isOnline", checked as boolean)}
            />
            <Label htmlFor="isOnline">オンライン開催</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{isOnline ? "オンラインURL" : "開催場所"}</Label>
            <Input
              id="location"
              placeholder={isOnline ? "https://zoom.us/..." : "東京都渋谷区..."}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">定員</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="10"
              {...register("maxParticipants", { valueAsNumber: true })}
            />
            {errors.maxParticipants && (
              <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresApproval"
              checked={requiresApproval}
              onCheckedChange={(checked) => setValue("requiresApproval", checked as boolean)}
            />
            <Label htmlFor="requiresApproval">参加承認制</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">テーマ</Label>
            <Input
              id="theme"
              placeholder="今月のテーマ"
              {...register("theme")}
            />
            {errors.theme && (
              <p className="text-sm text-destructive">{errors.theme.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={createEvent.isPending}>
          {createEvent.isPending ? "作成中..." : "作成"}
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
