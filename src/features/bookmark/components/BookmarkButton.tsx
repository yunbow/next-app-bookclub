"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleBookmark } from "../server/bookmark-actions";

interface BookmarkButtonProps {
  bookId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ bookId, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await toggleBookmark(bookId);
        setBookmarked(result.bookmarked);
        toast.success(result.bookmarked ? "ブックマークに追加しました" : "ブックマークを解除しました");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "エラーが発生しました");
      }
    });
  };

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
      aria-pressed={bookmarked}
    >
      <Bookmark className={bookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
      {bookmarked ? "ブックマーク済み" : "ブックマーク"}
    </Button>
  );
}
