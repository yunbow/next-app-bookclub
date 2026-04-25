"use client";

import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface Activity {
  id: string;
  type: string;
  resourceId: string | null;
  metadata: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<string, string> = {
  reading_started: "📖",
  reading_completed: "✅",
  review_posted: "✍️",
  event_joined: "🎉",
};

const activityLabels: Record<string, string> = {
  reading_started: "読書を開始しました",
  reading_completed: "読書を完了しました",
  review_posted: "レビューを投稿しました",
  event_joined: "イベントに参加しました",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        まだ活動がありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
        const icon = activityIcons[activity.type] || "📌";
        const label = activityLabels[activity.type] || activity.type;

        return (
          <div
            key={activity.id}
            className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">
                  {activity.user.name || "ユーザー"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {label}
                </span>
              </div>
              {metadata.bookTitle && (
                <p className="text-sm text-muted-foreground mb-2">
                  📚 {metadata.bookTitle}
                </p>
              )}
              {metadata.reviewTitle && (
                <p className="text-sm text-muted-foreground mb-2">
                  {metadata.reviewTitle}
                </p>
              )}
              {metadata.eventTitle && (
                <p className="text-sm text-muted-foreground mb-2">
                  {metadata.eventTitle}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
