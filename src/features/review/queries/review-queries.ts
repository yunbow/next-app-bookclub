import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  createReviewCommentAction,
  toggleReviewReactionAction,
} from "../server/review-actions";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  CreateReviewCommentInput,
  CreateReviewReactionInput,
} from "../schema/review-schema";

export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  comments: (reviewId: string) => [...reviewKeys.detail(reviewId), "comments"] as const,
};

export function useReviews(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: reviewKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      const res = await fetch(`/api/reviews?${params}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${id}`);
      if (!res.ok) throw new Error("Failed to fetch review");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useReviewComments(reviewId: string) {
  return useQuery({
    queryKey: reviewKeys.comments(reviewId),
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${reviewId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!reviewId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      const result = await createReviewAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewInput }) => {
      const result = await updateReviewAction(id, data);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteReviewAction(id);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

export function useCreateReviewComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateReviewCommentInput) => {
      const result = await createReviewCommentAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.comments(variables.reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.reviewId) });
    },
  });
}

export function useToggleReviewReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateReviewReactionInput) => {
      const result = await toggleReviewReactionAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}
