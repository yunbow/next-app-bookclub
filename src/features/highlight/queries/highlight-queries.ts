import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createHighlightAction,
  updateHighlightAction,
  deleteHighlightAction,
} from "../server/highlight-actions";
import type { CreateHighlightInput, UpdateHighlightInput } from "../schema/highlight-schema";

export const highlightKeys = {
  all: ["highlights"] as const,
  lists: () => [...highlightKeys.all, "list"] as const,
  byBook: (bookId: string) => [...highlightKeys.lists(), bookId] as const,
  detail: (id: string) => [...highlightKeys.all, "detail", id] as const,
};

export function useHighlights(bookId: string) {
  return useQuery({
    queryKey: highlightKeys.byBook(bookId),
    queryFn: async () => {
      const res = await fetch(`/api/highlights?bookId=${bookId}`);
      if (!res.ok) throw new Error("Failed to fetch highlights");
      return res.json();
    },
    enabled: !!bookId,
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateHighlightInput) => {
      const result = await createHighlightAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: highlightKeys.byBook(variables.bookId) });
    },
  });
}

export function useUpdateHighlight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateHighlightInput }) => {
      const result = await updateHighlightAction(id, data);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: highlightKeys.lists() });
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteHighlightAction(id);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: highlightKeys.lists() });
    },
  });
}
