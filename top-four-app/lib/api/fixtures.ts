import { apiFetch } from './fetcher';

export interface FixtureTeam {
  id: string;
  displayName: string;
  code: string;
}

export interface FixturePlayer {
  id: string;
  displayName: string;
  shirtNumber: string | null;
  position: string | null;
}

export interface FixtureSquad {
  team: FixtureTeam;
  players: FixturePlayer[];
}

export interface FixtureSquadsResponse {
  fixtureId: string;
  homeSquad: FixtureSquad;
  awaySquad: FixtureSquad;
}

export interface FixtureDetail {
  id: string;
  homeTeam: FixtureTeam;
  awayTeam: FixtureTeam;
  kickoffAt: string | null;
  status: 'upcoming' | 'live' | 'finished' | 'voided';
  score?: { home: number; away: number };
  competition: { id: string; slug: string; displayName: string };
}

export interface CopyTarget {
  leagueId: string;
  leagueName: string;
  note: string;
  canCopy: boolean;
  incompatibleMarkets: string[];
  closed: boolean;
}

export interface CopyTargetsResponse {
  targets: CopyTarget[];
}

export interface CopyResult {
  leagueId: string;
  leagueName: string;
  copied: number;
  skipped: string[];
  note: string;
  status: 'ok' | 'warn' | 'skipped';
}

export interface CopyResultsResponse {
  results: CopyResult[];
}

export async function fetchFixtureSquads(fixtureId: string): Promise<FixtureSquadsResponse> {
  return apiFetch<FixtureSquadsResponse>(`/fixtures/${fixtureId}/squads`);
}

export async function fetchFixtureDetails(fixtureId: string): Promise<FixtureDetail> {
  return apiFetch<FixtureDetail>(`/fixtures/${fixtureId}`);
}

export async function fetchCopyTargets(leagueId: string, fixtureId: string): Promise<CopyTargetsResponse> {
  return apiFetch<CopyTargetsResponse>(`/leagues/${leagueId}/fixtures/${fixtureId}/copy-targets`);
}

export async function executeCopy(leagueId: string, fixtureId: string, targetLeagueIds: string[]): Promise<CopyResultsResponse> {
  return apiFetch<CopyResultsResponse>(`/leagues/${leagueId}/fixtures/${fixtureId}/copy`, {
    method: 'POST',
    body: JSON.stringify({ targetLeagueIds }),
  });
}
