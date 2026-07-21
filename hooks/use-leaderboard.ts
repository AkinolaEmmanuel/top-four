"use client";

import { useQuery } from "@tanstack/react-query";
import type { LeaderboardRow } from "@/lib/predictions/scoring";

export const leaderboardQueryKey = (roomId: string) => ["leaderboard", roomId] as const;

async function fetchLeaderboard(roomId: string): Promise<LeaderboardRow[]> {
  const res = await fetch(`/api/rooms/${roomId}/leaderboard`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Failed to load leaderboard.");
  return data.leaderboard;
}

export function useLeaderboard(roomId: string) {
  return useQuery<LeaderboardRow[], Error>({
    queryKey: leaderboardQueryKey(roomId),
    queryFn: () => fetchLeaderboard(roomId),
    staleTime: 30 * 1000,
  });
}
