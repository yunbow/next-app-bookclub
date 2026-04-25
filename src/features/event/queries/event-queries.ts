import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  participateEventAction,
  cancelParticipationAction,
  createEventReportAction,
} from "../server/event-actions";
import type {
  CreateEventInput,
  UpdateEventInput,
  ParticipateEventInput,
  CreateEventReportInput,
} from "../schema/event-schema";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  participants: (eventId: string) => [...eventKeys.detail(eventId), "participants"] as const,
};

export function useEvents(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: eventKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useEventParticipants(eventId: string) {
  return useQuery({
    queryKey: eventKeys.participants(eventId),
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/participants`);
      if (!res.ok) throw new Error("Failed to fetch participants");
      return res.json();
    },
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const result = await createEventAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventInput }) => {
      const result = await updateEventAction(id, data);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEventAction(id);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useParticipateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ParticipateEventInput) => {
      const result = await participateEventAction(data);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.participants(variables.eventId) });
    },
  });
}

export function useCancelParticipation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const result = await cancelParticipationAction(eventId);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
    },
  });
}

export function useCreateEventReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEventReportInput) => {
      const result = await createEventReportAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
    },
  });
}
