import { redirect } from 'next/navigation';
import { PredictScreen } from '../components/predict/PredictScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { openMarketCount, summaryLine, toPredictEntry } from '@/lib/predict/predict-queue';
import type { Api } from '@/lib/api/types';
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

export default async function PredictPage() {
  let tasks: TaskPage;
  let leagues: LeaguesPage | null;

  try {
    [tasks, leagues] = await Promise.all([
      serverFetch<TaskPage>('/me/prediction-tasks'),
      serverFetchOrNull<LeaguesPage>('/leagues'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/predict');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/predict');
    throw error;
  }

  const now = Date.parse(tasks.serverTime);
  const entries = tasks.items.map(task => toPredictEntry(task, now));

  return (
    <PredictScreen
      entries={entries}
      openMarkets={openMarketCount(entries)}
      summary={summaryLine(entries, now)}
      hasLeagues={(leagues?.items.length ?? 0) > 0}
    />
  );
}
