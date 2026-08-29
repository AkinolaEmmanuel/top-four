import { apiFetch } from './fetcher';

export interface CatalogueCompetition {
  id: string;
  displayName: string;
  slug: string;
  kind: string;
  countryCode?: string;
  logoUrl?: string;
}

export interface CatalogueSeason {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  selectableForNewLeague?: boolean;
}

export interface CatalogueTeam {
  id: string;
  displayName: string;
  shortName?: string | null;
  code?: string | null;
  logoUrl?: string | null;
}

export async function fetchCatalogueCompetitions(): Promise<CatalogueCompetition[]> {
  return apiFetch<CatalogueCompetition[]>('/football/catalogue/competitions');
}

export async function fetchCompetitionSeasons(competitionId: string): Promise<CatalogueSeason[]> {
  return apiFetch<CatalogueSeason[]>(`/football/catalogue/competitions/${competitionId}/seasons`);
}

export async function fetchSeasonTeams(seasonId: string): Promise<CatalogueTeam[]> {
  return apiFetch<CatalogueTeam[]>(`/football/catalogue/seasons/${seasonId}/teams`);
}
