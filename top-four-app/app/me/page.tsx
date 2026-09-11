import { redirect } from 'next/navigation';
import { MeScreen } from '../components/me/MeScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { primaryLeague, toFormBars, toMeLeagueRow, totalPointsAcross } from '@/lib/me/me-data';
import type { Api } from '@/lib/api/types';
import type { LeaguesPage } from '@/lib/api/leagues';

/**
 * The account screen, fetched on the server.
 *
 * The form chart needs a league before it can be read, so that one read is
 * dependent; everything else runs together.
 */

type Me = Api<'CurrentAuthenticationResponseDto'>;
type Preferences = Api<'NotificationPreferencesResponseDto'>;
type History = Api<'PointsHistoryPageResponseDto'>;

export default async function MePage() {
  let me: Me;
  let leagues: LeaguesPage | null;
  let preferences: Preferences | null;

  try {
    [me, leagues, preferences] = await Promise.all([
      serverFetch<Me>('/auth/me'),
      serverFetchOrNull<LeaguesPage>('/leagues'),
      serverFetchOrNull<Preferences>('/me/notification-preferences'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/me');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/me');
    throw error;
  }

  const items = leagues?.items ?? [];
  const chartLeague = primaryLeague(items);

  const history = chartLeague
    ? await serverFetchOrNull<History>(`/leagues/${chartLeague.id}/standings/me/history?limit=40`)
    : null;

  return (
    <MeScreen
      displayName={me.user.displayName}
      email={me.user.email}
      emailVerified={me.user.emailVerified}
      hasGoogle={me.signInMethods.includes('google')}
      leagues={items.map(toMeLeagueRow)}
      totalPoints={totalPointsAcross(items)}
      form={toFormBars(history?.data ?? [])}
      formLeagueName={chartLeague?.name ?? null}
      preferences={{
        // Both default on, which is what the API does for an account that has
        // never changed them.
        roundReminder: preferences?.data.round_reminder ?? true,
        customQuestionAdmin: preferences?.data.custom_question_admin ?? true,
      }}
    />
  );
}
