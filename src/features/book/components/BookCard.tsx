"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string | null;
    coverImage: string | null;
    userBooks: Array<{
      status: string;
      rating: number | null;
    }>;
    _count: {
      reviews: number;
      userBooks: number;
    };
  };
}

const statusLabels: Record<string, string> = {
  to_read: "積読",
  reading: "読書中",
  completed: "読了",
  paused: "一時中断",
};

const statusColors: Record<string, string> = {
  to_read: "bg-gray-500",
  reading: "bg-blue-500",
  completed: "bg-green-500",
  paused: "bg-yellow-500",
};

export function BookCard({ book }: BookCardProps) {
  const userBook = book.userBooks[0];
  
  return (
    <Link href={`/books/${book.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex gap-4">
            {book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-32 w-24 object-cover rounded"
              />
            ) : (
              <div className="h-32 w-24 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No Image</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
              {book.author && (
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
              )}
              {userBook && (
                <Badge className={statusColors[userBook.status]}>
                  {statusLabels[userBook.status]}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span>📚 {book._count.userBooks}人が登録</span>
              <span>📝 {book._count.reviews}件のレビュー</span>
            </div>
            {userBook?.rating && (
              <span>⭐ {userBook.rating}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
