import { apiFetch } from './fetcher';

export interface StandingsEntry {
  memberId: string;
  rank: number;
  points: number;
  trend: 'UP' | 'DOWN' | 'SAME';
  member: {
    id: string;
    displayName: string;
  };
}

export interface StandingsPage {
  items: StandingsEntry[];
}

export async function fetchStandings(leagueId: string): Promise<StandingsPage> {
  return apiFetch<StandingsPage>(`/leagues/${leagueId}/standings`);
}
