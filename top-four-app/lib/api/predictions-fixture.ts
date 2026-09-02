import { apiFetch } from './fetcher';

export interface FixtureAvailabilityTeam {
  id: string;
  displayName: string;
  shortName: string;
  code: string;
  logoUrl: string | null;
}

export interface FixtureMarketAvailability {
  marketType: string;
  enabled: boolean;
  state: string;
  reasonCode: string;
  submissionAllowed: boolean;
  replacementAllowed: boolean;
  deadlineAt: string | null;
}

export interface FixtureAvailability {
  leagueFixtureId: string;
  fixtureId: string;
  fixtureState: string;
  homeTeam: FixtureAvailabilityTeam;
  awayTeam: FixtureAvailabilityTeam;
  hasOpenMarkets: boolean;
  nextDeadlineAt: string | null;
  marketStateCounts: Record<string, number>;
  predictionCompleteness: { required: number; answered: number; unanswered: number; complete: boolean };
  markets: FixtureMarketAvailability[];
}

export interface KickoffBasis {
  state: string;
  at: string | null;
  revisionNumber: number;
}

export interface SnapshotRef {
  snapshotId: string;
  version: number;
}

// The real per-market answer value. Only the fields relevant to `marketType`
// are present; callers narrow on marketType before reading fields.
export interface StandardAnswerValue {
  outcome?: 'home' | 'draw' | 'away';
  homeGoals?: number;
  awayGoals?: number;
  bothScore?: boolean;
  selection?: 'over' | 'under';
  playerId?: string;
  snapshotId?: string;
}

export interface StoredStandardAnswer {
  value: StandardAnswerValue;
  rulesetRevision: number;
  deadlineAt: string;
  kickoff: KickoffBasis;
  snapshot: SnapshotRef | null;
  submittedAt: string;
}

export interface PredictionMarketSlot {
  marketType: 'match_result' | 'exact_score' | 'both_teams_to_score' | 'total_goals' | 'anytime_goalscorer' | 'player_card';
  enabled: boolean;
  state: string;
  reasonCode: string;
  submissionAllowed: boolean;
  replacementAllowed: boolean;
  deadlineAt: string | null;
  snapshot: SnapshotRef | null;
  answered: boolean;
  predictionId: string | null;
  version: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  answer: StoredStandardAnswer | null;
}

export interface PredictionCompleteness {
  scope: string;
  enabledMarketCount: number;
  answeredCount: number;
  unansweredCount: number;
  unansweredMarketTypes: string[];
  allEnabledMarketsAnswered: boolean;
}

export interface LineupAnswerValue {
  playerIds: string[];
  snapshotId: string;
}

export interface LineupPlayerView {
  playerId: string;
  displayName: string;
  position: string;
  shirtNumber: number | null;
}

export interface StoredLineupAnswer {
  value: LineupAnswerValue;
  players: LineupPlayerView[];
  rulesetRevision: number;
  deadlineAt: string;
  kickoff: KickoffBasis;
  snapshot: SnapshotRef;
  submittedAt: string;
}

export interface OwnLineupSide {
  predictionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  answer: StoredLineupAnswer;
}

export interface OwnLineups {
  enabled: boolean;
  state: string;
  reasonCode: string;
  submissionAllowed: boolean;
  replacementAllowed: boolean;
  deadlineAt: string | null;
  snapshot: SnapshotRef | null;
  home: OwnLineupSide | null;
  away: OwnLineupSide | null;
  bothAnswered: boolean;
}

export interface OwnFixturePredictions {
  leagueFixtureId: string;
  fixtureId: string;
  membershipId: string;
  rulesetRevision: number;
  kickoff: KickoffBasis;
  markets: PredictionMarketSlot[];
  completeness: PredictionCompleteness;
  lineups: OwnLineups;
}

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

export interface SelectablePlayer {
  playerId: string;
  teamId: string;
  displayName: string;
  shirtNumber: number | null;
  position: string | null;
  side: 'home' | 'away';
}

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

export interface MemberMarketResult {
  settlementId: string | null;
  marketType: string;
  side: 'home' | 'away' | null;
  state: string;
  reasonCode: string;
  status: string | null;
  version: number | null;
  decidedAt: string | null;
  finalizedAt: string | null;
  resolvedAnswer: Record<string, unknown> | null;
  viewerOutcome: { outcome: 'correct' | 'incorrect' | 'void'; correctStarters: number | null; pointsDelta: number; predictionRevisionId: string } | null;
}

export interface FixtureResultsResponse {
  leagueFixtureId: string;
  fixtureId: string;
  correctionUpdating: boolean;
  markets: MemberMarketResult[];
}

export async function fetchFixtureAvailability(leagueId: string, fixtureId: string): Promise<FixtureAvailability> {
  const response = await apiFetch<{ data: FixtureAvailability }>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`);
  return response.data;
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
