"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Book {
  id: string;
  title: string;
  author: string | null;
  coverImage: string | null;
  userBooks: Array<{
    status: string;
    rating: number | null;
    currentPage: number | null;
  }>;
}

interface BookShelfProps {
  books: {
    toRead: Book[];
    reading: Book[];
    completed: Book[];
    paused: Book[];
  };
}

const statusLabels: Record<string, string> = {
  to_read: "積読",
  reading: "読書中",
  completed: "読了",
  paused: "一時中断",
};

const statusColors: Record<string, string> = {
  to_read: "bg-blue-100 text-blue-800",
  reading: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
  paused: "bg-gray-100 text-gray-800",
};

function BookCard({ book, status }: { book: Book; status: string }) {
  const userBook = book.userBooks[0];

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="space-y-3">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-48 object-cover rounded"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No Image</span>
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
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    statusColors[status] || "bg-gray-100"
                  }`}
                >
                  {statusLabels[status] || status}
                </span>
                {userBook.rating && (
                  <span className="text-xs">⭐ {userBook.rating}</span>
                )}
              </div>
              {userBook.currentPage !== null && userBook.currentPage > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {userBook.currentPage}ページ
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BookShelf({ books }: BookShelfProps) {
  const [activeTab, setActiveTab] = useState("reading");

  const tabs = [
    { id: "reading", label: "読書中", books: books.reading },
    { id: "toRead", label: "積読", books: books.toRead },
    { id: "completed", label: "読了", books: books.completed },
    { id: "paused", label: "一時中断", books: books.paused },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
          >
            {tab.label}
            <span className="text-xs">({tab.books.length})</span>
          </Button>
        ))}
      </div>

      {activeTabData && (
        <>
          {activeTabData.books.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeTabData.books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  status={
                    activeTab === "toRead"
                      ? "to_read"
                      : activeTab === "reading"
                        ? "reading"
                        : activeTab === "completed"
                          ? "completed"
                          : "paused"
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {activeTabData.label}の本はまだありません
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
