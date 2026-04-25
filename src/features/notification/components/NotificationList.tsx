"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../server/notification-actions";
import { toast } from "sonner";

type NotificationItem = {
  id: string;
  type: string;
  read: boolean;
  resourceId: string | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

interface NotificationListProps {
  initialNotifications: NotificationItem[];
}

const typeLabels: Record<string, string> = {
  follow: "さんがあなたをフォローしました",
  review_comment: "さんがあなたのレビューにコメントしました",
  review_reaction: "さんがあなたのレビューにリアクションしました",
  event_invite: "さんからイベントの招待があります",
  level_up: "レベルが上がりました",
  badge_earned: "バッジを獲得しました",
  challenge_completed: "チャレンジを達成しました",
};

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      try {
        await markNotificationAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "エラーが発生しました");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      try {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("すべての通知を既読にしました");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "エラーが発生しました");
      }
    });
  };

  if (notifications.length === 0) {
    return (
      <p className="text-center py-12 text-muted-foreground">
        通知はまだありません
      </p>
    );
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-2">
      {hasUnread && (
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={isPending}>
            すべて既読にする
          </Button>
        </div>
      )}
      <ul className="divide-y rounded-md border">
        {notifications.map((notification) => {
          const actorName = notification.actor.name || "ユーザー";
          const label = typeLabels[notification.type] || "通知があります";
          const showActorPrefix = !["level_up", "badge_earned", "challenge_completed"].includes(
            notification.type
          );
          return (
            <li
              key={notification.id}
              className={`flex items-start gap-3 p-4 ${
                notification.read ? "" : "bg-accent/40"
              }`}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={notification.actor.image || undefined} />
                <AvatarFallback>{actorName[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {showActorPrefix && <span className="font-medium">{actorName}</span>}
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ja })}
                </p>
              </div>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={isPending}
                >
                  既読
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
