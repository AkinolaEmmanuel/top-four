import { useQuery } from '@tanstack/react-query';
import {
  fetchFixtureSquads,
  fetchFixtureDetails,
  fetchCopyTargets,
  FixtureSquadsResponse,
  FixtureDetail,
  CopyTargetsResponse,
} from '@/lib/api/fixtures';

export function useFixtureSquads(fixtureId: string) {
  return useQuery<FixtureSquadsResponse, Error>({
    queryKey: ['fixture-squads', fixtureId],
    queryFn: () => fetchFixtureSquads(fixtureId),
    enabled: !!fixtureId,
  });
}

export function useFixtureDetails(fixtureId: string) {
  return useQuery<FixtureDetail, Error>({
    queryKey: ['fixture-details', fixtureId],
    queryFn: () => fetchFixtureDetails(fixtureId),
    enabled: !!fixtureId,
  });
}

export function useCopyTargets(leagueId: string, fixtureId: string) {
  return useQuery<CopyTargetsResponse, Error>({
    queryKey: ['copy-targets', leagueId, fixtureId],
    queryFn: () => fetchCopyTargets(leagueId, fixtureId),
    enabled: !!leagueId && !!fixtureId,
  });
}
