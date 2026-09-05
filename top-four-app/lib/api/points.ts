import { apiFetch } from './fetcher';

export interface StandingCompetitionPoints {
  supportedCompetitionId: string;
  points: number;
}

export interface StandingMarketPoints {
  marketType: string;
  points: number;
}

export interface StandingEntry {
  position: number;
  membershipId: string;
  displayName: string;
  totalPoints: number;
  counters: Record<string, number>;
  competitionPoints: StandingCompetitionPoints[];
  customQuestionPoints: number;
}

export interface StandingsPage {
  page: number;
  pageSize: number;
  totalActiveMembers: number;
  standingVersion: number;
  entries: StandingEntry[];
}

export interface OwnStanding {
  standingVersion: number;
  position: number;
  membershipId: string;
  totalPoints: number;
  counters: Record<string, number>;
  competitionPoints: StandingCompetitionPoints[];
  marketPoints: StandingMarketPoints[];
  customQuestionPoints: number;
}

export async function fetchStandings(leagueId: string, page: number = 1, pageSize: number = 50): Promise<StandingsPage> {
  const response = await apiFetch<{ data: StandingsPage }>(`/leagues/${leagueId}/standings?page=${page}&pageSize=${pageSize}`);
  return response.data;
}

export async function fetchOwnStanding(leagueId: string): Promise<OwnStanding> {
  const response = await apiFetch<{ data: OwnStanding }>(`/leagues/${leagueId}/standings/me`);
  return response.data;
}
