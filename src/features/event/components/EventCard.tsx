"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    date: Date;
    location: string | null;
    isOnline: boolean;
    capacity: number | null;
    requiresApproval: boolean;
    _count: {
      participants: number;
    };
  };
}

export function EventCard({ event }: EventCardProps) {
  const isFull = event.capacity && event._count.participants >= event.capacity;
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-2 mb-2">{event.title}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant={event.isOnline ? "default" : "secondary"}>
                  {event.isOnline ? "オンライン" : "オフライン"}
                </Badge>
                {event.requiresApproval && (
                  <Badge variant="outline">承認制</Badge>
                )}
                {isFull && (
                  <Badge variant="destructive">満員</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.description}
            </p>
          )}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{format(new Date(event.date), "yyyy年M月d日(E) HH:mm")}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="truncate">{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>
                {event._count.participants}人参加
                {event.capacity && ` / ${event.capacity}人`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
