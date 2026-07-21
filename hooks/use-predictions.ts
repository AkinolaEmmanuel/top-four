"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MarketType, Prediction, PredictionValue } from "@/types";
import { leaderboardQueryKey } from "@/hooks/use-leaderboard";

export const predictionsQueryKey = (roomId: string) => ["predictions", roomId] as const;

async function fetchPredictions(roomId: string): Promise<Prediction[]> {
  const res = await fetch(`/api/rooms/${roomId}/predictions`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Failed to load predictions.");
  return data.predictions;
}

export function usePredictions(roomId: string) {
  return useQuery<Prediction[], Error>({
    queryKey: predictionsQueryKey(roomId),
    queryFn: () => fetchPredictions(roomId),
  });
}

export function useSubmitPrediction(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { fixtureId: number; market: MarketType; value: PredictionValue }) => {
      const res = await fetch(`/api/rooms/${roomId}/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit prediction.");
      return data.prediction as Prediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: predictionsQueryKey(roomId) });
      queryClient.invalidateQueries({ queryKey: leaderboardQueryKey(roomId) });
    },
  });
}
