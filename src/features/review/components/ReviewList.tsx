"use client";

import { ReviewCard } from "./ReviewCard";

interface ReviewListProps {
  reviews: Array<{
    id: string;
    content: string;
    rating: number | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    book: {
      id: string;
      title: string;
      coverImage: string | null;
    };
    _count: {
      comments: number;
      reactions: number;
    };
  }>;
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">レビューが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
