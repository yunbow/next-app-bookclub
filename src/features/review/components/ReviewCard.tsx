"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: {
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
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={`/reviews/${review.id}`}>
        <CardHeader>
          <div className="flex items-start gap-3">
            {review.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.user.image}
                alt={review.user.name || "User"}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm">{review.user.name?.[0] || "U"}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{review.user.name}</span>
                <span className="text-yellow-500">{"⭐".repeat(review.rating || 0)}</span>
              </div>
              <div
                className="text-sm text-muted-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {review.book.title}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3 mb-3">{review.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </span>
            <div className="flex gap-3">
              <span>👍 {review._count.reactions}</span>
              <span>💬 {review._count.comments}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
