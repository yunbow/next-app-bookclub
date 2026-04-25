import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGoalAction,
  updateGoalAction,
  deleteGoalAction,
} from "../server/goal-actions";
import type { CreateGoalInput, UpdateGoalInput } from "../schema/goal-schema";

export const goalKeys = {
  all: ["goals"] as const,
  lists: () => [...goalKeys.all, "list"] as const,
  detail: (id: string) => [...goalKeys.all, "detail", id] as const,
};

export function useGoals() {
  return useQuery({
    queryKey: goalKeys.lists(),
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateGoalInput) => {
      const result = await createGoalAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGoalInput }) => {
      const result = await updateGoalAction(id, data);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteGoalAction(id);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}
