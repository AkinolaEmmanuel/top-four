import { apiFetch } from './fetcher';

export interface FixtureAvailability {
  leagueId: string;
  leagueFixtureId: string;
  availability: {
    status: 'OPEN' | 'LOCKED' | 'SETTLED' | 'CANCELLED';
    markets: Array<{
      type: string;
      status: 'OPEN' | 'LOCKED' | 'SETTLED';
      deadline: string;
    }>;
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

export async function fetchFixtureAvailability(leagueId: string, fixtureId: string): Promise<FixtureAvailability> {
  return apiFetch<FixtureAvailability>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`);
}

export async function fetchOwnPredictions(leagueId: string, fixtureId: string): Promise<OwnFixturePredictions> {
  return apiFetch<OwnFixturePredictions>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/me`);
}

export async function submitPrediction(leagueId: string, fixtureId: string, marketType: string, expectedVersion: number, answer: any): Promise<PredictionSubmission> {
  return apiFetch<PredictionSubmission>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/${marketType}`, {
    method: 'PUT',
    body: JSON.stringify({ expectedVersion: expectedVersion, answer: answer })
  });
}

export async function submitLineupPrediction(leagueId: string, fixtureId: string, side: 'home' | 'away', expectedVersion: number, lineup: string[]): Promise<PredictionSubmission> {
  return apiFetch<PredictionSubmission>(`/leagues/${leagueId}/fixtures/${fixtureId}/lineups/${side}`, {
    method: 'PUT',
    body: JSON.stringify({ expectedVersion, lineup })
  });
}
