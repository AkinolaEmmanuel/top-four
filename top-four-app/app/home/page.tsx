import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { HomeScreen } from '../components/home/HomeScreen';
import {
  serverFetch, serverFetchOrNull, serverFetchAllPages, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { toHomeLeague, toQueueEntry } from '@/lib/home/home-data';
import { HomePayoffSection, HomePayoffSkeleton } from '../components/home/HomePayoff';
import type { Api } from '@/lib/api/types';
import type { PredictionTask } from '@/lib/api/predictions';
import type { LeaguesPage } from '@/lib/api/leagues';
import { queueWindow } from '@/lib/predict/queue-window';

/**
 * Home, fetched on the server.
 *
 * The four reads below are independent, so they run together rather than as the
 * waterfall of hooks this screen used to be. Only the countdown needs the
 * client, and it gets `serverTime` from the tasks response to measure against.
 *
 * This screen used to walk the competition catalogue as well, to recover team
 * crests the prediction-tasks feed did not carry. It carries them now, so that
 * walk — two extra requests per competition, on every load — is gone.
 */

type TaskPage = Api<'PredictionTaskPageDto'>;

/** The largest page the task feed allows, to keep the follow to few round-trips. */
const TASK_PAGE_SIZE = 100;

/** Queue rows Home itself shows before deferring to Predict. */
const HOME_QUEUE_ROWS = 5;

export default async function HomePage() {
  let tasks: { items: PredictionTask[]; first: TaskPage };
  let leagues: LeaguesPage;
  let unread: Api<'NotificationUnreadCountResponseDto'> | null;
  let me: Api<'CurrentAuthenticationResponseDto'> | null;

  try {
    [tasks, leagues, unread, me] = await Promise.all([
      serverFetchAllPages<PredictionTask, TaskPage>(`/me/prediction-tasks?limit=${TASK_PAGE_SIZE}&${queueWindow(Date.now())}`),
      serverFetch<LeaguesPage>('/leagues'),
      serverFetchOrNull<Api<'NotificationUnreadCountResponseDto'>>('/notifications/unread-count'),
      serverFetchOrNull<Api<'CurrentAuthenticationResponseDto'>>('/auth/me'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/home');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/home');
    throw error;
  }

  const queue = tasks.items.map(toQueueEntry);

  // Home shows the first few and links the rest to Predict; sending the whole
  // queue would serialise a season of tasks into the payload to render five.
  const shown = queue.slice(0, HOME_QUEUE_ROWS);

  return (
    <HomeScreen
      displayName={me?.user.displayName ?? ''}
      unreadCount={unread?.data?.unread ?? 0}
      todayLabel={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      queue={shown}
      queueCount={queue.length}
      leagues={leagues.items.map(toHomeLeague)}
      next={queue[0] ?? null}
      serverTime={tasks.first.serverTime}
      payoff={(
        <Suspense fallback={<HomePayoffSkeleton />}>
          <HomePayoffSection leagueIds={leagues.items.map(l => l.id)} />
        </Suspense>
      )}
    />
  );
}
