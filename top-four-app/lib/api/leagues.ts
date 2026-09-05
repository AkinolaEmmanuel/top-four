import { apiFetch } from './fetcher';
import { fetchFixtureResults } from './predictions-fixture';
import { fetchCatalogueCompetitions, fetchCompetitionSeasons } from './catalogue';

export interface LeagueRulesetMarket {
  marketType: string;
  enabled: boolean;
  points: number;
}

export interface LeagueRuleset {
  state: string;
  revision: number;
  lateJoinPolicy: 'allow' | 'close_at_start';
  totalGoalsLine: number;
  standardLock: { kind: string; offsetMinutes: number };
  markets: LeagueRulesetMarket[];
  tiebreakers: string[];
}

export interface League {
  id: string;
  name: string;
  description: string;
  lifecycleState: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived' | 'cancelled';
  membership: {
    role: 'owner' | 'admin' | 'participant';
    state: 'active' | 'former';
  };
  version: number;
  competitions: {
    supportedCompetitionId: string;
    seasonId: string;
    kind: string;
    firstRound: number | null;
    lastRound: number | null;
    displayName: string;
    seasonLabel: string;
    slug: string;
  }[];
  ruleset?: LeagueRuleset;
  ownStanding?: any;
  memberCount?: number;
  invitationSettings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface LeaguesPage {
  items: League[];
  unfinishedLeagueCount: number;
  unfinishedLeagueLimit: number;
  nextCursor: string | null;
}

export async function fetchMyLeagues(cursor?: string): Promise<LeaguesPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<LeaguesPage>(`/leagues${query}`);
}

// The single-league read (unlike the leagues list) carries no embedded
// competition names — only `ruleset.competitionScopes`, which is IDs only.
// Join against the (small, cached) catalogue to give every consumer a real
// `competitions[].displayName` instead of silently-undefined data.
export async function fetchLeagueDetails(id: string): Promise<League> {
  const [league, catalogue] = await Promise.all([
    apiFetch<any>(`/leagues/${id}`),
    fetchCatalogueCompetitions().catch(() => []),
  ]);
  const scopes: Array<{ supportedCompetitionId: string; seasonId: string; kind: string; firstRound: number | null; lastRound: number | null }> =
    league.ruleset?.competitionScopes || [];
  const competitions = await Promise.all(scopes.map(async (scope) => {
    const match = catalogue.find((c) => c.id === scope.supportedCompetitionId);
    const seasons = await fetchCompetitionSeasons(scope.supportedCompetitionId).catch(() => []);
    const season = seasons.find((s) => s.id === scope.seasonId);
    return {
      supportedCompetitionId: scope.supportedCompetitionId,
      seasonId: scope.seasonId,
      kind: scope.kind,
      firstRound: scope.firstRound,
      lastRound: scope.lastRound,
      displayName: match?.displayName || 'Competition',
      seasonLabel: season?.label || '',
      slug: match?.slug || '',
    };
  }));
  return { ...league, competitions };
}

export interface LeagueFixture {
  id: string;
  leagueId: string;
  homeTeam: string;
  homeTeamCode: string;
  awayTeam: string;
  awayTeamCode: string;
  kickoffAt: string;
  status: 'upcoming' | 'live' | 'finished' | 'voided';
  score?: { home: number; away: number };
  markets: Array<{ type: string; status: string; }>;
  predictionState?: 'open' | 'ready' | 'syncing' | 'won' | 'part' | 'lost' | 'void';
  predictionNote?: string;
  pointsAwarded?: number;
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
  const response = await apiFetch<{ data: any[]; nextCursor: string | null }>(`/leagues/${leagueId}/fixtures/availability${query}`);
  const items: LeagueFixture[] = await Promise.all(response.data.map(async (f) => {
    const status = mapFixtureStatus(f.fixtureState);
    const base: LeagueFixture = {
      id: f.leagueFixtureId,
      leagueId,
      homeTeam: f.homeTeam?.displayName || 'Home',
      homeTeamCode: f.homeTeam?.code || 'HOM',
      awayTeam: f.awayTeam?.displayName || 'Away',
      awayTeamCode: f.awayTeam?.code || 'AWA',
      kickoffAt: f.kickoff?.at || '',
      status,
      markets: [],
      predictionState: f.predictionCompleteness?.complete ? 'ready' : f.hasOpenMarkets ? 'open' : undefined,
    };
    // Availability only carries market *state*, not the resolved outcome — a
    // finished fixture's score and points come from a separate call per fixture.
    if (status !== 'finished') return base;
    try {
      const results = await fetchFixtureResults(leagueId, f.leagueFixtureId);
      const exactScoreMarket = results.markets.find((m) => m.marketType === 'exact_score');
      const resolvedScore = exactScoreMarket?.resolvedAnswer as { homeGoals?: number; awayGoals?: number } | null | undefined;
      const settled = results.markets.filter((m) => m.viewerOutcome !== null);
      const totalPoints = settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta || 0), 0);
      const anyCorrect = settled.some((m) => m.viewerOutcome?.outcome === 'correct');
      const allVoid = settled.length > 0 && settled.every((m) => m.viewerOutcome?.outcome === 'void');
      const allCorrect = settled.length > 0 && settled.every((m) => m.viewerOutcome?.outcome === 'correct');
      return {
        ...base,
        score: resolvedScore && typeof resolvedScore.homeGoals === 'number' && typeof resolvedScore.awayGoals === 'number'
          ? { home: resolvedScore.homeGoals, away: resolvedScore.awayGoals }
          : undefined,
        pointsAwarded: settled.length > 0 ? totalPoints : undefined,
        predictionState: settled.length === 0 ? undefined : allVoid ? 'void' : allCorrect ? 'won' : anyCorrect ? 'part' : 'lost',
      };
    } catch {
      return base;
    }
  }));
  return { items, nextCursor: response.nextCursor };
}

export interface CreateLeaguePayload {
  name: string;
  description?: string;
  invitationSettings: {
    joinApprovalRequired: boolean;
    enabled: boolean;
  };
  configuration: {
    competitionScopes: {
      supportedCompetitionId: string;
      seasonId: string;
      kind: string;
    }[];
    markets: { marketType: string; enabled: boolean; points: number }[];
    tiebreakers: string[];
    standardLock: {
      kind: string;
      offsetMinutes?: number;
    };
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

export async function joinLeague(inviteCode: string): Promise<any> {
  return apiFetch<any>(`/invitation-intents/consume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ joinCode: inviteCode }),
  });
}

export async function fetchLeagueMembers(leagueId: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/members`);
}

export async function fetchJoinRequests(leagueId: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/join-requests`);
}

export async function updateMemberRole(leagueId: string, membershipId: string, newRole: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/members/${membershipId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole }),
  });
}

export async function removeMember(leagueId: string, membershipId: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/members/${membershipId}`, {
    method: 'DELETE',
  });
}

export async function processJoinRequest(leagueId: string, requestId: string, action: 'approve' | 'reject'): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/join-requests/${requestId}/${action}`, {
    method: 'POST',
  });
}

export async function createInvitation(leagueId: string, useLimit: number = 100): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useLimit }),
  });
}

export async function fetchLeagueInvitations(leagueId: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/invitations`);
}

export async function publishLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/publication`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion })
  });
}

export async function deleteLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}?expectedVersion=${expectedVersion}`, {
    method: 'DELETE',
    headers: { 'Idempotency-Key': idempotencyKey }
  });
}

export async function cloneLeague(leagueId: string, idempotencyKey: string, payload: { name: string; description?: string; }): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/clone`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function archiveLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/archival`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion })
  });
}

export async function cancelLeague(leagueId: string, idempotencyKey: string, expectedVersion: number): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/cancellation`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion })
  });
}

export async function revokeInvitation(leagueId: string, invitationId: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/invitations/${invitationId}/revoke`, {
    method: 'POST',
  });
}

export async function transferOwnership(leagueId: string, targetMembershipId: string): Promise<any> {
  return apiFetch<any>(`/leagues/${leagueId}/ownership-transfer`, {
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

export interface LeagueDashboard {
  league: League;
  competitionScopes: any[];
  summary: {
    activeMemberCount: number;
    fixtureCount: number;
    enabledMarketCount: number;
    marketStates: {
      open: number;
      locked: number;
      pendingData: number;
      pendingReview: number;
      settled: number;
      void: number;
    };
    predictionCompleteness: {
      required: number;
      answered: number;
      unanswered: number;
      complete: boolean;
    };
    nextFixtureDeadlineAt: string | null;
  };
  ownStanding: {
    standingVersion: number;
    position: number;
    membershipId: string;
    totalPoints: number;
    counters: Record<string, unknown>;
    competitionPoints: any[];
    marketPoints: any[];
    customQuestionPoints: any;
  } | null;
}

export async function fetchLeagueDashboard(leagueId: string): Promise<LeagueDashboard> {
  const response = await apiFetch<{ data: LeagueDashboard }>(`/leagues/${leagueId}/dashboard`);
  return response.data;
}
