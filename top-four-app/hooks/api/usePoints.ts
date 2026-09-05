import { useQuery } from '@tanstack/react-query';
import { fetchStandings, fetchOwnStanding, StandingsPage, OwnStanding } from '@/lib/api/points';

export function useStandings(leagueId: string, page: number = 1, pageSize: number = 50) {
  return useQuery<StandingsPage, Error>({
    queryKey: ['standings', leagueId, page, pageSize],
    queryFn: () => fetchStandings(leagueId, page, pageSize),
    enabled: !!leagueId,
  });
}

export function useOwnStanding(leagueId: string) {
  return useQuery<OwnStanding, Error>({
    queryKey: ['own-standing', leagueId],
    queryFn: () => fetchOwnStanding(leagueId),
    enabled: !!leagueId,
  });
}
