"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  coverImage: string | null;
  isbn: string | null;
}

export function BookSearchForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("検索キーワードを入力してください");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("検索に失敗しました");
      }

      const data = await response.json();
      setResults(data.books || []);

      if (!data.books || data.books.length === 0) {
        toast.info("検索結果が見つかりませんでした");
      } else {
        toast.success(`${data.books.length}件の書籍が見つかりました`);
      }
    } catch {
      toast.error("検索中にエラーが発生しました");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">検索キーワード</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="タイトル、著者、ISBNで検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "検索中..." : "検索"}
            </Button>
          </div>
        </div>
      </form>

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">検索結果</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold line-clamp-2">
                          {book.title}
                        </h3>
                        {book.author && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {book.author}
                          </p>
                        )}
                        {book.publisher && (
                          <p className="text-xs text-muted-foreground">
                            {book.publisher}
                          </p>
                        )}
                        {book.isbn && (
                          <p className="text-xs text-muted-foreground">
                            ISBN: {book.isbn}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
