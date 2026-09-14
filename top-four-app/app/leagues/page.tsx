import { redirect } from 'next/navigation';
import { LeaguesScreen } from '../components/leagues/LeaguesScreen';
import {
  serverFetch, serverFetchAllPagesOrEmpty, NotAuthenticatedError,
} from '@/lib/api/server-fetch';
import type { Api } from '@/lib/api/types';
import { ApiError } from '@/lib/api/fetcher';
import { runningLeagueCount } from '@/lib/leagues/league-list';
import type { LeaguesPage as LeaguesPageData, OwnPendingJoinRequest } from '@/lib/api/leagues';

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
/**
 * How far ahead "To predict" looks.
 *
 * The column used to carry the season's unanswered count — 3881 in a real
 * league, capped to "99+" on screen, and useless for the question it exists to
 * answer. The windowed count is what a member can actually act on before next
 * week, and it is the same figure the Predict queue sums.
 */
const ACTIONABLE_DAYS = 7;

/** Whole seconds: the API validates the boundary against a strict pattern. */
function boundary(atMs: number): string {
  return new Date(atMs).toISOString().replace(/\.\d+Z$/, 'Z');
}

export default async function LeaguesPage() {
  const now = Date.now();
  const window = `from=${encodeURIComponent(boundary(now))}`
    + `&to=${encodeURIComponent(boundary(now + ACTIONABLE_DAYS * 24 * 60 * 60 * 1000))}`;

  let data: LeaguesPageData;
  let pending: OwnPendingJoinRequest[];
  try {
    // A pending request lives outside the leagues list — the member is not a
    // member yet — so it is a separate read, folded into the same sections.
    [data, pending] = await Promise.all([
      serverFetch<LeaguesPageData>(`/leagues?${window}`),
      serverFetchAllPagesOrEmpty<OwnPendingJoinRequest>('/me/join-requests').then(r => r.items),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect('/?redirect=/leagues');
    if (error instanceof ApiError && error.status === 401) redirect('/?redirect=/leagues');
    throw error;
  }

  return (
    <LeaguesScreen
      leagues={data.items}
      actionableDays={ACTIONABLE_DAYS}
      pendingRequests={pending}
      used={runningLeagueCount(data.items)}
      limit={data.unfinishedLeagueLimit}
    />
  );
}
