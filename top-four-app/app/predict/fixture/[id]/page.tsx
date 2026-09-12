import { notFound, redirect } from 'next/navigation';
import { FixturePredictScreen } from '../../../components/predict/FixturePredictScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import {
  fixturePhaseOf, hydrateAnswers, pointsAtStake, pointsEarned, toFixtureMarkets,
} from '@/lib/predict/fixture-predict';
import type { Api } from '@/lib/api/types';
import type { LeaguesPage } from '@/lib/api/leagues';
import type {
  FixtureAvailability, FixtureResultsResponse, OwnFixturePredictions,
  SelectablePlayer, SnapshotRef,
} from '@/lib/api/predictions-fixture';

/**
 * Fixture Predict, fetched on the server.
 *
 * This screen used to run six hooks and hand two platform twins a bag of
 * untyped props carrying their own CSS. Everything below is read once here and
 * passed as typed domain objects; the screen owns only the answers in flight.
 */

type Availability = { data: FixtureAvailability; serverTime: string };
type Predictions = { data: OwnFixturePredictions };
type Players = { data: { snapshot: SnapshotRef | null; players: SelectablePlayer[] } };
type Results = { data: FixtureResultsResponse };

export default async function FixturePredictPage({ params, searchParams }: {
  params: { id: string };
  searchParams: { leagueId?: string };
}) {
  const fixtureId = params.id;
  const leagueId = searchParams.leagueId ?? '';
  const here = `/predict/fixture/${fixtureId}?leagueId=${leagueId}`;

  // Without a league there is no ruleset, no prices and nothing to submit
  // against: the fixture only exists inside one.
  if (!leagueId) notFound();

  let availability: Availability;
  let predictions: Predictions | null;
  let players: Players | null;
  let results: Results | null;
  let league: Api<'LeagueReadResponseDto'> | null;
  let leagues: LeaguesPage | null;

  try {
    [availability, predictions, players, results, league, leagues] = await Promise.all([
      serverFetch<Availability>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`),
      serverFetchOrNull<Predictions>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/me`),
      serverFetchOrNull<Players>(`/leagues/${leagueId}/fixtures/${fixtureId}/selectable-players?limit=200`),
      serverFetchOrNull<Results>(`/leagues/${leagueId}/fixtures/${fixtureId}/results`),
      serverFetchOrNull<Api<'LeagueReadResponseDto'>>(`/leagues/${leagueId}`),
      serverFetchOrNull<LeaguesPage>('/leagues'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=${encodeURIComponent(here)}`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=${encodeURIComponent(here)}`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const fixture = availability.data;
  const homeName = fixture.homeTeam.displayName;
  const awayName = fixture.awayTeam.displayName;
  const homeCode = fixture.homeTeam.code || homeName.substring(0, 3).toUpperCase();
  const awayCode = fixture.awayTeam.code || awayName.substring(0, 3).toUpperCase();

  const answers = hydrateAnswers(predictions?.data ?? null);
  const marketResults = results?.data.markets ?? [];

  const markets = toFixtureMarkets({
    availability: fixture,
    ruleset: league?.ruleset ?? null,
    predictions: predictions?.data ?? null,
    results: marketResults,
    answers,
    homeName,
    awayName,
    homeCode,
    awayCode,
    players: players?.data.players ?? [],
  });

  // Every other league the member is actively in. The copy endpoint decides for
  // itself which of them hold this match — it takes no target list.
  const otherLeagues = (leagues?.items ?? []).filter(l => l.id !== leagueId).length;

  return (
    <FixturePredictScreen
      leagueId={leagueId}
      fixtureId={fixtureId}
      leagueName={league?.name ?? ''}
      competition={league?.competitions[0]?.displayName ?? ''}
      homeName={homeName}
      awayName={awayName}
      homeCode={homeCode}
      awayCode={awayCode}
      homeLogo={fixture.homeTeam.logoUrl ?? null}
      awayLogo={fixture.awayTeam.logoUrl ?? null}
      kickoffAt={fixture.kickoff?.at ?? null}
      nextDeadlineAt={fixture.nextDeadlineAt ?? null}
      lineupDeadlineAt={fixture.markets.find(m => m.marketType === 'lineup')?.deadlineAt ?? null}
      serverTime={availability.serverTime}
      phase={fixturePhaseOf(fixture)}
      markets={markets}
      initialAnswers={answers}
      versions={Object.fromEntries((predictions?.data.markets ?? []).map(m => [m.marketType, m.version ?? 0]))}
      lineupVersions={{
        home: predictions?.data.lineups.home?.version ?? 0,
        away: predictions?.data.lineups.away?.version ?? 0,
      }}
      snapshotId={predictions?.data.lineups.snapshot?.snapshotId ?? players?.data.snapshot?.snapshotId ?? null}
      pointsAtStake={pointsAtStake(markets)}
      pointsEarned={pointsEarned(marketResults)}
      otherLeagueCount={otherLeagues}
    />
  );
}
