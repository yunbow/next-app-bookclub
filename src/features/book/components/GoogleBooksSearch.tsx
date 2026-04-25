"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { GoogleBook } from "@/lib/google-books";
import type { CreateBookInput } from "../schema/book-schema";

interface GoogleBooksSearchProps {
  onSelect: (bookData: Partial<CreateBookInput>) => void;
}

export function GoogleBooksSearch({ onSelect }: GoogleBooksSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("検索キーワードを入力してください");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/google-books/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("検索に失敗しました");
      }

      const data = await response.json();
      setResults(data.items || []);

      if (!data.items || data.items.length === 0) {
        toast.info("検索結果が見つかりませんでした");
      }
    } catch {
      toast.error("検索中にエラーが発生しました");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (book: GoogleBook) => {
    const { volumeInfo } = book;

    const isbn13 = volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_13"
    )?.identifier;
    const isbn10 = volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_10"
    )?.identifier;
    const isbn = isbn13 || isbn10 || volumeInfo.industryIdentifiers?.[0]?.identifier;

    const bookData: Partial<CreateBookInput> = {
      isbn: isbn || undefined,
      title: volumeInfo.title,
      author: volumeInfo.authors?.join(", "),
      publisher: volumeInfo.publisher,
      publishedYear: volumeInfo.publishedDate
        ? parseInt(volumeInfo.publishedDate.split("-")[0])
        : undefined,
      pages: volumeInfo.pageCount,
      description: volumeInfo.description,
      coverImage: volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://"),
      category: volumeInfo.categories?.[0],
    };

    onSelect(bookData);
    setResults([]);
    setQuery("");
    toast.success("書籍情報を取得しました");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Google Booksで検索</Label>
        <div className="flex gap-2">
          <Input
            id="search"
            placeholder="タイトル、著者、ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "検索中..." : "検索"}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleSelect(book)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {book.volumeInfo.imageLinks?.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">
                      {book.volumeInfo.title}
                    </h4>
                    {book.volumeInfo.authors && (
                      <p className="text-sm text-muted-foreground">
                        {book.volumeInfo.authors.join(", ")}
                      </p>
                    )}
                    {book.volumeInfo.publishedDate && (
                      <p className="text-xs text-muted-foreground">
                        {book.volumeInfo.publishedDate.split("-")[0]}年
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
