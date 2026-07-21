"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AwardCategory, AwardPick } from "@/types";

export const awardPicksQueryKey = (roomId: string) => ["award-picks", roomId] as const;

async function fetchAwardPicks(roomId: string): Promise<AwardPick[]> {
  const res = await fetch(`/api/rooms/${roomId}/awards`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Failed to load award picks.");
  return data.picks;
}

export function useAwardPicks(roomId: string) {
  return useQuery<AwardPick[], Error>({
    queryKey: awardPicksQueryKey(roomId),
    queryFn: () => fetchAwardPicks(roomId),
  });
}

export function useSubmitAwardPick(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { award: AwardCategory; playerName: string }) => {
      const res = await fetch(`/api/rooms/${roomId}/awards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit pick.");
      return data.pick as AwardPick;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: awardPicksQueryKey(roomId) });
    },
  });
}
