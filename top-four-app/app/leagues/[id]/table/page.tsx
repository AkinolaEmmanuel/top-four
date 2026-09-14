import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { LeagueTableScreen } from '../../../components/leagues/LeagueTableScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { LeagueContentSkeleton } from '@/app/components/leagues/LeagueContentSkeleton';
import { getLeague } from '@/lib/leagues/league-context';
import { PAGE_SIZE, ownStandingLine, toTablePage, toTableRows } from '@/lib/leagues/league-table';
import { tiebreakerOrder } from '@/lib/constants/markets';
import { pluralise } from '@/lib/format';
import type { Api } from '@/lib/api/types';

/**
 * The league table, fetched on the server.
 *
 * The page number is a search param rather than component state, so a page can
 * be linked and the back button works. It is also what the standings read is
 * given — the screen no longer re-slices rows the server already paginated.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Standings = Api<'StandingsPageResponseDto'>;
type OwnStanding = Api<'OwnStandingResponseDto'>;
type Me = Api<'CurrentAuthenticationResponseDto'>;

export default function LeagueTablePage({ params, searchParams }: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  return (
    <Suspense key={searchParams.page ?? '1'} fallback={<LeagueContentSkeleton rows={6} />}>
      <Table params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Table({ params, searchParams }: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const id = params.id;
  const requested = Number.parseInt(searchParams.page ?? '1', 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  let league: LeagueRead;
  let standings: Standings | null;
  let own: OwnStanding | null;
  let me: Me | null;

  try {
    [league, standings, own, me] = await Promise.all([
      getLeague(id),
      serverFetchOrNull<Standings>(`/leagues/${id}/standings?page=${page}&pageSize=${PAGE_SIZE}`),
      serverFetchOrNull<OwnStanding>(`/leagues/${id}/standings/me`),
      serverFetchOrNull<Me>('/auth/me'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/table`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/table`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const totalMembers = standings?.data.totalActiveMembers ?? 0;
  const rows = toTableRows(standings?.data.entries ?? [], own?.data.membershipId, me?.user.displayName);
  const ownLine = ownStandingLine(own?.data ?? null, totalMembers);

  // Competition ids only mean something to a member once they have a name.
  const competitionNames = new Map(
    league.competitions.map(c => [c.supportedCompetitionId, c.displayName]),
  );

  return (
    <LeagueTableScreen
      leagueId={id}
      leagueName={league.name}
      table={toTablePage(rows, page, totalMembers)}
      competitionNames={competitionNames}
      ownPosition={ownLine.position}
      ownCaption={ownLine.caption}
      ownPoints={own ? pluralise(own.data.totalPoints, 'pt') : 'No points yet'}
      tiebreakers={tiebreakerOrder(league.ruleset?.tiebreakers ?? [])}
      isFinal={league.lifecycleState === 'completed'}
    />
  );
}
