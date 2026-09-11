import { redirect } from 'next/navigation';
import { HomeScreen } from '../components/home/HomeScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { competitionIdsIn, toHomeLeague, toQueueEntry } from '@/lib/home/home-data';
import type { Api } from '@/lib/api/types';
import type { LeaguesPage } from '@/lib/api/leagues';
import type { CatalogueSeason, CatalogueTeam } from '@/lib/api/catalogue';

/**
 * Home, fetched on the server.
 *
 * The four reads below are independent, so they run together rather than as the
 * waterfall of hooks this screen used to be. Only the countdown needs the
 * client, and it gets `serverTime` from the tasks response to measure against.
 */

type TaskPage = Api<'PredictionTaskPageDto'>;

/**
 * Recovers team crests the prediction-tasks feed does not carry, by walking each
 * competition to its current season's squad. Cached for an hour: a squad list
 * changes on the scale of a transfer window, not a page view.
 *
 * This whole function disappears when `PredictionTaskTeamDto` gains `code` and
 * `logoUrl`, which the backend has already fixed on its `dev` branch.
 */
async function crestsFor(competitionIds: string[]): Promise<Record<string, CatalogueTeam>> {
  const lists = await Promise.all(competitionIds.map(async id => {
    const seasons = await serverFetchOrNull<CatalogueSeason[]>(
      `/football/catalogue/competitions/${id}/seasons`, { revalidate: 3600 },
    );
    const season = seasons?.find(s => s.selectableForNewLeague) ?? seasons?.[0];
    if (!season) return [];
    return (await serverFetchOrNull<CatalogueTeam[]>(
      `/football/catalogue/seasons/${season.id}/teams`, { revalidate: 3600 },
    )) ?? [];
  }));

  const byId: Record<string, CatalogueTeam> = {};
  for (const team of lists.flat()) byId[team.id] = team;
  return byId;
}

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

  const crests = await crestsFor(competitionIdsIn(tasks.items));
  const queue = tasks.items.map(task => toQueueEntry(task, crests));

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
