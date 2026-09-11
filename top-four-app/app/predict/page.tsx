import { redirect } from 'next/navigation';
import { PredictScreen } from '../components/predict/PredictScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPages, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { openMarketCount, summaryLine, toPredictEntry, ALL_LEAGUES } from '@/lib/predict/predict-queue';
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
 */

type TaskPage = Api<'PredictionTaskPageDto'>;

/** The largest page the task feed allows, to keep the follow to few round-trips. */
const TASK_PAGE_SIZE = 100;

/** Rows rendered per request; "Show more" widens this window. */
const ROW_WINDOW = 40;

export default async function PredictPage({
  searchParams,
}: {
  searchParams: { league?: string; show?: string };
}) {
  let tasks: { items: PredictionTask[]; first: TaskPage };
  let leagues: LeaguesPage | null;

  try {
    [tasks, leagues] = await Promise.all([
      serverFetchAllPages<PredictionTask, TaskPage>(`/me/prediction-tasks?limit=${TASK_PAGE_SIZE}`),
      serverFetchOrNull<LeaguesPage>('/leagues'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/predict');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/predict');
    throw error;
  }

  const now = Date.parse(tasks.first.serverTime);
  const entries = tasks.items.map(task => toPredictEntry(task, now));

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
    show: String(shown + ROW_WINDOW),
  });

  return (
    <PredictScreen
      entries={filtered.slice(0, shown)}
      leagues={leagueOptions}
      league={selected}
      totalEntries={filtered.length}
      showMoreHref={shown < filtered.length ? `/predict?${showMoreQuery}` : null}
      openMarkets={openMarketCount(filtered)}
      summary={summaryLine(filtered, now)}
      hasLeagues={(leagues?.items.length ?? 0) > 0}
    />
  );
}
