import { redirect } from 'next/navigation';
import { HomeScreen } from '../components/home/HomeScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { toHomeLeague, toQueueEntry } from '@/lib/home/home-data';
import type { Api } from '@/lib/api/types';
import type { LeaguesPage } from '@/lib/api/leagues';

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

export default async function HomePage() {
  let tasks: TaskPage;
  let leagues: LeaguesPage;
  let unread: Api<'NotificationUnreadCountResponseDto'> | null;
  let me: Api<'CurrentAuthenticationResponseDto'> | null;

  try {
    [tasks, leagues, unread, me] = await Promise.all([
      serverFetch<TaskPage>('/me/prediction-tasks'),
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

  return (
    <HomeScreen
      displayName={me?.user.displayName ?? ''}
      unreadCount={unread?.data?.unread ?? 0}
      todayLabel={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      queue={queue}
      leagues={leagues.items.map(toHomeLeague)}
      next={queue[0] ?? null}
      serverTime={tasks.serverTime}
    />
  );
}
