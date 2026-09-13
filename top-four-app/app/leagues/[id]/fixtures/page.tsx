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
import { MARKET_LABELS } from '@/lib/constants/markets';
import { landedScoreFor } from '@/lib/predict/fixture-predict';

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
 * How far ahead "Upcoming" looks, in days.
 *
 * The design's header reads "Round 3" over four fixtures; ours read the whole
 * season — 494 rows, forty at a time. A round is the wrong unit here because
 * this league runs two competitions at once, so a single week holds Premier
 * League round 5 and Champions League league-stage 2 together; scoping by
 * `roundId` would silently hide one of them. A week holds both.
 *
 * "Show more" widens this rather than adding rows, so the count above the list
 * and the rows beneath it always describe the same span of football.
 */
const UPCOMING_DAYS = 7;

/** Rows rendered per request, so one very busy week cannot produce a huge document. */
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

/**
 * Which markets actually landed, named.
 *
 * The results row has a 330px column for this and it rendered a dash on every
 * row, because nothing ever set it — the batch read was already being made for
 * the score and the points, and this was the third thing in it.
 */
function landedIn(result: FixtureResultsResponse): string | null {
  const correct = result.markets.filter(m => m.viewerOutcome?.outcome === 'correct');
  if (correct.length === 0) return null;
  const names = correct.map(m => (m.marketType === 'lineup' && m.side
    ? `${m.side} lineup`
    : MARKET_LABELS[m.marketType] ?? m.marketType).toLowerCase());
  // Two names read as a sentence; more than that is a list nobody reads.
  return names.length <= 2
    ? names.join(' · ')
    : `${names.slice(0, 2).join(' · ')} +${names.length - 2} more`;
}

function outcomeOf(result: FixtureResultsResponse | undefined): Pick<LeagueFixture, 'score' | 'pointsAwarded' | 'predictionState' | 'landed'> {
  if (!result) return {};
  const settled = result.markets.filter(m => m.viewerOutcome !== null);
  const exact = result.markets.find(m => m.marketType === 'exact_score');
  const score = landedScoreFor(exact?.resolvedAnswer);

  return {
    score: score ? { home: score[0], away: score[1] } : undefined,
    pointsAwarded: settled.length > 0
      ? settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta ?? 0), 0)
      : undefined,
    landed: landedIn(result),
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

/** How many weeks of upcoming fixtures to read. Clamped so the URL cannot ask for a season. */
function requestedWeeks(weeks: string | undefined): number {
  const asked = Number.parseInt(weeks ?? '', 10);
  return Number.isFinite(asked) && asked > 0 ? Math.min(asked, 12) : 1;
}

/**
 * An ISO instant the API will accept.
 *
 * Its `from`/`to` are validated against an explicit-timezone pattern that
 * rejects the six-digit fractional seconds some clocks produce, so the instant
 * is trimmed to whole seconds rather than passed straight from `toISOString`.
 */
function boundary(atMs: number): string {
  return new Date(atMs).toISOString().replace(/\.\d+Z$/, 'Z');
}

/**
 * Reads the two halves of this screen separately, each as its own window.
 *
 * Availability now takes a kickoff window, so neither half has to page through
 * the season to find itself. Before this the screen walked the whole ordered
 * list from August — about five serial round trips to draw one round.
 *
 * The played half is read whole because it is small. The upcoming half is a
 * week, and only when it is the half on screen.
 *
 * One caveat worth knowing: the API excludes fixtures whose kickoff is not yet
 * known from a windowed read, so a fixture awaiting a confirmed time appears in
 * neither half. It is counted in the "further on" figure, which comes from the
 * dashboard's season total rather than from either window.
 */
async function readWindow(
  leagueId: string,
  from: string | null,
  to: string | null,
  maxPages: number,
): Promise<{ items: FixtureAvailability[]; truncated: boolean }> {
  const items: FixtureAvailability[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    const url: string = `/leagues/${leagueId}/fixtures/availability?limit=${AVAILABILITY_PAGE_SIZE}`
      + (from ? `&from=${encodeURIComponent(from)}` : '')
      + (to ? `&to=${encodeURIComponent(to)}` : '')
      + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const response = await serverFetch<{ data: FixtureAvailability[]; nextCursor: string | null }>(url);
    items.push(...response.data);
    cursor = response.nextCursor;
    if (!cursor) break;
  }

  return { items, truncated: cursor !== null };
}

export default function LeagueFixturesPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string; show?: string; filter?: string; weeks?: string };
}) {
  return (
    <Suspense key={`${searchParams.view ?? ''}:${searchParams.filter ?? ''}:${searchParams.show ?? ''}:${searchParams.weeks ?? ''}`} fallback={<LeagueContentSkeleton rows={6} />}>
      <Fixtures params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Fixtures({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string; show?: string; filter?: string; weeks?: string };
}) {
  const id = params.id;

  /* Which half to read. "either" means the URL did not say, and the answer
     depends on what comes back — so the read has to cover both. */
  const view: FixtureView | 'either' = searchParams.view === 'results' ? 'results'
    : searchParams.view === 'upcoming' ? 'upcoming' : 'either';

  const nowMs = Date.now();
  const now = boundary(nowMs);
  const weeks = requestedWeeks(searchParams.weeks);
  const horizonEnd = boundary(nowMs + weeks * UPCOMING_DAYS * 24 * 60 * 60 * 1000);

  let league: LeagueRead;
  let dashboard: Dashboard | null;
  let played: { items: FixtureAvailability[]; truncated: boolean };
  let upcoming: { items: FixtureAvailability[]; truncated: boolean };

  try {
    [league, dashboard, played, upcoming] = await Promise.all([
      getLeague(id),
      getLeagueDashboard(id),
      // Always: small, complete, and the exact size is what makes both counts true.
      readWindow(id, null, now, MAX_PAGES),
      // Only when it is the half on screen, and then one page is enough — the
      // window starts at now and the list is ordered by kickoff.
      // A week ahead, not the rest of the season. Two pages is ample for any
      // real week and keeps a pathological one from hanging the screen.
      view === 'results'
        ? Promise.resolve({ items: [], truncated: false })
        : readWindow(id, now, horizonEnd, 2),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/fixtures`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/fixtures`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const base: LeagueFixture[] = [...played.items, ...upcoming.items].map(f => ({
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

  const fixtures = base.map(f => {
    const outcome = outcomeOf(byFixture.get(f.id));
    /*
     * "Awaiting result" and "you did not answer" are different sentences.
     *
     * Both arrive as an empty set of viewer outcomes, and the row used to say
     * pending for both — telling a member to wait for a result that could never
     * involve them. Whether they answered is the fact that separates the two,
     * and settlement state does not: a fixture can sit part-settled for days
     * while two markets wait on player data, and if the member answered nothing
     * none of that will ever score for them.
     */
    const missed = f.status === 'finished' && (f.answered ?? 0) === 0;
    return {
      ...f,
      ...outcome,
      predictionState: outcome.predictionState ?? (missed ? 'missed' as const : undefined),
    };
  });
  const split = splitFixtures(fixtures);

  // Opens on whichever half has something in it — a league whose fixtures have
  // all been played should not open on an empty "Upcoming".
  const shownView: FixtureView = view === 'either'
    ? (split.upcoming.length > 0 ? 'upcoming' : 'results')
    : view;

  const filter: FixtureFilter = FIXTURE_FILTERS.some(f => f.id === searchParams.filter)
    ? searchParams.filter as FixtureFilter
    : 'all';

  const inView = shownView === 'upcoming' ? split.upcoming : split.results;
  // Counted over the window that is on screen, so a chip's number and the rows
  // beneath it describe the same span.
  const filterCounts = Object.fromEntries(FIXTURE_FILTERS.map(f =>
    [f.id, split.upcoming.filter(x => matchesFilter(x.predictionState, f.id)).length])) as Record<FixtureFilter, number>;
  const all = shownView === 'upcoming' ? inView.filter(f => matchesFilter(f.predictionState, filter)) : inView;
  const requested = Number.parseInt(searchParams.show ?? '', 10);
  const shown = Number.isFinite(requested) && requested > 0
    ? Math.min(requested, all.length)
    : Math.min(ROW_WINDOW, all.length);

  return (
    <LeagueFixturesScreen
      leagueId={id}
      leagueName={league.name}
      competition={league.competitions[0]?.displayName ?? ''}
      view={shownView}
      filter={filter}
      filterCounts={filterCounts}
      rows={all.slice(0, shown).map(f => toFixtureRow(f, id, shownView))}
      counts={{
        // Both counts describe what is actually on screen. Upcoming used to be
        // the season's remainder — a four-figure number over a page of rows,
        // which said nothing about the week it was sitting above.
        results: split.results.length,
        upcoming: split.upcoming.length,
      }}
      horizon={{
        weeks,
        // What the window is leaving out, so widening it is an informed choice
        // rather than a guess at whether anything is there.
        beyond: Math.max(
          0,
          (dashboard?.data.summary.fixtureCount ?? 0) - split.results.length - split.upcoming.length,
        ),
      }}
      /* Two different "more"s. While rows remain inside the window it widens the
         page; once they are exhausted it widens the window itself, which is what
         a member wanting next week actually means. */
      showMoreHref={shown < all.length
        ? `/leagues/${id}/fixtures?view=${shownView}&filter=${filter}&show=${shown + ROW_WINDOW}`
        : shownView === 'upcoming' && weeks < 12
          ? `/leagues/${id}/fixtures?view=${shownView}&filter=${filter}&weeks=${weeks + 1}`
          : null}
    />
  );
}
