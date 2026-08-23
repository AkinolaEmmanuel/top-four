import { useQuery } from '@tanstack/react-query';
import { fetchStandings, StandingsPage } from '@/lib/api/points';

export function useStandings(leagueId: string) {
  return useQuery<StandingsPage, Error>({
    queryKey: ['standings', leagueId],
    queryFn: () => fetchStandings(leagueId),
    enabled: !!leagueId,
  });
}
