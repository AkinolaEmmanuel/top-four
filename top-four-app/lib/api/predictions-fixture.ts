import { apiFetch } from './fetcher';

export interface FixtureMarketAvailability {
  type: string;
  status: 'OPEN' | 'LOCKED' | 'SETTLED';
  deadline: string;
}

export interface FixtureAvailability {
  leagueId: string;
  leagueFixtureId: string;
  availability: {
    status: 'OPEN' | 'LOCKED' | 'SETTLED' | 'CANCELLED';
    markets: FixtureMarketAvailability[];
  };
}

export interface PredictionHistoryCursor {
  version: number;
}

export interface OwnFixturePredictions {
  leagueId: string;
  leagueFixtureId: string;
  markets: Record<string, {
    version: number;
    answer: any;
    updatedAt: string;
  }>;
}

export interface PredictionSubmission {
  version: number;
  answer: any;
  updatedAt: string;
}

export interface SelectablePlayer {
  id: string;
  displayName: string;
  shirtNumber: string | null;
  position: string | null;
  teamSide: 'home' | 'away';
}

export interface SelectablePlayersResponse {
  snapshotId: string;
  players: SelectablePlayer[];
}

export interface CopyPredictionsResponse {
  targets: Array<{
    leagueId: string;
    leagueName: string;
    outcome: string;
    note?: string;
  }>;
}

export interface MarketResult {
  marketType: string;
  status: 'hit' | 'miss' | 'void' | 'review' | 'pending';
  pointsAwarded: number;
  actualOutcome?: any;
}

export interface FixtureResultsResponse {
  leagueFixtureId: string;
  score?: { home: number; away: number };
  markets: Record<string, MarketResult>;
}

export async function fetchFixtureAvailability(leagueId: string, fixtureId: string): Promise<FixtureAvailability> {
  return apiFetch<FixtureAvailability>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`);
}

export async function fetchOwnPredictions(leagueId: string, fixtureId: string): Promise<OwnFixturePredictions> {
  return apiFetch<OwnFixturePredictions>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/me`);
}

export async function fetchSelectablePlayers(leagueId: string, fixtureId: string): Promise<SelectablePlayersResponse> {
  return apiFetch<SelectablePlayersResponse>(`/leagues/${leagueId}/fixtures/${fixtureId}/selectable-players`);
}

export async function submitPrediction(leagueId: string, fixtureId: string, marketType: string, expectedVersion: number, answer: any): Promise<PredictionSubmission> {
  return apiFetch<PredictionSubmission>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/${marketType}`, {
    method: 'PUT',
    body: JSON.stringify({ expectedVersion, answer })
  });
}

export async function submitLineupPrediction(leagueId: string, fixtureId: string, side: 'home' | 'away', expectedVersion: number, lineup: string[]): Promise<PredictionSubmission> {
  return apiFetch<PredictionSubmission>(`/leagues/${leagueId}/fixtures/${fixtureId}/lineups/${side}`, {
    method: 'PUT',
    body: JSON.stringify({ expectedVersion, lineup })
  });
}

export async function copyFixturePredictions(leagueId: string, fixtureId: string): Promise<CopyPredictionsResponse> {
  return apiFetch<CopyPredictionsResponse>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/copy`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function fetchFixtureResults(leagueId: string, fixtureId: string): Promise<FixtureResultsResponse> {
  return apiFetch<FixtureResultsResponse>(`/leagues/${leagueId}/fixtures/${fixtureId}/results`);
}
