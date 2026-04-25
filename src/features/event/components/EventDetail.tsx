"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useParticipateEvent, useCancelParticipation } from "../queries/event-queries";
import { toast } from "sonner";

interface EventDetailProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    date: Date;
    location: string | null;
    isOnline: boolean;
    capacity: number | null;
    requiresApproval: boolean;
    theme: string | null;
    organizer: {
      id: string;
      name: string | null;
      image: string | null;
    };
    participants: Array<{
      id: string;
      status: string;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
    reports: Array<{
      id: string;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
    _count: {
      participants: number;
    };
  };
  currentUserId: string;
}

export function EventDetail({ event, currentUserId }: EventDetailProps) {
  const participateEvent = useParticipateEvent();
  const cancelParticipation = useCancelParticipation();

  const userParticipation = event.participants.find((p) => p.user.id === currentUserId);
  const isFull = event.capacity && event._count.participants >= event.capacity;
  const isOrganizer = event.organizer.id === currentUserId;

  const handleParticipate = async () => {
    try {
      await participateEvent.mutateAsync({ eventId: event.id });
      toast.success(event.requiresApproval ? "参加申請を送信しました" : "参加登録しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelParticipation.mutateAsync(event.id);
      toast.success("参加をキャンセルしました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-4">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={event.isOnline ? "default" : "secondary"}>
                  {event.isOnline ? "オンライン" : "オフライン"}
                </Badge>
                {event.requiresApproval && (
                  <Badge variant="outline">承認制</Badge>
                )}
                {isFull && (
                  <Badge variant="destructive">満員</Badge>
                )}
                {isOrganizer && (
                  <Badge>主催者</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {event.organizer.image ? (
              <img
                src={event.organizer.image}
                alt={event.organizer.name || "Organizer"}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span>{event.organizer.name?.[0] || "O"}</span>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">主催者</p>
              <p className="font-semibold">{event.organizer.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">説明</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">開催日時</h3>
              <p className="text-sm">
                {format(new Date(event.date), "yyyy年M月d日(E) HH:mm")}
              </p>
            </div>

            {event.location && (
              <div>
                <h3 className="font-semibold mb-2">{event.isOnline ? "オンラインURL" : "開催場所"}</h3>
                <p className="text-sm">{event.location}</p>
              </div>
            )}

            {event.theme && (
              <div>
                <h3 className="font-semibold mb-2">テーマ</h3>
                <p className="text-sm">{event.theme}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">参加者</h3>
              <p className="text-sm">
                {event._count.participants}人
                {event.capacity && ` / ${event.capacity}人`}
              </p>
            </div>
          </div>

          {!isOrganizer && (
            <div className="pt-4">
              {userParticipation ? (
                <div className="flex items-center gap-3">
                  <Badge>
                    {userParticipation.status === "approved" ? "参加予定" : "承認待ち"}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={!!cancelParticipation.isPending}
                  >
                    参加をキャンセル
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleParticipate}
                  disabled={!!(participateEvent.isPending || isFull)}
                >
                  {isFull ? "満員" : event.requiresApproval ? "参加申請" : "参加する"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {event.participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>参加者 ({event.participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.participants
                .filter((p) => p.status === "approved")
                .map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    {participant.user.image ? (
                      <img
                        src={participant.user.image}
                        alt={participant.user.name || "User"}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span>{participant.user.name?.[0] || "U"}</span>
                      </div>
                    )}
                    <span className="font-medium">{participant.user.name}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>レポート</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {event.reports.map((report) => (
                <div key={report.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    {report.user.image ? (
                      <img
                        src={report.user.image}
                        alt={report.user.name || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        {report.user.name?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-sm">{report.user.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), "yyyy年M月d日")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{report.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
