import { apiFetch, generateIdempotencyKey } from './fetcher';

// ---- Settlement review (also covers "late corrections") ----

export interface SettlementReviewItem {
  id: string;
  leagueId: string;
  leagueFixtureId: string;
  fixtureId: string;
  marketType: string;
  side: string | null;
  state: string;
  reasonCode: string;
  status: string | null;
  fixtureFactsId: string | null;
  version: number;
  updatedAt: string;
}

export const SETTLE_REASON_CODES = ['verified_normal_period_play', 'official_late_correction'] as const;
export const VOID_REASON_CODES = ['missing_reliable_official_data', 'unfair_player_pool', 'provider_conflict_unresolved', 'abnormal_fixture_no_usable_result'] as const;

export async function fetchSettlementReviews(cursor?: string): Promise<{ items: SettlementReviewItem[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch(`/platform/reviews/settlements${qs}`);
}

export async function resolveSettlementDecision(
  settlementId: string,
  expectedVersion: number,
  action: 'settle_current_facts' | 'void',
  reasonCode: string
): Promise<SettlementReviewItem> {
  return apiFetch<SettlementReviewItem>(`/platform/settlements/${settlementId}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': generateIdempotencyKey() },
    body: JSON.stringify({ expectedVersion, action, reasonCode }),
  });
}

// ---- Fact conflicts (provider facts vs protected manual facts) ----

export interface FactConflictItem {
  id: string;
  fixtureId: string;
  section: string;
  candidate: unknown;
  createdAt: string;
}

export async function fetchFactConflicts(cursor?: string): Promise<{ items: FactConflictItem[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch(`/platform/reviews/fact-conflicts${qs}`);
}

export async function keepCurrentFacts(conflictId: string, note: string): Promise<unknown> {
  return apiFetch(`/platform/reviews/fact-conflicts/${conflictId}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': generateIdempotencyKey() },
    body: JSON.stringify({ action: 'keep_current', note }),
  });
}

// ---- Provider issues (capability failures + validation quarantines) ----

export type ProviderTarget =
  | { kind: 'competition'; competitionId: string }
  | { kind: 'season'; seasonId: string }
  | { kind: 'team'; seasonId: string; teamId: string }
  | { kind: 'fixture'; fixtureId: string }
  | null;

export interface ProviderIssueItem {
  issueId: string;
  issueKind: 'capability_failure' | 'validation_quarantine';
  retryable: boolean;
  target: ProviderTarget;
  createdAt: string;
}

export async function fetchProviderIssues(cursor?: string): Promise<{ items: ProviderIssueItem[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch(`/platform/provider-issues${qs}`);
}

export async function retryProviderIssue(issueKind: 'capability_failure' | 'validation_quarantine', issueId: string): Promise<unknown> {
  const path = issueKind === 'capability_failure'
    ? `/platform/provider-issues/capability/${issueId}/retry`
    : `/platform/provider-issues/validation/${issueId}/retry`;
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}

// ---- Exhausted worker jobs ----

export interface ExhaustedJobItem {
  id: string;
  taskIdentifier: string;
  attempts: number;
  maxAttempts: number;
  runAt: string;
  createdAt: string;
}

export async function fetchExhaustedJobs(cursor?: string): Promise<{ items: ExhaustedJobItem[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch(`/platform/jobs/exhausted${qs}`);
}

export async function retryExhaustedJob(jobId: string): Promise<unknown> {
  return apiFetch(`/platform/jobs/${jobId}/retry`, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}

// ---- Failed notification deliveries ----

export interface FailedNotificationItem {
  id: string;
  userId: string;
  notificationKind: string;
  deliveryAttempts: number;
  lastFailureCode: string | null;
  failedAt: string;
}

export async function fetchFailedNotifications(cursor?: string): Promise<{ items: FailedNotificationItem[]; nextCursor: string | null }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch(`/platform/notifications/failed${qs}`);
}

export async function retryFailedNotification(notificationId: string): Promise<unknown> {
  return apiFetch(`/platform/notifications/${notificationId}/retry`, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}

// ---- Aggregate status ----

export interface PlatformStatusPair {
  count: number;
  oldestTimestamp: string | null;
}

export interface PlatformStatus {
  settlementReviewBacklog: PlatformStatusPair;
  lateCorrections: PlatformStatusPair;
  providerIssues: PlatformStatusPair;
  exhaustedJobs: PlatformStatusPair;
  failedNotifications: PlatformStatusPair;
}

export async function fetchPlatformStatus(): Promise<PlatformStatus> {
  return apiFetch('/platform/status');
}

// ---- League consistency tool ----

export interface LeagueConsistencyReport {
  parentRevisionMismatches: number;
  officialOutcomeLedgerMismatches: number;
  customResolutionLedgerMismatches: number;
  ledgerStandingsMismatches: number;
  ledgerCompetitionMismatches: number;
  standingVersionMismatches: number;
  missingExpectedMarketCount: number;
  unresolvedQuestionCount: number;
}

export async function fetchLeagueConsistency(leagueId: string): Promise<LeagueConsistencyReport> {
  return apiFetch(`/platform/leagues/${leagueId}/consistency`);
}

export async function requestStandingsRebuild(leagueId: string): Promise<unknown> {
  return apiFetch(`/platform/leagues/${leagueId}/standings-rebuild`, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}

export async function requestCompletionRecheck(leagueId: string): Promise<unknown> {
  return apiFetch(`/platform/leagues/${leagueId}/completion-recheck`, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}

// ---- Fixture fact-refresh tool ----

export async function requestFixtureFactsRefresh(fixtureId: string): Promise<unknown> {
  return apiFetch(`/platform/fixtures/${fixtureId}/facts-refresh`, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}

export async function requestFixturePlayersRefresh(fixtureId: string): Promise<unknown> {
  return apiFetch(`/platform/fixtures/${fixtureId}/players-refresh`, {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  });
}
