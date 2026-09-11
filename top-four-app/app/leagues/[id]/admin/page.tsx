import { notFound, redirect } from 'next/navigation';
import { LeagueAdminScreen } from '../../../components/leagues/LeagueAdminScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPagesOrEmpty, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import {
  toAdminActions, toAdminInvites, toAdminMembers, toAdminRequests, toLifecycleSteps,
} from '@/lib/leagues/league-admin';
import type { Api } from '@/lib/api/types';

/**
 * League admin, fetched on the server.
 *
 * The backend already refuses every admin read to a participant, but the screen
 * used to render a half-empty admin page around those failures. A member who
 * cannot manage this league is sent back to it before anything renders.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Members = Api<'MembershipPageResponseDto'>;
type Invites = Api<'InvitationPageResponseDto'>;
type Requests = Api<'JoinRequestPageResponseDto'>;
type Standings = Api<'StandingsPageResponseDto'>;
type Me = Api<'CurrentAuthenticationResponseDto'>;

export default async function LeagueAdminPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  try {
    league = await serverFetch<LeagueRead>(`/leagues/${id}`);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/admin`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/admin`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const role = league.membership?.role;
  const canManage = role === 'owner' || role === 'admin';
  if (!canManage) redirect(`/leagues/${id}`);

  // Every page of each list: an admin managing a league must see all of its
  // members, invitations and requests, not the oldest twenty of each.
  const [members, invites, requests, standings, me] = await Promise.all([
    serverFetchAllPagesOrEmpty<Members['data'][number], Members>(`/leagues/${id}/members?state=active`),
    serverFetchAllPagesOrEmpty<Invites['data'][number], Invites>(`/leagues/${id}/invitations`),
    serverFetchAllPagesOrEmpty<Requests['data'][number], Requests>(`/leagues/${id}/join-requests`),
    serverFetchOrNull<Standings>(`/leagues/${id}/standings?page=1&pageSize=50`),
    serverFetchOrNull<Me>('/auth/me'),
  ]);

  return (
    <LeagueAdminScreen
      leagueId={id}
      leagueName={league.name}
      lifecycleState={league.lifecycleState}
      version={league.version}
      isOwner={role === 'owner'}
      canManage={canManage}
      members={toAdminMembers(members.items, standings?.data.entries ?? [], me?.user.id)}
      invites={toAdminInvites(invites.items)}
      requests={toAdminRequests(requests.items)}
      lifecycle={toLifecycleSteps(league.lifecycleState)}
      actions={toAdminActions(league.lifecycleState, role === 'owner')}
      memberCount={league.memberCount ?? members.items.length}
    />
  );
}
