import { apiFetch } from './fetcher';
import type { Api } from './types';

/**
 * The football catalogue: competitions, their seasons, and a season's squads.
 *
 * UNTYPED UPSTREAM: these DTOs declare their nullable strings with
 * `@ApiProperty({ nullable: true })` and no `type: String`, so the document
 * carries no type and the generated field is `Record<string, never> | null` —
 * a type that permits no value at all. The overlays below restore the string
 * the wire actually carries; delete each one as the backend adds `type: String`.
 */

export type CatalogueCompetition = Omit<Api<'CatalogueCompetitionDto'>, 'logoUrl'> & {
  logoUrl: string | null;
};

export type CatalogueSeason = Api<'CatalogueSeasonDto'>;

export type CatalogueTeam = Omit<Api<'CatalogueTeamDto'>, 'shortName' | 'code' | 'logoUrl'> & {
  shortName: string | null;
  code: string | null;
  logoUrl: string | null;
};

export async function fetchCatalogueCompetitions(): Promise<CatalogueCompetition[]> {
  return apiFetch<CatalogueCompetition[]>('/football/catalogue/competitions');
}

export async function fetchCompetitionSeasons(competitionId: string): Promise<CatalogueSeason[]> {
  return apiFetch<CatalogueSeason[]>(`/football/catalogue/competitions/${competitionId}/seasons`);
}

export async function fetchSeasonTeams(seasonId: string): Promise<CatalogueTeam[]> {
  return apiFetch<CatalogueTeam[]>(`/football/catalogue/seasons/${seasonId}/teams`);
}
