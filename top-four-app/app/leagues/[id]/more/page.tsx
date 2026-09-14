import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { LeagueMoreScreen } from '../../../components/leagues/LeagueMoreScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { LeagueContentSkeleton } from '@/app/components/leagues/LeagueContentSkeleton';
import { getLeague, getLeagueDashboard } from '@/lib/leagues/league-context';
import { toMoreSections, type LeagueRole } from '@/lib/leagues/league-more';
import type { Api } from '@/lib/api/types';

/**
 * The league "More" menu, fetched on the server.
 *
 * Join requests and invitations are admin-only reads, so a participant gets a
 * 403 on both — the `orNull` form turns that into an absent count rather than an
 * error page, and a participant does not see those rows anyway.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Dashboard = Api<'LeagueDashboardResponseDto'>;
type Questions = Api<'CustomQuestionPageResponseDto'>;
type JoinRequests = Api<'JoinRequestPageResponseDto'>;
type Invitations = Api<'InvitationPageResponseDto'>;

export default function LeagueMorePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LeagueContentSkeleton rows={5} />}>
      <More params={params} />
    </Suspense>
  );
}

async function More({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let dashboard: Dashboard | null;
  let questions: Questions | null;
  let requests: JoinRequests | null;
  let invitations: Invitations | null;

  try {
    [league, dashboard, questions, requests, invitations] = await Promise.all([
      getLeague(id),
      getLeagueDashboard(id),
      serverFetchOrNull<Questions>(`/leagues/${id}/custom-questions`),
      serverFetchOrNull<JoinRequests>(`/leagues/${id}/join-requests`),
      serverFetchOrNull<Invitations>(`/leagues/${id}/invitations`),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/more`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/more`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const role = (league.membership?.role ?? 'participant') as LeagueRole;
  const isComplete = league.lifecycleState === 'completed';
  const memberCount = league.memberCount ?? dashboard?.data.summary.activeMemberCount ?? 0;

  return (
    <LeagueMoreScreen
      leagueId={id}
      leagueName={league.name}
      lifecycleLabel={isComplete ? 'COMPLETED' : league.lifecycleState.replace('_', ' ').toUpperCase()}
      roleLabel={role.toUpperCase()}
      isComplete={isComplete}
      sections={toMoreSections({
        leagueId: id,
        role,
        isComplete,
        memberCount,
        openQuestions: (questions?.data ?? []).filter(q => q.phase === 'open').length,
        pendingRequests: (requests?.data ?? []).filter(r => r.state === 'pending').length,
        questionCount: questions?.data.length ?? 0,
    marketCount: league.ruleset?.markets.filter(market => market.enabled).length ?? 0,
        liveInvitations: (invitations?.data ?? []).filter(i => i.state === 'active').length,
  })}
      footNote={isComplete
        ? 'A completed league is read-only. Everything here stays readable, and the table never moves again.'
        : 'Rules froze when the league was published, because members answered under them. Only the name, invitations and the approval setting can still change.'}
    />
  );
}
