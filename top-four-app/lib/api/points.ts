import { apiFetch } from './fetcher';
import type { Api } from './types';

export type StandingCompetitionPoints = Api<'StandingCompetitionPointsDto'>;
export type StandingMarketPoints = Api<'StandingMarketPointsDto'>;
export type StandingEntry = Api<'StandingEntryDto'>;
export type StandingsPage = Api<'StandingsPageDataDto'>;
export type OwnStanding = Api<'OwnStandingDataDto'>;

export async function fetchStandings(leagueId: string, page: number = 1, pageSize: number = 50): Promise<StandingsPage> {
  const response = await apiFetch<Api<'StandingsPageResponseDto'>>(`/leagues/${leagueId}/standings?page=${page}&pageSize=${pageSize}`);
  return response.data;
}

export async function fetchOwnStanding(leagueId: string): Promise<OwnStanding> {
  const response = await apiFetch<Api<'OwnStandingResponseDto'>>(`/leagues/${leagueId}/standings/me`);
  return response.data;
}

export interface PointsHistoryItem {
  pointsEntryId: string;
  delta: number;
  kind: string;
  reason: string;
  occurredAt: string;
  sourceKind: 'fixture' | 'custom_question';
  leagueFixtureId: string | null;
  customQuestionId: string | null;
  marketType: string | null;
  side: string | null;
}

export interface PointsHistoryPage {
  data: PointsHistoryItem[];
  nextCursor: string | null;
}

export async function fetchOwnPointsHistory(leagueId: string, limit: number = 40): Promise<PointsHistoryPage> {
  return apiFetch<PointsHistoryPage>(`/leagues/${leagueId}/standings/me/history?limit=${limit}`);
}
