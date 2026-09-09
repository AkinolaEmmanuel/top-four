import { useQuery } from '@tanstack/react-query';
import {
  fetchCatalogueCompetitions,
  fetchCompetitionSeasons,
  fetchSeasonTeams,
  CatalogueCompetition,
  CatalogueSeason,
  CatalogueTeam
} from '@/lib/api/catalogue';

export function useCatalogueCompetitions() {
  return useQuery<CatalogueCompetition[]>({
    queryKey: ['catalogue', 'competitions'],
    queryFn: fetchCatalogueCompetitions,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useCompetitionSeasons(competitionId?: string) {
  return useQuery<CatalogueSeason[]>({
    queryKey: ['catalogue', 'competitions', competitionId, 'seasons'],
    queryFn: () => (competitionId ? fetchCompetitionSeasons(competitionId) : Promise.resolve([])),
    enabled: !!competitionId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSeasonTeams(seasonId?: string) {
  return useQuery<CatalogueTeam[]>({
    queryKey: ['catalogue', 'seasons', seasonId, 'teams'],
    queryFn: () => (seasonId ? fetchSeasonTeams(seasonId) : Promise.resolve([])),
    enabled: !!seasonId,
    staleTime: 1000 * 60 * 30,
  });
}

// Some endpoints (e.g. /me/prediction-tasks) only ever return a team's id and
// display name, never its code or crest -- unlike fixture-availability,
// which carries both. Resolve real crests for those teams by walking each
// competition to its current season's squad and matching on team id.
export function useTeamCrestMap(competitionIds: string[]) {
  const uniqueIds = Array.from(new Set(competitionIds.filter(Boolean))).sort();
  return useQuery<Record<string, CatalogueTeam>>({
    queryKey: ['catalogue', 'team-crests', uniqueIds],
    queryFn: async () => {
      const teamLists = await Promise.all(uniqueIds.map(async (competitionId) => {
        const seasons = await fetchCompetitionSeasons(competitionId).catch(() => []);
        const season = seasons.find((s) => s.selectableForNewLeague) || seasons[0];
        if (!season) return [];
        return fetchSeasonTeams(season.id).catch(() => []);
      }));
      const map: Record<string, CatalogueTeam> = {};
      teamLists.flat().forEach((team) => { map[team.id] = team; });
      return map;
    },
    enabled: uniqueIds.length > 0,
    staleTime: 1000 * 60 * 30,
  });
}
