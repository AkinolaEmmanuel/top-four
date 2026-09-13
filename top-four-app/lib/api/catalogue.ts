import { apiFetch } from './fetcher';
import type { Api } from './types';

/**
 * The football catalogue: competitions, their seasons, and a season's squads.
 *
 * The server's own types. These carried overlays while the DTOs declared their
 * nullable strings with `@ApiProperty({ nullable: true })` and no `type: String`
 * — the document then described a field that permitted no value at all. The
 * backend added the types, so the overlays are gone.
 */

export type CatalogueCompetition = Api<'CatalogueCompetitionDto'>;
export type CatalogueSeason = Api<'CatalogueSeasonDto'>;
export type CatalogueTeam = Api<'CatalogueTeamDto'>;

export async function fetchCatalogueCompetitions(): Promise<CatalogueCompetition[]> {
  return apiFetch<CatalogueCompetition[]>('/football/catalogue/competitions');
}

export async function fetchCompetitionSeasons(competitionId: string): Promise<CatalogueSeason[]> {
  return apiFetch<CatalogueSeason[]>(`/football/catalogue/competitions/${competitionId}/seasons`);
}

export async function fetchSeasonTeams(seasonId: string): Promise<CatalogueTeam[]> {
  return apiFetch<CatalogueTeam[]>(`/football/catalogue/seasons/${seasonId}/teams`);
}
