"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToggleReviewReaction } from "../queries/review-queries";
import { toast } from "sonner";

interface ReviewDetailProps {
  review: {
    id: string;
    content: string;
    rating: number | null;
    visibility: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    book: {
      id: string;
      title: string;
      author: string | null;
      coverImage: string | null;
    };
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
    reactions: Array<{
      id: string;
      type: string;
      user: {
        id: string;
        name: string | null;
      };
    }>;
    _count: {
      comments: number;
      reactions: number;
    };
  };
  currentUserId: string;
}

const reactionTypes = [
  { type: "like", emoji: "👍", label: "いいね" },
  { type: "clap", emoji: "👏", label: "拍手" },
  { type: "sad", emoji: "😢", label: "悲しい" },
  { type: "surprise", emoji: "😮", label: "驚き" },
];

export function ReviewDetail({ review, currentUserId }: ReviewDetailProps) {
  const toggleReaction = useToggleReviewReaction();

  const handleReaction = async (type: string) => {
    try {
      await toggleReaction.mutateAsync({
        reviewId: review.id,
        type: type as "like" | "clap" | "sad" | "surprise",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const userReactions = review.reactions.filter((r) => r.user.id === currentUserId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4 mb-4">
            {review.user.image ? (
              <img
                src={review.user.image}
                alt={review.user.name || "User"}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <span>{review.user.name?.[0] || "U"}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{review.user.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">{"⭐".repeat(review.rating || 0)}</span>
                {review.visibility !== "public" && <Badge variant="outline">非公開</Badge>}
              </div>
            </div>
          </div>

          <Link href={`/books/${review.book.id}`} className="flex items-center gap-3 hover:bg-muted p-3 rounded">
            {review.book.coverImage && (
              <img
                src={review.book.coverImage}
                alt={review.book.title}
                className="h-20 w-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold">{review.book.title}</h3>
              {review.book.author && (
                <p className="text-sm text-muted-foreground">{review.book.author}</p>
              )}
            </div>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none mb-6">
            <p className="whitespace-pre-wrap">{review.content}</p>
          </div>

          <div className="flex gap-2 mb-4">
            {reactionTypes.map((reaction) => {
              const count = review.reactions.filter((r) => r.type === reaction.type).length;
              const hasReacted = userReactions.some((r) => r.type === reaction.type);
              return (
                <Button
                  key={reaction.type}
                  variant={hasReacted ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleReaction(reaction.type)}
                  disabled={toggleReaction.isPending}
                >
                  {reaction.emoji} {count > 0 && count}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {review.comments.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">コメント ({review.comments.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {review.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {comment.user.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                      {comment.user.name?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
