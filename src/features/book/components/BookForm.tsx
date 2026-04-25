"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBookSchema, type CreateBookInput } from "../schema/book-schema";
import { useCreateBook } from "../queries/book-queries";
import { GoogleBooksSearch } from "./GoogleBooksSearch";

export function BookForm() {
  const router = useRouter();
  const createBook = useCreateBook();
  const [showSearch, setShowSearch] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateBookInput>({
    resolver: zodResolver(createBookSchema),
  });

  const handleBookSelect = (bookData: Partial<CreateBookInput>) => {
    if (bookData.isbn) setValue("isbn", bookData.isbn);
    if (bookData.title) setValue("title", bookData.title);
    if (bookData.author) setValue("author", bookData.author);
    if (bookData.publisher) setValue("publisher", bookData.publisher);
    if (bookData.publishedYear) setValue("publishedYear", bookData.publishedYear);
    if (bookData.pages) setValue("pages", bookData.pages);
    if (bookData.description) setValue("description", bookData.description);
    if (bookData.coverImage) setValue("coverImage", bookData.coverImage);
    setShowSearch(false);
    toast.success("書籍情報を自動入力しました");
  };

  const onSubmit = async (data: CreateBookInput) => {
    try {
      const result = await createBook.mutateAsync(data);
      toast.success("書籍を登録しました");
      router.push(`/books/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>書籍情報</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? "検索を閉じる" : "Google Booksで検索"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSearch && (
            <GoogleBooksSearch onSelect={handleBookSelect} />
          )}

          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN *</Label>
            <Input
              id="isbn"
              placeholder="978-4-XXXX-XXXX-X"
              {...register("isbn")}
            />
            {errors.isbn && (
              <p className="text-sm text-destructive">{errors.isbn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              placeholder="書籍のタイトル"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">著者</Label>
            <Input
              id="author"
              placeholder="著者名"
              {...register("author")}
            />
            {errors.author && (
              <p className="text-sm text-destructive">{errors.author.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">出版社</Label>
            <Input
              id="publisher"
              placeholder="出版社名"
              {...register("publisher")}
            />
            {errors.publisher && (
              <p className="text-sm text-destructive">{errors.publisher.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedYear">出版年</Label>
            <Input
              id="publishedYear"
              type="number"
              placeholder="2024"
              {...register("publishedYear", { valueAsNumber: true })}
            />
            {errors.publishedYear && (
              <p className="text-sm text-destructive">{errors.publishedYear.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages">ページ数</Label>
            <Input
              id="pages"
              type="number"
              placeholder="300"
              {...register("pages", { valueAsNumber: true })}
            />
            {errors.pages && (
              <p className="text-sm text-destructive">{errors.pages.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              placeholder="書籍の説明（任意）"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">カバー画像URL</Label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://example.com/cover.jpg"
              {...register("coverImage")}
            />
            {errors.coverImage && (
              <p className="text-sm text-destructive">{errors.coverImage.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={createBook.isPending}>
          {createBook.isPending ? "登録中..." : "登録"}
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
