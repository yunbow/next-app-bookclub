import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBookAction,
  updateUserBookAction,
  deleteUserBookAction,
} from "../server/book-actions";
import type { CreateBookInput, UpdateUserBookInput } from "../schema/book-schema";

export const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  userBooks: (userId: string) => [...bookKeys.all, "user", userId] as const,
};

export function useBooks(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: bookKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      const res = await fetch(`/api/books?${params}`);
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) throw new Error("Failed to fetch book");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUserBooks(userId: string) {
  return useQuery({
    queryKey: bookKeys.userBooks(userId),
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/books`);
      if (!res.ok) throw new Error("Failed to fetch user books");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBookInput) => {
      const result = await createBookAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

export function useUpdateUserBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookId, data }: { bookId: string; data: UpdateUserBookInput }) => {
      const result = await updateUserBookAction(bookId, data);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

export function useDeleteUserBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId: string) => {
      const result = await deleteUserBookAction(bookId);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}
