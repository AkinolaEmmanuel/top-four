import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFixtureAvailability,
  fetchOwnPredictions,
  fetchSelectablePlayers,
  fetchFixtureResults,
  submitPrediction,
  submitLineupPrediction,
  copyFixturePredictions,
  StandardAnswerValue,
} from '@/lib/api/predictions-fixture';

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

  const selectablePlayersQuery = useQuery({
    queryKey: ['selectable-players', leagueId, fixtureId],
    queryFn: () => fetchSelectablePlayers(leagueId, fixtureId),
    enabled: !!leagueId && !!fixtureId,
  });

  const resultsQuery = useQuery({
    queryKey: ['fixture-results', leagueId, fixtureId],
    queryFn: () => fetchFixtureResults(leagueId, fixtureId),
    enabled: !!leagueId && !!fixtureId,
  });

  return {
    availability: availabilityQuery.data,
    predictions: predictionsQuery.data,
    selectablePlayers: selectablePlayersQuery.data,
    results: resultsQuery.data,
    isLoading: availabilityQuery.isLoading || predictionsQuery.isLoading,
    isError: availabilityQuery.isError || predictionsQuery.isError,
    refetch: () => {
      availabilityQuery.refetch();
      predictionsQuery.refetch();
      selectablePlayersQuery.refetch();
      resultsQuery.refetch();
    }
  };
}

export function useSubmitPrediction(leagueId: string, fixtureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ marketType, expectedVersion, answer }: { marketType: string, expectedVersion: number, answer: StandardAnswerValue }) =>
      submitPrediction(leagueId, fixtureId, marketType, expectedVersion, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixture-predictions', leagueId, fixtureId] });
      queryClient.invalidateQueries({ queryKey: ['prediction-tasks'] });
    }
  });
}

export function useSubmitLineupPrediction(leagueId: string, fixtureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ side, expectedVersion, playerIds, snapshotId }: { side: 'home' | 'away', expectedVersion: number, playerIds: string[], snapshotId: string }) =>
      submitLineupPrediction(leagueId, fixtureId, side, expectedVersion, playerIds, snapshotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixture-predictions', leagueId, fixtureId] });
      queryClient.invalidateQueries({ queryKey: ['prediction-tasks'] });
    }
  });
}

export function useCopyPredictions(leagueId: string, fixtureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => copyFixturePredictions(leagueId, fixtureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-tasks'] });
    }
  });
}
