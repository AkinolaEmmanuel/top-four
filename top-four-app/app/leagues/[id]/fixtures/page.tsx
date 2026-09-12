import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { LeagueFixturesScreen } from '../../../components/leagues/LeagueFixturesScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPages, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { LeagueContentSkeleton } from '@/app/components/leagues/LeagueContentSkeleton';
import { getLeague, getLeagueDashboard } from '@/lib/leagues/league-context';
import { splitFixtures, toFixtureRow, matchesFilter, FIXTURE_FILTERS, type FixtureView, type FixtureFilter } from '@/lib/leagues/league-fixtures';
import type { Api } from '@/lib/api/types';
import type { LeagueFixture } from '@/lib/api/leagues';
import type { FixtureAvailability, FixtureResultsResponse } from '@/lib/api/predictions-fixture';

/**
 * The league fixtures list, fetched on the server.
 *
 * Availability describes every fixture's markets but never their outcome, so a
 * played fixture's score and points come from the results read. That is one
 * batched call for all of them — it used to be one call per finished fixture.
 *
 * Availability is paginated, and every page of it is read: the Upcoming and
 * Results counts are counts of the league, not of the first twenty rows.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Dashboard = Api<'LeagueDashboardResponseDto'>;
type ResultsBatch = Api<'MemberFixtureResultsBatchResponseDto'>;

/**
 * The largest page the availability endpoint allows. A season across two
 * competitions is a few hundred fixtures, so this keeps the paginated read to a
 * handful of round-trips rather than tens of them.
 */
const AVAILABILITY_PAGE_SIZE = 100;

/**
 * Rows rendered per request. The counts above the list are the league's whole
 * truth, but a season is several hundred fixtures and rendering them all at
 * once produced a multi-megabyte document; "Show more" widens this window.
 */
const ROW_WINDOW = 40;

/** A ceiling, so a cursor that never terminates cannot hang the screen. */
const MAX_PAGES = 10;

/** The batch results endpoint accepts fifty ids per call and rejects more. */
const RESULTS_BATCH_SIZE = 50;

const PLAYED_STATES = ['finished', 'awarded', 'walkover'];
const VOIDED_STATES = ['postponed', 'cancelled', 'abandoned'];
const LIVE_STATES = ['live', 'suspended', 'interrupted', 'under_review'];

function statusOf(fixtureState: string): LeagueFixture['status'] {
  if (PLAYED_STATES.includes(fixtureState)) return 'finished';
  if (VOIDED_STATES.includes(fixtureState)) return 'voided';
  if (LIVE_STATES.includes(fixtureState)) return 'live';
  return 'upcoming';
}

function outcomeOf(result: FixtureResultsResponse | undefined): Pick<LeagueFixture, 'score' | 'pointsAwarded' | 'predictionState'> {
  if (!result) return {};
  const settled = result.markets.filter(m => m.viewerOutcome !== null);
  const exact = result.markets.find(m => m.marketType === 'exact_score');
  const resolved = exact?.resolvedAnswer as { homeGoals?: number; awayGoals?: number } | null | undefined;

  return {
    score: typeof resolved?.homeGoals === 'number' && typeof resolved?.awayGoals === 'number'
      ? { home: resolved.homeGoals, away: resolved.awayGoals }
      : undefined,
    pointsAwarded: settled.length > 0
      ? settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta ?? 0), 0)
      : undefined,
    predictionState: settled.length === 0 ? undefined
      : settled.every(m => m.viewerOutcome?.outcome === 'void') ? 'void'
        : settled.every(m => m.viewerOutcome?.outcome === 'correct') ? 'won'
          : settled.some(m => m.viewerOutcome?.outcome === 'correct') ? 'part' : 'lost',
  };
}

/** How many rows this request will draw, so the read knows when it has enough. */
function requestedRows(show: string | undefined): number {
  const requested = Number.parseInt(show ?? '', 10);
  return Number.isFinite(requested) && requested > 0 ? requested : ROW_WINDOW;
}

/**
 * Reads only as far as it has to.
 *
 * Availability is ordered by kickoff, so every played fixture sits at the front:
 * once a page holds none, the results count is final and everything beyond is
 * still to come. That plus the dashboard's own `fixtureCount` gives both counts
 * exactly, usually from a single page — following all five pages put fourteen
 * seconds of serial requests in front of the screen.
 */
async function readPlayedAndEnough(
  leagueId: string,
  rowsNeeded: number,
): Promise<{ items: FixtureAvailability[]; truncated: boolean }> {
  const items: FixtureAvailability[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const url: string = `/leagues/${leagueId}/fixtures/availability?limit=${AVAILABILITY_PAGE_SIZE}`
      + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const response = await serverFetch<{ data: FixtureAvailability[]; nextCursor: string | null }>(url);
    items.push(...response.data);
    cursor = response.nextCursor;

    // The played ones are a prefix, so they have run out as soon as a page
    // *ends* on one that is not played — not merely when a page contains none.
    const last = response.data.at(-1);
    const playedRunOut = !last || !PLAYED_STATES.includes(last.fixtureState);
    if (!cursor || (playedRunOut && items.length >= rowsNeeded)) break;
  }

  return { items, truncated: cursor !== null };
}

/**
 * The chrome above this page needs only the league read; the list below needs
 * availability and then a results batch per played chunk, which is another
 * second and a half. Behind a boundary, the header and tabs paint as soon as
 * the league lands instead of waiting for the whole list.
 */
export default function LeagueFixturesPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string; show?: string; filter?: string };
}) {
  return (
    <Suspense key={`${searchParams.view ?? ''}:${searchParams.filter ?? ''}:${searchParams.show ?? ''}`} fallback={<LeagueContentSkeleton rows={6} />}>
      <Fixtures params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Fixtures({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string; show?: string; filter?: string };
}) {
  const id = params.id;

  let league: LeagueRead;
  let dashboard: Dashboard | null;
  let availability: { items: FixtureAvailability[]; truncated: boolean };

  try {
    [league, dashboard, availability] = await Promise.all([
      getLeague(id),
      getLeagueDashboard(id),
      readPlayedAndEnough(id, requestedRows(searchParams.show)),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/fixtures`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/fixtures`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const base: LeagueFixture[] = availability.items.map(f => ({
    id: f.leagueFixtureId,
    leagueId: id,
    homeTeam: f.homeTeam?.displayName || 'Home',
    homeTeamCode: f.homeTeam?.code || 'HOM',
    homeTeamLogoUrl: f.homeTeam?.logoUrl || null,
    awayTeam: f.awayTeam?.displayName || 'Away',
    awayTeamCode: f.awayTeam?.code || 'AWA',
    awayTeamLogoUrl: f.awayTeam?.logoUrl || null,
    kickoffAt: f.kickoff?.at || '',
    status: statusOf(f.fixtureState),
    markets: [],
    predictionState: f.predictionCompleteness?.complete ? 'ready' : f.hasOpenMarkets ? 'open' : undefined,
    // The two columns the design gives this table and the phone folds into one
    // line of note text: what is answered, and when the first market closes.
    answered: f.predictionCompleteness?.answered,
    required: f.predictionCompleteness?.required,
    deadlineAt: f.nextDeadlineAt ?? null,
  }));

  const playedIds = base.filter(f => f.status === 'finished').map(f => f.id);
  const chunks: string[][] = [];
  for (let i = 0; i < playedIds.length; i += RESULTS_BATCH_SIZE) {
    chunks.push(playedIds.slice(i, i + RESULTS_BATCH_SIZE));
  }

  const batches = await Promise.all(chunks.map(chunk =>
    serverFetchOrNull<ResultsBatch>(
      `/leagues/${id}/fixtures/results?${chunk.map(x => `leagueFixtureIds=${encodeURIComponent(x)}`).join('&')}`,
    )));
  const byFixture = new Map(batches.flatMap(b => b?.data ?? []).map(r => [r.leagueFixtureId, r]));

  const fixtures = base.map(f => ({ ...f, ...outcomeOf(byFixture.get(f.id)) }));
  const split = splitFixtures(fixtures);
  const unanswered = dashboard?.data.summary.predictionCompleteness.unanswered ?? 0;

  // Opens on whichever half has something in it — a league whose fixtures have
  // all been played should not open on an empty "Upcoming".
  const view: FixtureView = searchParams.view === 'results' ? 'results'
    : searchParams.view === 'upcoming' ? 'upcoming'
      : split.upcoming.length > 0 ? 'upcoming' : 'results';

  const filter: FixtureFilter = FIXTURE_FILTERS.some(f => f.id === searchParams.filter)
    ? searchParams.filter as FixtureFilter
    : 'all';

  const inView = view === 'upcoming' ? split.upcoming : split.results;
  // Counted over everything read, not over the window, so a chip's number means
  // the league rather than the slice already on screen.
  const filterCounts = Object.fromEntries(FIXTURE_FILTERS.map(f =>
    [f.id, split.upcoming.filter(x => matchesFilter(x.predictionState, f.id)).length])) as Record<FixtureFilter, number>;
  const all = view === 'upcoming' ? inView.filter(f => matchesFilter(f.predictionState, filter)) : inView;
  const requested = Number.parseInt(searchParams.show ?? '', 10);
  const shown = Number.isFinite(requested) && requested > 0
    ? Math.min(requested, all.length)
    : Math.min(ROW_WINDOW, all.length);

  return (
    <LeagueFixturesScreen
      leagueId={id}
      leagueName={league.name}
      competition={league.competitions[0]?.displayName ?? ''}
      view={view}
      filter={filter}
      filterCounts={filterCounts}
      rows={all.slice(0, shown).map(f => toFixtureRow(f, id, view))}
      counts={{
        // Results are complete because the read stops only once they run out;
        // everything else in the league is still to come.
        results: split.results.length,
        upcoming: Math.max(
          split.upcoming.length,
          (dashboard?.data.summary.fixtureCount ?? 0) - split.results.length,
        ),
      }}
      unansweredBadge={unanswered > 0 ? (unanswered > 99 ? '99+' : String(unanswered)) : ''}
      showMoreHref={shown < all.length
        ? `/leagues/${id}/fixtures?view=${view}&filter=${filter}&show=${shown + ROW_WINDOW}`
        : null}
    />
  );
}
