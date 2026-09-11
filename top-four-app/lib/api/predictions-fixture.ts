import { apiFetch } from './fetcher';
import type { Api } from './types';

/**
 * The server's own types throughout. The shapes this file used to hand-write —
 * the teams, the per-market availability, and the whole of `/predictions/me` —
 * were declared as bare objects upstream and generated as `Record<string,
 * never>`; the API now describes all of them, so the guesses are gone.
 *
 * Adopting them narrowed two things the hand-written versions had wrong:
 * `code` and `shortName` are nullable, and `marketType`/`state` are enums
 * rather than open strings.
 */

export type FixtureAvailabilityTeam = Api<'AvailabilityTeamDto'>;
export type FixtureMarketAvailability = Api<'AvailabilityMarketDto'>;
export type FixtureAvailability = Api<'AvailabilityFixtureDto'>;

/**
 * `serverTime` travels with the fixture because every deadline on the screen is
 * measured against it — the browser's clock can be wrong by minutes, and a
 * market that reads open when the server has closed it costs the member points.
 */
export interface FixtureAvailabilitySnapshot {
  fixture: FixtureAvailability;
  serverTime: string;
}

export type KickoffBasis = Api<'PredictionKickoffDto'>;
export type SnapshotRef = Api<'PredictionSnapshotDto'>;

/**
 * The stored answer's value, as a union of the per-market shapes rather than
 * one interface of optional fields — so reading `homeGoals` off a match_result
 * answer is now a type error instead of `undefined` at runtime.
 */
export type StandardAnswerValue = Api<'PredictionAnswerResponseDto'>['value'];

export type StoredStandardAnswer = Api<'PredictionAnswerResponseDto'>;
export type PredictionMarketSlot = Api<'OwnPredictionMarketDto'>;
export type PredictionCompleteness = Api<'PredictionCompletenessDto'>;
export type LineupAnswerValue = Api<'LineupValueDto'>;
export type LineupPlayerView = Api<'LineupPlayerResponseDto'>;
export type StoredLineupAnswer = Api<'LineupAnswerResponseDto'>;
export type OwnLineupSide = Api<'OwnLineupSideDto'>;
export type OwnLineups = Api<'OwnLineupsDto'>;
export type OwnFixturePredictions = Api<'OwnFixturePredictionsDataDto'>;

export interface PredictionSubmission {
  leagueFixtureId: string;
  membershipId: string;
  marketType: string;
  predictionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  answer: StoredStandardAnswer;
}

export interface LineupSubmission {
  leagueFixtureId: string;
  membershipId: string;
  side: 'home' | 'away';
  predictionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  answer: StoredLineupAnswer;
}

export type SelectablePlayer = Api<'SelectablePlayerDto'>;

export interface SelectablePlayersResponse {
  snapshot: SnapshotRef | null;
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

export type MemberMarketResult = Api<'MemberMarketResultDto'>;

export type FixtureResultsResponse = Api<'MemberFixtureResultsDataDto'>;

export async function fetchFixtureAvailability(leagueId: string, fixtureId: string): Promise<FixtureAvailabilitySnapshot> {
  const response = await apiFetch<{ data: FixtureAvailability; serverTime: string }>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`);
  return { fixture: response.data, serverTime: response.serverTime };
}

export async function fetchOwnPredictions(leagueId: string, fixtureId: string): Promise<OwnFixturePredictions> {
  const response = await apiFetch<{ data: OwnFixturePredictions }>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/me`);
  return response.data;
}

export async function fetchSelectablePlayers(leagueId: string, fixtureId: string): Promise<SelectablePlayersResponse> {
  const response = await apiFetch<{ data: { snapshot: SnapshotRef | null; players: SelectablePlayer[] } }>(`/leagues/${leagueId}/fixtures/${fixtureId}/selectable-players`);
  return { snapshot: response.data.snapshot, players: response.data.players };
}

// `answer` must already be the market-shaped value: {outcome}, {homeGoals,awayGoals},
// {bothScore}, {selection}, or {playerId,snapshotId} — see StandardAnswerValue.
export async function submitPrediction(leagueId: string, fixtureId: string, marketType: string, expectedVersion: number, answer: StandardAnswerValue): Promise<PredictionSubmission> {
  const response = await apiFetch<{ data: PredictionSubmission }>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/${marketType}`, {
    method: 'PUT',
    body: JSON.stringify({ expectedVersion, answer })
  });
  return response.data;
}

export async function submitLineupPrediction(leagueId: string, fixtureId: string, side: 'home' | 'away', expectedVersion: number, playerIds: string[], snapshotId: string): Promise<LineupSubmission> {
  const response = await apiFetch<{ data: LineupSubmission }>(`/leagues/${leagueId}/fixtures/${fixtureId}/lineups/${side}`, {
    method: 'PUT',
    body: JSON.stringify({ expectedVersion, answer: { playerIds, snapshotId } })
  });
  return response.data;
}

export async function copyFixturePredictions(leagueId: string, fixtureId: string): Promise<CopyPredictionsResponse> {
  return apiFetch<CopyPredictionsResponse>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/copy`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function fetchFixtureResults(leagueId: string, fixtureId: string): Promise<FixtureResultsResponse> {
  const response = await apiFetch<{ data: FixtureResultsResponse }>(`/leagues/${leagueId}/fixtures/${fixtureId}/results`);
  return response.data;
}

/**
 * Results for several fixtures in one read. The per-fixture call above is still
 * right for a single fixture; this exists because the league fixtures list needs
 * every finished fixture's outcome at once, and used to ask for them one request
 * at a time.
 */
export async function fetchFixtureResultsBatch(leagueId: string, leagueFixtureIds: string[]): Promise<FixtureResultsResponse[]> {
  if (leagueFixtureIds.length === 0) return [];
  const query = leagueFixtureIds.map(id => `leagueFixtureIds=${encodeURIComponent(id)}`).join('&');
  const response = await apiFetch<Api<'MemberFixtureResultsBatchResponseDto'>>(`/leagues/${leagueId}/fixtures/results?${query}`);
  return response.data;
}
