"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const sortOptions = [
  { value: "latest", label: "最新順" },
  { value: "title", label: "タイトル順" },
  { value: "author", label: "著者順" },
];

export function BooksFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const sort = searchParams.get("sort") || "latest";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sort) params.set("sort", sort);
    params.set("page", "1");
    router.push(`/books?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("sort", e.target.value);
    params.set("page", "1");
    router.push(`/books?${params.toString()}`);
  };

  return (
    <div className="bg-card rounded-lg border p-4 mb-6 space-y-4">
      <div className="flex gap-4 flex-col md:flex-row">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="タイトル、著者で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">検索</Button>
        </form>
        <select
          value={sort}
          onChange={handleSortChange}
          className="px-3 py-2 rounded-md border bg-background text-foreground"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
