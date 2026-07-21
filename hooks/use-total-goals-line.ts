"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TotalGoalsLine } from "@/types";

export const totalGoalsLinesQueryKey = (roomId: string) => ["total-goals-lines", roomId] as const;

async function fetchTotalGoalsLines(roomId: string): Promise<TotalGoalsLine[]> {
  const res = await fetch(`/api/rooms/${roomId}/total-goals-line`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Failed to load total-goals lines.");
  return data.lines;
}

export function useTotalGoalsLines(roomId: string) {
  return useQuery<TotalGoalsLine[], Error>({
    queryKey: totalGoalsLinesQueryKey(roomId),
    queryFn: () => fetchTotalGoalsLines(roomId),
  });
}

export function useSetTotalGoalsLine(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { fixtureId: number; line: number }) => {
      const res = await fetch(`/api/rooms/${roomId}/total-goals-line`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to set line.");
      return data.line as TotalGoalsLine;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: totalGoalsLinesQueryKey(roomId) }),
  });
}
