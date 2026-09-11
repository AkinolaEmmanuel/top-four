import { notFound, redirect } from 'next/navigation';
import { LeagueOverviewScreen } from '../../components/leagues/LeagueOverviewScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import {
  phaseFor, timeUntil, toLastResult, toRivalGap, toStandingRows,
  type LastResult, type NextFixture,
} from '@/lib/leagues/league-overview';
import type { Api } from '@/lib/api/types';
import type { FixtureAvailability, FixtureResultsResponse } from '@/lib/api/predictions-fixture';

/**
 * The league overview, fetched on the server.
 *
 * This screen used to open with a three-hop waterfall — the league read, then
 * the competition catalogue, then a season read per scope — purely to learn its
 * competitions' names. The league read carries `competitions` and `memberCount`
 * itself now, so none of that is needed: the reads below are independent and run
 * together.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Dashboard = Api<'LeagueDashboardResponseDto'>;
type Standings = Api<'StandingsPageResponseDto'>;
type OwnStanding = Api<'OwnStandingResponseDto'>;
type TaskPage = Api<'PredictionTaskPageDto'>;
type Questions = Api<'CustomQuestionPageResponseDto'>;
type Me = Api<'CurrentAuthenticationResponseDto'>;

/** Availability for every fixture in the league, newest finished one first. */
type AvailabilityPage = { data: FixtureAvailability[]; nextCursor: string | null };

export default async function LeagueOverviewPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let dashboard: Dashboard | null;
  let standings: Standings | null;
  let own: OwnStanding | null;
  let tasks: TaskPage | null;
  let questions: Questions | null;
  let fixtures: AvailabilityPage | null;
  let me: Me | null;

  try {
    [league, dashboard, standings, own, tasks, questions, fixtures, me] = await Promise.all([
      serverFetch<LeagueRead>(`/leagues/${id}`),
      serverFetchOrNull<Dashboard>(`/leagues/${id}/dashboard`),
      serverFetchOrNull<Standings>(`/leagues/${id}/standings?page=1&pageSize=50`),
      serverFetchOrNull<OwnStanding>(`/leagues/${id}/standings/me`),
      serverFetchOrNull<TaskPage>('/me/prediction-tasks'),
      serverFetchOrNull<Questions>(`/leagues/${id}/custom-questions`),
      serverFetchOrNull<AvailabilityPage>(`/leagues/${id}/fixtures/availability`),
      serverFetchOrNull<Me>('/auth/me'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const now = Date.now();

  // The hero is about the next fixture, so its progress comes from that
  // fixture's own record. The dashboard's completeness counts the whole season —
  // a four-digit number that says nothing about what is waiting now.
  const nextTask = tasks?.items.find(t => t.kind === 'fixture' && t.league.id === id);
  const nextAvailability = nextTask?.kind === 'fixture'
    ? fixtures?.data.find(f => f.leagueFixtureId === nextTask.leagueFixtureId)
    : undefined;

  const nextFixture: NextFixture | null = nextTask?.kind === 'fixture' ? {
    leagueFixtureId: nextTask.leagueFixtureId,
    homeName: nextTask.homeTeam.displayName,
    homeCode: nextTask.homeTeam.code || nextTask.homeTeam.displayName.substring(0, 3).toUpperCase(),
    awayName: nextTask.awayTeam.displayName,
    awayCode: nextTask.awayTeam.code || nextTask.awayTeam.displayName.substring(0, 3).toUpperCase(),
    kickoffAt: nextAvailability?.kickoff?.at ?? null,
    answered: nextAvailability?.predictionCompleteness?.answered ?? 0,
    required: nextAvailability?.predictionCompleteness?.required ?? 0,
  } : null;

  // The most recently played fixture, and how the member scored on it. One
  // extra read, for the per-market breakdown the availability feed does not carry.
  const lastFinished = (fixtures?.data ?? [])
    .filter(f => ['finished', 'awarded', 'walkover'].includes(f.fixtureState))
    .sort((a, b) => Date.parse(b.kickoff?.at ?? '') - Date.parse(a.kickoff?.at ?? ''))[0];

  let lastResult: LastResult | null = null;
  if (lastFinished) {
    const results = await serverFetchOrNull<{ data: FixtureResultsResponse }>(
      `/leagues/${id}/fixtures/${lastFinished.leagueFixtureId}/results`,
    );
    const settled = (results?.data.markets ?? []).filter(m => m.viewerOutcome !== null);
    const exact = results?.data.markets.find(m => m.marketType === 'exact_score');
    const score = exact?.resolvedAnswer as { homeGoals?: number; awayGoals?: number } | null | undefined;

    lastResult = toLastResult({
      homeTeam: lastFinished.homeTeam.displayName,
      awayTeam: lastFinished.awayTeam.displayName,
      homeTeamCode: lastFinished.homeTeam.code || 'HOM',
      awayTeamCode: lastFinished.awayTeam.code || 'AWA',
      score: typeof score?.homeGoals === 'number' && typeof score?.awayGoals === 'number'
        ? { home: score.homeGoals, away: score.awayGoals } : undefined,
      pointsAwarded: settled.length > 0
        ? settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta ?? 0), 0) : undefined,
      predictionState: settled.length === 0 ? undefined
        : settled.every(m => m.viewerOutcome?.outcome === 'void') ? 'void'
          : settled.every(m => m.viewerOutcome?.outcome === 'correct') ? 'won'
            : settled.some(m => m.viewerOutcome?.outcome === 'correct') ? 'part' : 'lost',
    }, results?.data);
  }

  const rows = toStandingRows(
    standings?.data.entries ?? [],
    own?.data.membershipId,
    me?.user.displayName,
  );

  const completeness = dashboard?.data.summary.predictionCompleteness;
  const deadlineAt = dashboard?.data.summary.nextFixtureDeadlineAt ?? null;
  const openQuestions = (questions?.data ?? []).filter(q => q.phase === 'open');

  // Markets in this league the member has not answered. Capped for display
  // because a four-digit badge is wider than the tab it sits on.
  const unanswered = completeness?.unanswered ?? 0;

  return (
    <LeagueOverviewScreen
      leagueId={id}
      leagueName={league.name}
      lifecycleLabel={league.lifecycleState.replace('_', ' ')}
      memberCount={league.memberCount ?? dashboard?.data.summary.activeMemberCount ?? null}
      competition={league.competitions[0]?.displayName ?? ''}
      phase={phaseFor({ complete: !!completeness?.complete, required: completeness?.required ?? 0 }, deadlineAt, now)}
      timeToLock={timeUntil(deadlineAt, now)}
      answered={nextFixture?.answered ?? 0}
      required={nextFixture?.required ?? 0}
      nextFixture={nextFixture}
      rivals={rows.slice(0, 5)}
      gap={toRivalGap(rows, standings?.data.totalActiveMembers ?? rows.length)}
      lastResult={lastResult}
      openQuestions={openQuestions.length}
      questionDeadline={openQuestions.map(q => q.deadlineAt).sort()[0] ?? null}
      unansweredBadge={unanswered > 0 ? (unanswered > 99 ? '99+' : String(unanswered)) : ''}
    />
  );
}
