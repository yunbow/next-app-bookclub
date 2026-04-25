"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ReadingProgressBook {
  id: string;
  title: string;
  author: string | null;
  pages: number | null;
  coverImage: string | null;
  userBooks: Array<{
    currentPage: number;
    status: string;
  }>;
}

interface ReadingProgressProps {
  books: ReadingProgressBook[];
}

export function ReadingProgress({ books }: ReadingProgressProps) {
  if (books.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>読書進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            現在読んでいる本はありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>読書進捗</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {books.map((book) => {
            const userBook = book.userBooks[0];
            const progress = book.pages
              ? Math.round((userBook.currentPage / book.pages) * 100)
              : 0;

            return (
              <Link key={book.id} href={`/books/${book.id}`}>
                <div className="hover:opacity-80 transition-opacity">
                  <div className="flex gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-1 text-sm">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {book.author}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {userBook.currentPage}
                      {book.pages && `/${book.pages}`}ページ
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress}%
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
