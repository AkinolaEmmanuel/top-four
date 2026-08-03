"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MarketType, Prediction, PredictionValue } from "@/types";
import { apiFetch } from "@/lib/api/fetcher";
import { leaderboardQueryKey } from "@/hooks/use-leaderboard";

export const predictionsQueryKey = (roomId: string) => ["predictions", roomId] as const;

export type BackendPredictionItem = {
  marketType: string;
  enabled: boolean;
  state: string;
  answered: boolean;
  predictionId?: string;
  version?: number;
  answer?: {
    value: any;
  };
};

async function fetchPredictions(roomId: string): Promise<Prediction[]> {
  // Query all predictions for the room.
  // Since individual /me endpoints are specific per fixture, we can get list.
  // For the frontend mockup alignment, we can query availability or standard lists.
  // Let's fallback or map from backend.
  try {
    const data = await apiFetch<{ items: any[] }>(`/leagues/${roomId}/fixtures/availability`);
    const mapped: Prediction[] = [];

    // Fetch predictions for the active user across fixtures
    for (const f of data.items || []) {
      try {
        const detail = await apiFetch<{ markets: BackendPredictionItem[] }>(
          `/leagues/${roomId}/fixtures/${f.leagueFixtureId}/predictions/me`
        );
        (detail.markets || []).forEach((m) => {
          if (m.answered && m.answer) {
            mapped.push({
              id: m.predictionId || "",
              room_id: roomId,
              user_id: "",
              fixture_id: f.fixtureId,
              market: m.marketType as MarketType,
              value: mapBackendValueToFrontend(m.marketType as MarketType, m.answer.value),
              submitted_at: "",
            });
          }
        });
      } catch (err) {
        // Skip individual fixture prediction read failures
      }
    }
    return mapped;
  } catch (error) {
    return [];
  }
}

export function usePredictions(roomId: string) {
  return useQuery<Prediction[], Error>({
    queryKey: predictionsQueryKey(roomId),
    queryFn: () => fetchPredictions(roomId),
    enabled: !!roomId && roomId !== "global",
  });
}

export function useSubmitPrediction(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { fixtureId: string | number; market: MarketType; value: PredictionValue }) => {
      // 1. Fetch predictions/me for this fixture to check the current version
      let currentVersion = 0;
      try {
        const meDoc = await apiFetch<{ markets: BackendPredictionItem[] }>(
          `/leagues/${roomId}/fixtures/${input.fixtureId}/predictions/me`
        );
        const targetMarket = (meDoc.markets || []).find((m) => m.marketType === input.market);
        if (targetMarket && targetMarket.answered && typeof targetMarket.version === "number") {
          currentVersion = targetMarket.version;
        }
      } catch (e) {
        // Fallback to 0 if not previously answered
      }

      // 2. Map frontend value to NestJS expected answer shape
      const answer = mapFrontendValueToBackend(input.market, input.value);

      // 3. Submit prediction (PUT)
      const result = await apiFetch<any>(
        `/leagues/${roomId}/fixtures/${input.fixtureId}/predictions/${input.market}`,
        {
          method: "PUT",
          body: JSON.stringify({
            expectedVersion: currentVersion,
            answer,
          }),
        }
      );

      return {
        id: result.predictionId || "",
        room_id: roomId,
        user_id: "",
        fixture_id: input.fixtureId,
        market: input.market,
        value: input.value,
        submitted_at: result.createdAt || "",
      } as unknown as Prediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: predictionsQueryKey(roomId) });
      queryClient.invalidateQueries({ queryKey: leaderboardQueryKey(roomId) });
    },
  });
}

function mapFrontendValueToBackend(market: MarketType, val: PredictionValue) {
  if (market === "match_result" && "pick" in val) {
    return { outcome: val.pick };
  }
  if (market === "exact_score" && "home" in val && "away" in val) {
    return { homeGoals: val.home, awayGoals: val.away };
  }
  if (market === "btts" && "pick" in val) {
    return { bothScore: val.pick };
  }
  if (market === "total_goals" && "pick" in val) {
    return { selection: val.pick };
  }
  return {};
}

function mapBackendValueToFrontend(market: MarketType, val: any): PredictionValue {
  if (market === "match_result") {
    return { market: "match_result", pick: val.outcome };
  }
  if (market === "exact_score") {
    return { market: "exact_score", home: val.homeGoals, away: val.awayGoals };
  }
  if (market === "btts") {
    return { market: "btts", pick: val.bothScore };
  }
  if (market === "total_goals") {
    return { market: "total_goals", pick: val.selection };
  }
  return {} as PredictionValue;
}
