import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { LeagueOverviewScreen } from '../../components/leagues/LeagueOverviewScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPages, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { LeagueEndStateScreen, type EndState } from '../../components/leagues/LeagueEndStateScreen';
import { MARKET_LABELS } from '@/lib/constants/markets';
import { ordinal } from '@/lib/format';
import { LeagueContentSkeleton } from '@/app/components/leagues/LeagueContentSkeleton';
import { getLeague, getLeagueDashboard } from '@/lib/leagues/league-context';
import {
  phaseFor, timeUntil, toLastResult, toNeighbourhood, toRivalGap, toStandingRows,
  type LastResult, type NextFixture,
} from '@/lib/leagues/league-overview';
import type { Api } from '@/lib/api/types';
import type { CustomQuestion } from '@/lib/api/custom-questions';
import type { PredictionTask } from '@/lib/api/predictions';
import type { FixtureAvailability, FixtureResultsResponse } from '@/lib/api/predictions-fixture';
import { landedScoreFor } from '@/lib/predict/fixture-predict';

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
type AvailabilityPage = { data: FixtureAvailability[]; nextCursor: string | null };


/**
 * The largest page the availability endpoint allows. A season across two
 * competitions is a few hundred fixtures, so this keeps the paginated read to a
 * handful of round-trips rather than tens of them.
 */
const AVAILABILITY_PAGE_SIZE = 100;

/**
 * How far forward to look for the fixture the member is being sent to.
 * Its deadline derives from its kickoff, so the next task is always among the
 * soonest few; twenty is slack, not a guess at the season.
 */
const NEXT_WINDOW = 20;

/** Whole seconds with an explicit zone — the API rejects anything else. */
function boundary(atMs: number): string {
  return new Date(atMs).toISOString().replace(/\.\d+Z$/, 'Z');
}

/** Likewise for the cross-league task feed. */
const TASK_PAGE_SIZE = 100;

export default function LeagueOverviewPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LeagueContentSkeleton rows={4} />}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let dashboard: Dashboard | null;
  let standings: Standings | null;
  let own: OwnStanding | null;
  let tasks: TaskPage | null;
  let questions: { items: CustomQuestion[] };
  let upcoming: AvailabilityPage | null;
  let played: AvailabilityPage | null;
  let me: Me | null;

  try {
    [league, dashboard, standings, own, tasks, questions, upcoming, played, me] = await Promise.all([
      getLeague(id),
      getLeagueDashboard(id),
      serverFetchOrNull<Standings>(`/leagues/${id}/standings?page=1&pageSize=50`),
      serverFetchOrNull<OwnStanding>(`/leagues/${id}/standings/me`),
      // One page: this screen only needs the soonest task for this league, and
      // the feed is ordered by deadline. Following every page cost four extra
      // serial round-trips to answer a question page one already answers.
      serverFetchOrNull<TaskPage>(`/me/prediction-tasks?limit=${TASK_PAGE_SIZE}`),
      serverFetchAllPages<CustomQuestion, Questions>(`/leagues/${id}/custom-questions`),
      // Two windows rather than the season's first hundred rows. That read was
      // also quietly wrong: ordered by kickoff, the earliest hundred are mostly
      // played ones, so in a league with a hundred results behind it the next
      // fixture was not in them and the hero lost its kickoff and its progress.
      serverFetchOrNull<AvailabilityPage>(
        `/leagues/${id}/fixtures/availability?limit=${NEXT_WINDOW}&from=${encodeURIComponent(boundary(Date.now()))}`),
      serverFetchOrNull<AvailabilityPage>(
        `/leagues/${id}/fixtures/availability?limit=${AVAILABILITY_PAGE_SIZE}&to=${encodeURIComponent(boundary(Date.now()))}`),
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
    ? upcoming?.data.find(f => f.leagueFixtureId === nextTask.leagueFixtureId)
    : undefined;

  const nextFixture: NextFixture | null = nextTask?.kind === 'fixture' ? {
    leagueFixtureId: nextTask.leagueFixtureId,
    homeName: nextTask.homeTeam.displayName,
    homeCode: nextTask.homeTeam.code || nextTask.homeTeam.displayName.substring(0, 3).toUpperCase(),
    awayName: nextTask.awayTeam.displayName,
    awayCode: nextTask.awayTeam.code || nextTask.awayTeam.displayName.substring(0, 3).toUpperCase(),
    homeLogo: nextTask.homeTeam.logoUrl,
    awayLogo: nextTask.awayTeam.logoUrl,
    kickoffAt: nextAvailability?.kickoff?.at ?? null,
    answered: nextAvailability?.predictionCompleteness?.answered ?? 0,
    required: nextAvailability?.predictionCompleteness?.required ?? 0,
  } : null;

  // The most recently played fixture, and how the member scored on it. One
  // extra read, for the per-market breakdown the availability feed does not carry.
  const lastFinished = (played?.data ?? [])
    .filter(f => ['finished', 'awarded', 'walkover'].includes(f.fixtureState))
    .sort((a, b) => Date.parse(b.kickoff?.at ?? '') - Date.parse(a.kickoff?.at ?? ''))[0];

  let lastResult: LastResult | null = null;
  if (lastFinished) {
    const results = await serverFetchOrNull<{ data: FixtureResultsResponse }>(
      `/leagues/${id}/fixtures/${lastFinished.leagueFixtureId}/results`,
    );
    const settled = (results?.data.markets ?? []).filter(m => m.viewerOutcome !== null);
    const exact = results?.data.markets.find(m => m.marketType === 'exact_score');
    const score = landedScoreFor(exact?.resolvedAnswer);

    lastResult = toLastResult({
      leagueFixtureId: lastFinished.leagueFixtureId,
      homeTeam: lastFinished.homeTeam.displayName,
      awayTeam: lastFinished.awayTeam.displayName,
      homeTeamCode: lastFinished.homeTeam.code || 'HOM',
      awayTeamCode: lastFinished.awayTeam.code || 'AWA',
      homeTeamLogoUrl: lastFinished.homeTeam.logoUrl ?? null,
      awayTeamLogoUrl: lastFinished.awayTeam.logoUrl ?? null,
      score: score ? { home: score[0], away: score[1] } : undefined,
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
  /*
   * The clock the hero shows must belong to the fixture the hero names.
   *
   * It counted down to the dashboard's next lock, which is the league's soonest
   * deadline whatever it belongs to — including a fixture already fully
   * answered, which has no task and so is never the one named. That put
   * "4h 29m until Brentford v Chelsea closes" on screen while Brentford v
   * Chelsea was four days out. The named fixture's own deadline wins; the
   * league-wide one is the fallback for when nothing is outstanding.
   */
  const deadlineAt = (nextTask?.kind === 'fixture' ? nextTask.nextDeadlineAt : null)
    ?? dashboard?.data.summary.nextFixtureDeadlineAt
    ?? null;
  const openQuestions = questions.items.filter(q => q.phase === 'open');

  // Markets in this league the member has not answered. Capped for display
  // because a four-digit badge is wider than the tab it sits on.

  /* A league that is over does not get the live Overview: its hero counts down
     to a lock that will never come and offers a button for markets that closed
     weeks ago. What changed is what the screen says happened, not what it lets
     you do — everything stays readable. */
  const ENDED: Record<string, EndState> = {
    completed: 'completed', cancelled: 'cancelled', archived: 'archived',
  };
  const endState = ENDED[league.lifecycleState];
  if (endState) {
    const mine = own?.data;
    return (
      <LeagueEndStateScreen
        leagueId={id}
        state={endState}
        ownPosition={mine?.position ? ordinal(mine.position) : null}
        ownPoints={mine?.totalPoints ?? null}
        memberCount={dashboard?.data.summary.activeMemberCount ?? league.memberCount}
        fixtureCount={dashboard?.data.summary.fixtureCount ?? 0}
        questionCount={questions.items.length}
      />
    );
  }

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
      rivals={toNeighbourhood(rows)}
      gap={toRivalGap(rows, standings?.data.totalActiveMembers ?? rows.length)}
      lastResult={lastResult}
      openQuestions={openQuestions.length}
      questionDeadline={openQuestions.map(q => q.deadlineAt).sort()[0] ?? null}
      marketRules={league.scoring.markets.map(m => ({
        label: MARKET_LABELS[m.marketType] ?? m.marketType,
        points: m.maximumPoints,
      }))}
    />
  );
}
