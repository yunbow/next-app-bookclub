"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ReadingStatusButton } from "./ReadingStatusButton";
import { BookmarkButton } from "@/features/bookmark/components/BookmarkButton";
import { ReviewList } from "@/features/review/components/ReviewList";
import { ProgressTracker } from "@/features/reading-progress/components/ProgressTracker";
import { ReadingTimer } from "@/features/reading-session/components/ReadingTimer";
import { HighlightList } from "@/features/highlight/components/HighlightList";

interface BookDetailProps {
  book: {
    id: string;
    isbn: string | null;
    title: string;
    author: string | null;
    publisher: string | null;
    publishedYear: number | null;
    pages: number | null;
    description: string | null;
    coverImage: string | null;
    reviews: Array<{
      id: string;
      content: string;
      rating: number | null;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
      _count: {
        comments: number;
        reactions: number;
      };
    }>;
    _count: {
      reviews: number;
      userBooks: number;
    };
  };
  userBook?: {
    id: string;
    status: string;
    rating: number | null;
    startDate: Date | null;
    endDate: Date | null;
    memo: string | null;
    currentPage: number | null;
  };
  isBookmarked?: boolean;
}

const statusLabels: Record<string, string> = {
  to_read: "積読",
  reading: "読書中",
  completed: "読了",
  paused: "一時中断",
};

export function BookDetail({ book, userBook, isBookmarked = false }: BookDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex gap-6">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-64 w-48 object-cover rounded"
              />
            ) : (
              <div className="h-64 w-48 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl mb-4">{book.title}</CardTitle>
              {book.author && (
                <p className="text-lg text-muted-foreground mb-2">著者: {book.author}</p>
              )}
              {book.publisher && (
                <p className="text-sm text-muted-foreground mb-1">出版社: {book.publisher}</p>
              )}
              {book.publishedYear && (
                <p className="text-sm text-muted-foreground mb-1">出版年: {book.publishedYear}</p>
              )}
              {book.pages && (
                <p className="text-sm text-muted-foreground mb-1">ページ数: {book.pages}ページ</p>
              )}
              {book.isbn && (
                <p className="text-sm text-muted-foreground mb-4">ISBN: {book.isbn}</p>
              )}
              <div className="flex gap-3 mb-4">
                <span className="text-sm">📚 {book._count.userBooks}人が登録</span>
                <span className="text-sm">📝 {book._count.reviews}件のレビュー</span>
              </div>
              {userBook && (
                <div className="mb-4">
                  <Badge>{statusLabels[userBook.status]}</Badge>
                  {userBook.rating && (
                    <span className="ml-2">⭐ {userBook.rating}</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <ReadingStatusButton bookId={book.id} currentStatus={userBook?.status} />
                <BookmarkButton bookId={book.id} initialBookmarked={isBookmarked} />
                <Link href={`/reviews/new?bookId=${book.id}`}>
                  <Button variant="outline">レビューを書く</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        {book.description && (
          <CardContent>
            <h3 className="font-semibold mb-2">説明</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {book.description}
            </p>
          </CardContent>
        )}
        {userBook?.memo && (
          <CardContent>
            <h3 className="font-semibold mb-2">読書メモ</h3>
            <p className="text-sm whitespace-pre-wrap">{userBook.memo}</p>
          </CardContent>
        )}
      </Card>

      {userBook && (
        <div className="grid gap-6 md:grid-cols-2">
          <ProgressTracker
            bookId={book.id}
            currentPage={userBook.currentPage || 0}
            totalPages={book.pages || 300}
          />
          <ReadingTimer bookId={book.id} />
        </div>
      )}

      {userBook && (
        <Card>
          <CardHeader>
            <CardTitle>ハイライト</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightList bookId={book.id} />
          </CardContent>
        </Card>
      )}

      {book.reviews.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">レビュー</h2>
          <ReviewList
            reviews={book.reviews.map((review) => ({
              ...review,
              book: {
                id: book.id,
                title: book.title,
                coverImage: book.coverImage,
              },
            }))}
          />
        </div>
      )}
    </div>
  );
}
