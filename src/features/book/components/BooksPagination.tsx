"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface BooksPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function BooksPagination({ currentPage, totalPages }: BooksPaginationProps) {
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `/books?${params.toString()}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)}>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>
        </Link>
      )}

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link key={p} href={buildUrl(p)}>
            <Button
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              className="w-10"
            >
              {p}
            </Button>
          </Link>
        ))}
      </div>

      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)}>
          <Button variant="outline" size="sm" className="gap-2">
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
