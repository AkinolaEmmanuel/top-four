import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFixtureAvailability, fetchOwnPredictions, submitPrediction, submitLineupPrediction } from '@/lib/api/predictions-fixture';

export function useFixtureData(leagueId: string, fixtureId: string) {
  const availabilityQuery = useQuery({
    queryKey: ['fixture-availability', leagueId, fixtureId],
    queryFn: () => fetchFixtureAvailability(leagueId, fixtureId),
    enabled: !!leagueId && !!fixtureId,
  });

  const predictionsQuery = useQuery({
    queryKey: ['fixture-predictions', leagueId, fixtureId],
    queryFn: () => fetchOwnPredictions(leagueId, fixtureId),
    enabled: !!leagueId && !!fixtureId,
  });

  return {
    availability: availabilityQuery.data,
    predictions: predictionsQuery.data,
    isLoading: availabilityQuery.isLoading || predictionsQuery.isLoading,
    isError: availabilityQuery.isError || predictionsQuery.isError,
    refetch: () => {
      availabilityQuery.refetch();
      predictionsQuery.refetch();
    }
  };
}

export function useSubmitPrediction(leagueId: string, fixtureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ marketType, expectedVersion, answer }: { marketType: string, expectedVersion: number, answer: any }) => 
      submitPrediction(leagueId, fixtureId, marketType, expectedVersion, answer),
    onSuccess: (data, variables) => {
      // Invalidate predictions so they are re-fetched with the new version hashes
      queryClient.invalidateQueries({ queryKey: ['fixture-predictions', leagueId, fixtureId] });
      queryClient.invalidateQueries({ queryKey: ['prediction-tasks'] });
    }
  });
}

export function useSubmitLineupPrediction(leagueId: string, fixtureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ side, expectedVersion, lineup }: { side: 'home' | 'away', expectedVersion: number, lineup: string[] }) => 
      submitLineupPrediction(leagueId, fixtureId, side, expectedVersion, lineup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixture-predictions', leagueId, fixtureId] });
      queryClient.invalidateQueries({ queryKey: ['prediction-tasks'] });
    }
  });
}
