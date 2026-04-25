"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { followUserAction, unfollowUserAction } from "../server/social-actions";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

export function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = following
        ? await unfollowUserAction(userId)
        : await followUserAction(userId);

      if (result.success) {
        setFollowing(result.data.following);
        toast.success(result.data.following ? "フォローしました" : "フォローを解除しました");
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={following ? "フォロー解除" : "フォローする"}
      aria-pressed={following}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          フォロー中
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          フォロー
        </>
      )}
    </Button>
  );
}
