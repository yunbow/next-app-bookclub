import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startSessionAction,
  endSessionAction,
  getActiveSessionAction,
} from "../server/session-actions";
import type { StartSessionInput, EndSessionInput } from "../schema/session-schema";

export const sessionKeys = {
  all: ["sessions"] as const,
  active: () => [...sessionKeys.all, "active"] as const,
  stats: () => [...sessionKeys.all, "stats"] as const,
};

export function useActiveSession() {
  return useQuery({
    queryKey: sessionKeys.active(),
    queryFn: async () => {
      const result = await getActiveSessionAction();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    refetchInterval: 1000, // Refetch every second for timer
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: StartSessionInput) => {
      const result = await startSessionAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.active() });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EndSessionInput) => {
      const result = await endSessionAction(data);
      if (!result.success) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
}
