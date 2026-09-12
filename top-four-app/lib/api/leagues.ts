import { apiFetch } from './fetcher';
import type { Api } from './types';
import { fetchFixtureResultsBatch, type FixtureAvailability } from './predictions-fixture';
import { fetchCatalogueCompetitions, fetchCompetitionSeasons } from './catalogue';

export type LeagueRulesetMarket = Api<'MarketConfigurationDto'>;
/** Every market a ruleset can price — the six standard ones plus `lineup`. */
export type RulesetMarketType = LeagueRulesetMarket['marketType'];
export type LeagueRuleset = Api<'LeagueRulesetResponseDto'>;
export type LeagueCompetitionScope = Api<'LeagueScopeResponseDto'>;

/**
 * A competition scope with its names resolved for display. The scope itself
 * (season, kind, round bounds) is the league's own; `displayName`/`slug` come
 * from the league read, and `seasonLabel` from the season catalogue.
 */
export type LeagueCompetition = LeagueCompetitionScope & {
  displayName: string;
  seasonLabel: string;
  slug: string;
};

/**
 * The single-league read. The list endpoint returns a genuinely different and
 * narrower shape — see `LeagueListItem` — so the two are no longer one type
 * with everything optional.
 */
export type League = Omit<Api<'LeagueReadResponseDto'>, 'competitions'> & {
  competitions: LeagueCompetition[];
};

export type LeagueListItem = Api<'LeagueListItemResponseDto'>;
export type LeaguesPage = Api<'LeagueListResponseDto'>;

export async function fetchMyLeagues(cursor?: string): Promise<LeaguesPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<LeaguesPage>(`/leagues${query}`);
}

/**
 * The league, with each competition scope carrying the names the screens show.
 *
 * The read now names its own competitions, so the only thing still missing is
 * the season label. When the server omits `competitions` — an API older than
 * that change — the catalogue is consulted instead, which is what this used to
 * do for every field. Drop that branch once no such server is deployed.
 */
export async function fetchLeagueDetails(id: string): Promise<League> {
  const league = await apiFetch<Api<'LeagueReadResponseDto'>>(`/leagues/${id}`);
  const scopes = league.ruleset?.competitionScopes ?? [];
  const named = league.competitions ?? [];

  const catalogue = named.length > 0 ? [] : await fetchCatalogueCompetitions().catch(() => []);

  const competitions = await Promise.all(scopes.map(async (scope) => {
    const fromServer = named.find(c => c.supportedCompetitionId === scope.supportedCompetitionId);
    const fromCatalogue = catalogue.find(c => c.id === scope.supportedCompetitionId);
    const seasons = await fetchCompetitionSeasons(scope.supportedCompetitionId).catch(() => []);
    return {
      ...scope,
      displayName: fromServer?.displayName || fromCatalogue?.displayName || 'Competition',
      slug: fromServer?.slug || fromCatalogue?.slug || '',
      seasonLabel: seasons.find(s => s.id === scope.seasonId)?.label || '',
    };
  }));

  return { ...league, competitions };
}

/**
 * The frozen ruleset only — no catalogue join, so this costs one request rather
 * than the three `fetchLeagueDetails` needs to name competitions. Screens that
 * price a market or explain a tiebreaker want this, not the whole league.
 */
export async function fetchLeagueRuleset(leagueId: string): Promise<LeagueRuleset | null> {
  const league = await apiFetch<{ ruleset?: LeagueRuleset }>(`/leagues/${leagueId}`);
  return league.ruleset ?? null;
}

export type OwnPendingJoinRequest = Api<'OwnPendingJoinRequestResponseDto'>;

/**
 * The member's own outstanding join requests, across every league. Every other
 * join-request endpoint is scoped to a league id a requester does not have yet,
 * so this is the only way to show them what they are waiting on.
 */
export async function fetchOwnJoinRequests(): Promise<OwnPendingJoinRequest[]> {
  const response = await apiFetch<Api<'OwnPendingJoinRequestPageDto'>>('/me/join-requests');
  return response.data;
}

export interface LeagueFixture {
  id: string;
  leagueId: string;
  homeTeam: string;
  homeTeamCode: string;
  homeTeamLogoUrl: string | null;
  awayTeam: string;
  awayTeamCode: string;
  awayTeamLogoUrl: string | null;
  kickoffAt: string;
  status: 'upcoming' | 'live' | 'finished' | 'voided';
  score?: { home: number; away: number };
  markets: Array<{ type: string; status: string; }>;
  predictionState?: 'open' | 'ready' | 'syncing' | 'won' | 'part' | 'lost' | 'void';
  predictionNote?: string;
  pointsAwarded?: number;
  /** This fixture's own markets, not the league's season. */
  answered?: number;
  required?: number;
  /** The earliest market deadline, for the "locks in" column. */
  deadlineAt?: string | null;
  /** What landed, once it has: the settled markets in the design's words. */
  landed?: string | null;
}

export interface LeagueFixturesPage {
  items: LeagueFixture[];
  nextCursor: string | null;
}

function mapFixtureStatus(fixtureState: string): LeagueFixture['status'] {
  if (fixtureState === 'finished' || fixtureState === 'awarded' || fixtureState === 'walkover') return 'finished';
  if (fixtureState === 'postponed' || fixtureState === 'cancelled' || fixtureState === 'abandoned') return 'voided';
  if (fixtureState === 'live' || fixtureState === 'suspended' || fixtureState === 'interrupted' || fixtureState === 'under_review') return 'live';
  return 'upcoming';
}

export async function fetchLeagueFixtures(leagueId: string, cursor?: string): Promise<LeagueFixturesPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const response = await apiFetch<{ data: FixtureAvailability[]; nextCursor: string | null }>(`/leagues/${leagueId}/fixtures/availability${query}`);

  const base: LeagueFixture[] = response.data.map(f => ({
    id: f.leagueFixtureId,
    leagueId,
    homeTeam: f.homeTeam?.displayName || 'Home',
    homeTeamCode: f.homeTeam?.code || 'HOM',
    homeTeamLogoUrl: f.homeTeam?.logoUrl || null,
    awayTeam: f.awayTeam?.displayName || 'Away',
    awayTeamCode: f.awayTeam?.code || 'AWA',
    awayTeamLogoUrl: f.awayTeam?.logoUrl || null,
    kickoffAt: f.kickoff?.at || '',
    status: mapFixtureStatus(f.fixtureState),
    markets: [],
    predictionState: f.predictionCompleteness?.complete ? 'ready' : f.hasOpenMarkets ? 'open' : undefined,
  }));

  // Availability carries market *state*, never the resolved outcome, so a
  // finished fixture's score and points need a second read. That used to be one
  // request per finished fixture; the batch endpoint answers for all of them at
  // once. A failure here costs the outcomes, not the fixtures.
  const finishedIds = base.filter(f => f.status === 'finished').map(f => f.id);
  const results = await fetchFixtureResultsBatch(leagueId, finishedIds).catch(() => []);
  const byFixture = new Map(results.map(r => [r.leagueFixtureId, r]));

  const items = base.map(fixture => {
    const result = byFixture.get(fixture.id);
    if (!result) return fixture;

    const exactScore = result.markets.find(m => m.marketType === 'exact_score');
    const resolved = exactScore?.resolvedAnswer as { homeGoals?: number; awayGoals?: number } | null | undefined;
    const settled = result.markets.filter(m => m.viewerOutcome !== null);
    const allVoid = settled.length > 0 && settled.every(m => m.viewerOutcome?.outcome === 'void');
    const allCorrect = settled.length > 0 && settled.every(m => m.viewerOutcome?.outcome === 'correct');
    const anyCorrect = settled.some(m => m.viewerOutcome?.outcome === 'correct');

    return {
      ...fixture,
      score: typeof resolved?.homeGoals === 'number' && typeof resolved?.awayGoals === 'number'
        ? { home: resolved.homeGoals, away: resolved.awayGoals }
        : undefined,
      pointsAwarded: settled.length > 0
        ? settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta || 0), 0)
        : undefined,
      predictionState: settled.length === 0 ? undefined
        : allVoid ? 'void' as const
          : allCorrect ? 'won' as const
            : anyCorrect ? 'part' as const
              : 'lost' as const,
    };
  });

  return { items, nextCursor: response.nextCursor };
}

/** A stage and round the server can resolve, for scoping a league to a span. */
export interface RoundBoundary {
  stageId: string;
  roundId: string;
}

/** How much of a competition a league covers. */
export type CompetitionSpanKind = 'full_season' | 'single_round' | 'round_range';

/**
 * One competition a league covers, optionally narrowed to a round or a span.
 *
 * UNTYPED UPSTREAM: the published schema shows the *catalogue's*
 * `CompetitionScopeDto` here — `{ kind, code, name }` — because two unrelated
 * classes share that name on the server and only one gets registered. The
 * request shape is the one in `league.dto.ts`, mirrored here.
 */
export interface CreateLeagueScope {
  supportedCompetitionId: string;
  seasonId: string;
  kind: CompetitionSpanKind;
  /** Required by `single_round`; mutually exclusive with the pair below. */
  round?: RoundBoundary;
  firstRound?: RoundBoundary;
  lastRound?: RoundBoundary;
}

export interface CreateLeaguePayload {
  name: string;
  description?: string;
  invitationSettings: {
    joinApprovalRequired: boolean;
    enabled: boolean;
  };
  configuration: {
    lateJoinPolicy?: Api<'LeagueConfigurationDto'>['lateJoinPolicy'];
    totalGoalsLine?: Api<'LeagueConfigurationDto'>['totalGoalsLine'];
    competitionScopes: CreateLeagueScope[];
    /** Omit entirely to take the server's defaults for all seven. */
    markets?: Api<'MarketConfigurationDto'>[];
    tiebreakers: Api<'MarketConfigurationDto'>['marketType'][];
    standardLock: Api<'StandardLockDto'>;
  };
}

export async function createLeague(idempotencyKey: string, payload: CreateLeaguePayload): Promise<League> {
  return apiFetch<League>('/leagues', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export interface InvitationIntentPreview {
  league: {
    id: string;
    name: string;
    lifecycleState: string;
    joinApprovalRequired: boolean;
  };
  invitationExpiresAt: string;
  intentExpiresAt: string;
}

export type InvitationConsumeOutcome =
  | { outcome: 'joined'; leagueId: string; membershipId: string; role: 'participant' }
  | { outcome: 'already_active'; leagueId: string; membershipId: string; role: 'owner' | 'admin' | 'participant' }
  | { outcome: 'pending'; leagueId: string; joinRequestId: string; state: 'pending' };

// Step 1 of joining: establishes an httpOnly-cookie-backed "intent" from a
// join code or link token. Works whether or not the caller is authenticated
// — the capability never appears in the JSON body, only the cookie.
export async function establishInvitationIntent(credential: { joinCode: string } | { linkToken: string }): Promise<InvitationIntentPreview> {
  const response = await apiFetch<{ data: InvitationIntentPreview }>(`/invitation-intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credential),
  });
  return response.data;
}

// Reads back the previously-established intent (e.g. after returning from
// sign-up/sign-in) using only the httpOnly cookie already on the browser.
export async function fetchCurrentInvitationIntent(): Promise<InvitationIntentPreview> {
  const response = await apiFetch<{ data: InvitationIntentPreview }>(`/invitation-intents/current`);
  return response.data;
}

// Step 2: consumes the intent cookie set by establishInvitationIntent. Must
// be called while authenticated — takes no body, the capability travels only
// via the httpOnly cookie.
export async function consumeInvitationIntent(): Promise<InvitationConsumeOutcome> {
  const response = await apiFetch<{ data: InvitationConsumeOutcome }>(`/invitation-intents/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function fetchLeagueMembers(leagueId: string, state: 'active' | 'former' | 'all' = 'active'): Promise<Api<'MembershipPageResponseDto'>> {
  return apiFetch<Api<'MembershipPageResponseDto'>>(`/leagues/${leagueId}/members?state=${state}`);
}

export async function fetchJoinRequests(leagueId: string): Promise<Api<'JoinRequestPageResponseDto'>> {
  return apiFetch<Api<'JoinRequestPageResponseDto'>>(`/leagues/${leagueId}/join-requests`);
}

export async function updateMemberRole(leagueId: string, membershipId: string, newRole: string): Promise<Api<'MembershipEnvelopeDto'>> {
  return apiFetch<Api<'MembershipEnvelopeDto'>>(`/leagues/${leagueId}/members/${membershipId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole }),
  });
}

export async function removeMember(leagueId: string, membershipId: string): Promise<void> {
  await apiFetch<void>(`/leagues/${leagueId}/members/${membershipId}`, {
    method: 'DELETE',
  });
}

export async function processJoinRequest(leagueId: string, requestId: string, action: 'approve' | 'reject'): Promise<Api<'JoinRequestEnvelopeDto'>> {
  return apiFetch<Api<'JoinRequestEnvelopeDto'>>(`/leagues/${leagueId}/join-requests/${requestId}/${action}`, {
    method: 'POST',
  });
}

export async function cancelJoinRequest(leagueId: string, requestId: string): Promise<void> {
  await apiFetch<void>(`/leagues/${leagueId}/join-requests/${requestId}`, {
    method: 'DELETE',
  });
}

export async function createInvitation(leagueId: string, useLimit: number = 100): Promise<Api<'InvitationCreatedEnvelopeDto'>> {
  return apiFetch<Api<'InvitationCreatedEnvelopeDto'>>(`/leagues/${leagueId}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useLimit }),
  });
}

export async function fetchLeagueInvitations(leagueId: string): Promise<Api<'InvitationPageResponseDto'>> {
  return apiFetch<Api<'InvitationPageResponseDto'>>(`/leagues/${leagueId}/invitations`);
}

/**
 * The lifecycle transitions. Each declares a 200 upstream but publishes no
 * schema for its body, so there is no server type to adopt; callers treat these
 * as commands and refetch the league afterwards. Give them a real return type
 * once the API describes one.
 */
export async function publishLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<unknown> {
  return apiFetch<unknown>(`/leagues/${leagueId}/publication`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion })
  });
}

export async function deleteLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<void> {
  await apiFetch<void>(`/leagues/${leagueId}?expectedVersion=${expectedVersion}`, {
    method: 'DELETE',
    headers: { 'Idempotency-Key': idempotencyKey }
  });
}

export async function cloneLeague(leagueId: string, idempotencyKey: string, payload: { name: string; description?: string; }): Promise<Api<'LeagueResponseDto'>> {
  return apiFetch<Api<'LeagueResponseDto'>>(`/leagues/${leagueId}/clone`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function archiveLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<unknown> {
  return apiFetch<unknown>(`/leagues/${leagueId}/archival`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion })
  });
}

export async function cancelLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<unknown> {
  return apiFetch<unknown>(`/leagues/${leagueId}/cancellation`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion })
  });
}

export async function revokeInvitation(leagueId: string, invitationId: string): Promise<Api<'InvitationResponseDto'>> {
  return apiFetch<Api<'InvitationResponseDto'>>(`/leagues/${leagueId}/invitations/${invitationId}/revoke`, {
    method: 'POST',
  });
}

export interface UpdateLeaguePayload {
  expectedVersion: number;
  name?: string;
  description?: string | null;
  invitationSettings?: {
    enabled?: boolean;
    joinApprovalRequired?: boolean;
  };
}

export async function updateLeague(leagueId: string, payload: UpdateLeaguePayload): Promise<Api<'LeagueResponseDto'>> {
  return apiFetch<Api<'LeagueResponseDto'>>(`/leagues/${leagueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function transferOwnership(leagueId: string, targetMembershipId: string): Promise<Api<'OwnershipTransferResponseDto'>> {
  return apiFetch<Api<'OwnershipTransferResponseDto'>>(`/leagues/${leagueId}/ownership-transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetMembershipId }),
  });
}

export async function leaveLeague(leagueId: string): Promise<void> {
  await apiFetch<void>(`/leagues/${leagueId}/membership`, {
    method: 'DELETE',
  });
}

/**
 * Only `summary` is described upstream. UNTYPED UPSTREAM: the dashboard's
 * `league`, `competitionScopes` and `ownStanding` are declared as bare objects,
 * so they generate as open records. The first two are the league's own shapes,
 * already typed in this file; `ownStanding` is the same payload the standings
 * endpoint returns, so it borrows that DTO rather than being guessed again.
 */
export interface LeagueDashboard {
  league: League;
  competitionScopes: LeagueCompetitionScope[];
  summary: Api<'LeagueDashboardSummaryDto'>;
  ownStanding: Api<'OwnStandingDataDto'> | null;
}

export async function fetchLeagueDashboard(leagueId: string): Promise<LeagueDashboard> {
  const response = await apiFetch<{ data: LeagueDashboard }>(`/leagues/${leagueId}/dashboard`);
  return response.data;
}
