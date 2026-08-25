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
  ownStanding: any;
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

export interface CreateLeaguePayload {
  name: string;
  description?: string;
  invitationSettings: {
    joinApprovalRequired: boolean;
    enabled: boolean;
  };
  configuration: {
    competitionScopes: {
      kind: string;
      code: string;
      name: string;
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
