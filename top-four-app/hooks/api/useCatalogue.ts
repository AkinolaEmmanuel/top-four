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
