'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';
import type { Api } from '@/lib/api/types';

/**
 * One market's immutable revisions, newest first.
 *
 * Fetched only when a member opens the trail: a fixture has eight markets and
 * almost nobody opens any of them, so reading all eight on every render would
 * be eight calls to answer a question that was not asked.
 */
export type PredictionHistory = Api<'PredictionHistoryDataDto'>;

export function usePredictionHistory(
  leagueId: string,
  fixtureId: string,
  marketType: string | null,
) {
  return useQuery<PredictionHistory, Error>({
    queryKey: ['prediction-history', leagueId, fixtureId, marketType],
    enabled: marketType !== null,
    queryFn: async () => {
      const response = await apiFetch<{ data: PredictionHistory }>(
        `/leagues/${leagueId}/fixtures/${fixtureId}/predictions/me/history?marketType=${encodeURIComponent(marketType ?? '')}`,
      );
      return response.data;
    },
  });
}
