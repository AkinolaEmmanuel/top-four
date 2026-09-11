import { notFound, redirect } from 'next/navigation';
import { LeagueFixturesScreen } from '../../../components/leagues/LeagueFixturesScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { splitFixtures, toFixtureRow } from '@/lib/leagues/league-fixtures';
import type { Api } from '@/lib/api/types';
import type { LeagueFixture } from '@/lib/api/leagues';
import type { FixtureAvailability, FixtureResultsResponse } from '@/lib/api/predictions-fixture';

/**
 * The league fixtures list, fetched on the server.
 *
 * Availability describes every fixture's markets but never their outcome, so a
 * played fixture's score and points come from the results read. That is one
 * batched call for all of them — it used to be one call per finished fixture.
 */

type LeagueRead = Api<'LeagueReadResponseDto'>;
type Dashboard = Api<'LeagueDashboardResponseDto'>;
type AvailabilityPage = { data: FixtureAvailability[]; nextCursor: string | null };
type ResultsBatch = Api<'MemberFixtureResultsBatchResponseDto'>;

const PLAYED_STATES = ['finished', 'awarded', 'walkover'];
const VOIDED_STATES = ['postponed', 'cancelled', 'abandoned'];
const LIVE_STATES = ['live', 'suspended', 'interrupted', 'under_review'];

function statusOf(fixtureState: string): LeagueFixture['status'] {
  if (PLAYED_STATES.includes(fixtureState)) return 'finished';
  if (VOIDED_STATES.includes(fixtureState)) return 'voided';
  if (LIVE_STATES.includes(fixtureState)) return 'live';
  return 'upcoming';
}

function outcomeOf(result: FixtureResultsResponse | undefined): Pick<LeagueFixture, 'score' | 'pointsAwarded' | 'predictionState'> {
  if (!result) return {};
  const settled = result.markets.filter(m => m.viewerOutcome !== null);
  const exact = result.markets.find(m => m.marketType === 'exact_score');
  const resolved = exact?.resolvedAnswer as { homeGoals?: number; awayGoals?: number } | null | undefined;

  return {
    score: typeof resolved?.homeGoals === 'number' && typeof resolved?.awayGoals === 'number'
      ? { home: resolved.homeGoals, away: resolved.awayGoals }
      : undefined,
    pointsAwarded: settled.length > 0
      ? settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta ?? 0), 0)
      : undefined,
    predictionState: settled.length === 0 ? undefined
      : settled.every(m => m.viewerOutcome?.outcome === 'void') ? 'void'
        : settled.every(m => m.viewerOutcome?.outcome === 'correct') ? 'won'
          : settled.some(m => m.viewerOutcome?.outcome === 'correct') ? 'part' : 'lost',
  };
}

export default async function LeagueFixturesPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let league: LeagueRead;
  let dashboard: Dashboard | null;
  let availability: AvailabilityPage | null;

  try {
    [league, dashboard, availability] = await Promise.all([
      serverFetch<LeagueRead>(`/leagues/${id}`),
      serverFetchOrNull<Dashboard>(`/leagues/${id}/dashboard`),
      serverFetchOrNull<AvailabilityPage>(`/leagues/${id}/fixtures/availability`),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=/leagues/${id}/fixtures`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=/leagues/${id}/fixtures`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const base: LeagueFixture[] = (availability?.data ?? []).map(f => ({
    id: f.leagueFixtureId,
    leagueId: id,
    homeTeam: f.homeTeam?.displayName || 'Home',
    homeTeamCode: f.homeTeam?.code || 'HOM',
    homeTeamLogoUrl: f.homeTeam?.logoUrl || null,
    awayTeam: f.awayTeam?.displayName || 'Away',
    awayTeamCode: f.awayTeam?.code || 'AWA',
    awayTeamLogoUrl: f.awayTeam?.logoUrl || null,
    kickoffAt: f.kickoff?.at || '',
    status: statusOf(f.fixtureState),
    markets: [],
    predictionState: f.predictionCompleteness?.complete ? 'ready' : f.hasOpenMarkets ? 'open' : undefined,
  }));

  const playedIds = base.filter(f => f.status === 'finished').map(f => f.id);
  const batch = playedIds.length > 0
    ? await serverFetchOrNull<ResultsBatch>(
      `/leagues/${id}/fixtures/results?${playedIds.map(x => `leagueFixtureIds=${encodeURIComponent(x)}`).join('&')}`,
    )
    : null;
  const byFixture = new Map((batch?.data ?? []).map(r => [r.leagueFixtureId, r]));

  const fixtures = base.map(f => ({ ...f, ...outcomeOf(byFixture.get(f.id)) }));
  const split = splitFixtures(fixtures);
  const unanswered = dashboard?.data.summary.predictionCompleteness.unanswered ?? 0;

  return (
    <LeagueFixturesScreen
      leagueId={id}
      leagueName={league.name}
      competition={league.competitions[0]?.displayName ?? ''}
      upcoming={split.upcoming.map(f => toFixtureRow(f, id, 'upcoming'))}
      results={split.results.map(f => toFixtureRow(f, id, 'results'))}
      counts={{ upcoming: split.upcoming.length, results: split.results.length }}
      unansweredBadge={unanswered > 0 ? (unanswered > 99 ? '99+' : String(unanswered)) : ''}
    />
  );
}
