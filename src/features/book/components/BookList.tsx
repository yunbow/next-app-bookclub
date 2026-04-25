"use client";

import { BookCard } from "./BookCard";

interface BookListProps {
  books: Array<{
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
  }>;
}

export function BookList({ books }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">書籍が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
