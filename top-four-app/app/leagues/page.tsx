import { redirect } from 'next/navigation';
import { LeaguesScreen } from '../components/leagues/LeaguesScreen';
import { serverFetch, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { runningLeagueCount } from '@/lib/leagues/league-list';
import type { LeaguesPage as LeaguesPageData } from '@/lib/api/leagues';

/**
 * A Server Component: the leagues list is read-only, so it is fetched here
 * rather than after the bundle has loaded and a hook has run. The screen below
 * is a Client Component only for its filter.
 *
 * The middleware turns away a visitor with no session cookie at all. A cookie
 * that is present but no longer valid only fails here, at the API — so that is
 * caught too and sent to sign in. Letting it raise would show a 500 to someone
 * whose session simply expired.
 */
export default async function LeaguesPage() {
  let data: LeaguesPageData;
  try {
    data = await serverFetch<LeaguesPageData>('/leagues');
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/leagues');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/leagues');
    throw error;
  }

  return (
    <LeaguesScreen
      leagues={data.items}
      used={runningLeagueCount(data.items)}
      limit={data.unfinishedLeagueLimit}
    />
  );
}
