"use client";

import { EventCard } from "./EventCard";

interface EventListProps {
  events: Array<{
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
  }>;
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">イベントが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
