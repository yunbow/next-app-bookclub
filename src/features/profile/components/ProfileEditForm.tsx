"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  ProfileUpdateSchema,
  type ProfileUpdateInput,
} from "../schema/profile-schema";
import { updateUserFavoriteGenres } from "@/features/genre/server/genre-actions";

interface ProfileEditFormProps {
  currentName: string | null;
  currentUsername: string;
  currentImage: string | null;
  email: string;
  allGenres: Array<{ id: string; name: string; slug: string }>;
  currentGenreIds: string[];
}

export function ProfileEditForm({
  currentName,
  currentUsername,
  currentImage,
  email,
  allGenres,
  currentGenreIds,
}: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState(currentImage || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: currentName || "",
      username: currentUsername,
      image: currentImage || "",
      genreIds: currentGenreIds,
    },
  });

  const name = watch("name");

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setValue("image", data.url);
      toast.success("画像をアップロードしました");
    } catch {
      toast.error("画像のアップロードに失敗しました");
      setPreviewImage(currentImage || "");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          username: data.username.trim(),
          image: data.image || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "プロフィールの更新に失敗しました");
      }

      await updateUserFavoriteGenres(data.genreIds ?? []);

      toast.success("プロフィールを更新しました");
      router.back();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "プロフィールの更新に失敗しました");
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">プロフィール編集</h1>
        <p className="text-muted-foreground mt-2">ユーザー名・ユーザーIDとアイコンを編集できます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload - Clickable Avatar */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={handleImageClick}
                aria-label="アイコンを変更"
                disabled={isUploadingImage}
              >
                <Avatar className="h-24 w-24 cursor-pointer">
                  <AvatarImage src={previewImage || undefined} />
                  <AvatarFallback className="text-2xl">
                    {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </div>
                {isUploadingImage && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                    role="status"
                    aria-label="アップロード中"
                  >
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" aria-hidden="true" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageChange}
                aria-label="アイコンを変更"
              />
              <p className="text-sm text-muted-foreground">
                クリックして画像をアップロード
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">ユーザー名 *</Label>
              <Input
                id="name"
                placeholder="表示名を入力"
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">
                ユーザーID *
                <span className="ml-2 text-xs text-muted-foreground">（@の後に表示されます）</span>
              </Label>
              <Input
                id="username"
                placeholder="username"
                disabled={isSubmitting}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                メールアドレスは変更できません
              </p>
            </div>

            {/* Favorite Genres */}
            <div className="space-y-2">
              <Label>好きなジャンル</Label>
              <p className="text-xs text-muted-foreground">
                興味のあるジャンルを選択してください（任意・複数可）
              </p>
              <Controller
                name="genreIds"
                control={control}
                render={({ field }) => {
                  const selected = new Set(field.value ?? []);
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                      {allGenres.map((genre) => {
                        const checked = selected.has(genre.id);
                        return (
                          <label
                            key={genre.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                const next = new Set(field.value ?? []);
                                if (value === true) {
                                  next.add(genre.id);
                                } else {
                                  next.delete(genre.id);
                                }
                                field.onChange(Array.from(next));
                              }}
                            />
                            <span>{genre.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {errors.genreIds && (
                <p className="text-sm text-destructive">{errors.genreIds.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "更新"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
