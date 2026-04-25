"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface RecommendedBook {
  id: string;
  title: string;
  author: string | null;
  coverImage: string | null;
  description: string | null;
  _count?: {
    reviews: number;
  };
}

interface RecommendationsProps {
  books: RecommendedBook[];
}

export function Recommendations({ books }: RecommendationsProps) {
  if (books.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>おすすめ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            おすすめの本がありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>おすすめ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <div className="hover:opacity-80 transition-opacity h-full">
                <div className="space-y-2">
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">
                        No Image
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold line-clamp-2 text-sm">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {book.author}
                      </p>
                    )}
                    {book._count?.reviews && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ⭐ {book._count.reviews}件のレビュー
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
