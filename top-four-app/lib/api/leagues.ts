import { apiFetch } from './fetcher';

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
    displayName: string;
    slug: string;
  }[];
  ownStanding?: any;
  memberCount?: number;
  configuration?: any;
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

export async function fetchLeagueDetails(id: string): Promise<League> {
  return apiFetch<League>(`/leagues/${id}`);
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

export async function fetchLeagueFixtures(leagueId: string, cursor?: string): Promise<LeagueFixturesPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<LeagueFixturesPage>(`/leagues/${leagueId}/fixtures${query}`);
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
