"use client";

import { HighlightCard } from "./HighlightCard";
import { useHighlights } from "../queries/highlight-queries";

interface HighlightListProps {
  bookId: string;
}

export function HighlightList({ bookId }: HighlightListProps) {
  const { data: highlights, isLoading } = useHighlights(bookId);

  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (!highlights || highlights.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">まだハイライトがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {highlights.map((highlight: any) => (
        <HighlightCard key={highlight.id} highlight={highlight} />
      ))}
    </div>
  );
}
