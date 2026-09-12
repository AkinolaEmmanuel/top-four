import { redirect } from 'next/navigation';
import { PredictScreen } from '../components/predict/PredictScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPages, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import {
  openMarketCount, summaryLine, toPredictEntry, byDeadline, ALL_LEAGUES,
} from '@/lib/predict/predict-queue';
import type { Api } from '@/lib/api/types';
import type { PredictionTask } from '@/lib/api/predictions';
import type { LeaguesPage } from '@/lib/api/leagues';

/**
 * The to-do list, fetched on the server.
 *
 * Both reads are independent. `serverTime` from the tasks response is the clock
 * everything is measured against — which bucket a deadline falls in, and whether
 * it counts as urgent — so a device with a wrong clock cannot move a fixture
 * between sections.
 *
 * The feed now takes a deadline window, so the read is the week rather than the
 * season — 7 tasks instead of 470. The headline is the sum of what comes back,
 * which is the same figure the leagues list shows per league over the same
 * window; before the window existed the client scoped it after the fact and the
 * whole season still crossed the wire to produce it.
 *
 * "Show more" widens the window by a week rather than adding rows, so the
 * number above the queue and the rows beneath it always describe one span.
 */

type TaskPage = Api<'PredictionTaskPageDto'>;

/** The largest page the task feed allows, to keep the follow to few round-trips. */
const TASK_PAGE_SIZE = 100;

/** How far ahead the queue looks by default. */
const QUEUE_DAYS = 7;

/** A ceiling, so the URL cannot ask for the season back. */
const MAX_WEEKS = 12;

/** Whole seconds: the API validates both boundaries against a strict pattern. */
function boundary(atMs: number): string {
  return new Date(atMs).toISOString().replace(/\.\d+Z$/, 'Z');
}

/** Rows rendered per request; "Show more" widens this window. */
const ROW_WINDOW = 40;

export default async function PredictPage({
  searchParams,
}: {
  searchParams: { league?: string; show?: string; weeks?: string };
}) {
  let tasks: { items: PredictionTask[]; first: TaskPage };
  let leagues: LeaguesPage | null;

  const askedWeeks = Number.parseInt(searchParams.weeks ?? '', 10);
  const weeks = Number.isFinite(askedWeeks) && askedWeeks > 0 ? Math.min(askedWeeks, MAX_WEEKS) : 1;
  const now = Date.now();
  const window = `from=${encodeURIComponent(boundary(now))}`
    + `&to=${encodeURIComponent(boundary(now + weeks * QUEUE_DAYS * 24 * 60 * 60 * 1000))}`;

  try {
    [tasks, leagues] = await Promise.all([
      serverFetchAllPages<PredictionTask, TaskPage>(`/me/prediction-tasks?limit=${TASK_PAGE_SIZE}&${window}`),
      serverFetchOrNull<LeaguesPage>('/leagues'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/predict');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/predict');
    throw error;
  }

  const serverNow = Date.parse(tasks.first.serverTime);
  const entries = tasks.items.map(task => toPredictEntry(task, serverNow)).sort(byDeadline);

  const leagueOptions = Array.from(
    new Map(entries.map(e => [e.leagueId, e.leagueName])).entries(),
  ).map(([id, name]) => ({ id, name }));

  // Matches on the league's id rather than a name prefix — two leagues can
  // share the start of a name. An unknown id falls back to showing everything.
  const selected = searchParams.league && leagueOptions.some(l => l.id === searchParams.league)
    ? searchParams.league
    : ALL_LEAGUES;
  const filtered = selected === ALL_LEAGUES ? entries : entries.filter(e => e.leagueId === selected);

  const requested = Number.parseInt(searchParams.show ?? '', 10);
  const shown = Number.isFinite(requested) && requested > 0
    ? Math.min(requested, filtered.length)
    : Math.min(ROW_WINDOW, filtered.length);

  const showMoreQuery = new URLSearchParams({
    ...(selected === ALL_LEAGUES ? {} : { league: selected }),
    ...(weeks > 1 ? { weeks: String(weeks) } : {}),
    show: String(shown + ROW_WINDOW),
  });

  /* Two different "more"s, as on the league fixtures list: more rows while the
     window still holds some, then a wider window once it does not. */
  const widerQuery = new URLSearchParams({
    ...(selected === ALL_LEAGUES ? {} : { league: selected }),
    weeks: String(weeks + 1),
  });


  return (
    <PredictScreen
      entries={filtered.slice(0, shown)}
      leagues={leagueOptions}
      league={selected}
      totalEntries={filtered.length}
      showMoreHref={shown < filtered.length
        ? `/predict?${showMoreQuery}`
        : weeks < MAX_WEEKS ? `/predict?${widerQuery}` : null}
      weeks={weeks}
      openMarkets={openMarketCount(filtered)}
      summary={summaryLine(filtered, serverNow)}
      hasLeagues={(leagues?.items.length ?? 0) > 0}
    />
  );
}
