import { notFound, redirect } from 'next/navigation';
import { FixtureResultsScreen, type ResultsPhase } from '../../../../components/predict/FixtureResultsScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { toResultMarkets, type RivalMember } from '@/lib/predict/fixture-results';
import { landedScoreFor } from '@/lib/predict/fixture-predict';
import type { Api } from '@/lib/api/types';
import type { FixtureAvailability, FixtureResultsResponse } from '@/lib/api/predictions-fixture';

/**
 * A settled fixture, as the whole league sees it.
 *
 * Disclosure is the API's decision, not ours: the members read answers 403 with
 * PREDICTIONS_HIDDEN while anything is still open, and that refusal is what puts
 * the screen into its sealed state. Nothing is fetched and redacted here.
 */

type Availability = { data: FixtureAvailability; serverTime: string };
type Results = { data: FixtureResultsResponse };
type Members = Api<'RivalsPredictionPageDto'>;
type League = Api<'LeagueReadResponseDto'>;

const PLAYED = ['finished', 'awarded', 'walkover'];

export default async function FixtureResultsPage({ params, searchParams }: {
  params: { id: string };
  searchParams: { leagueId?: string };
}) {
  const fixtureId = params.id;
  const leagueId = searchParams.leagueId ?? '';
  const backHref = `/predict/fixture/${fixtureId}?leagueId=${leagueId}`;

  if (!leagueId) notFound();

  let availability: Availability;
  let results: Results | null;
  let members: Members | null;
  let league: League | null;

  try {
    [availability, results, members, league] = await Promise.all([
      serverFetch<Availability>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`),
      serverFetchOrNull<Results>(`/leagues/${leagueId}/fixtures/${fixtureId}/results`),
      // A 403 here is the sealed state, which serverFetchOrNull turns into null.
      serverFetchOrNull<Members>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/members?page=1&pageSize=50`),
      serverFetchOrNull<League>(`/leagues/${leagueId}`),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=${encodeURIComponent(backHref)}`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=${encodeURIComponent(backHref)}`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const fixture = availability.data;
  if (!PLAYED.includes(fixture.fixtureState)) redirect(backHref);

  const homeName = fixture.homeTeam?.displayName ?? 'Home';
  const awayName = fixture.awayTeam?.displayName ?? 'Away';
  const marketResults = results?.data.markets ?? [];

  const markets = toResultMarkets(marketResults, {
    homeName, awayName,
    totalGoalsLine: league?.ruleset?.totalGoalsLine ?? 2.5,
  });

  const exact = markets.find(m => m.marketType === 'exact_score');
  const score = landedScoreFor(exact?.resolved ?? null);

  // Provisional until review closes. The API says so per market — a settled
  // market whose status is not yet `final` — so the fixture is final only once
  // none of them is still provisional.
  const anyProvisional = marketResults.some(m => m.state === 'settled' && m.status !== 'final');
  const phase: ResultsPhase = members === null ? 'sealed' : anyProvisional ? 'provisional' : 'final';

  const facts = [
    score ? { label: 'Final score', value: `${homeName} ${score[0]} ${awayName} ${score[1]}` } : null,
    fixture.kickoff?.at
      ? { label: 'Kick-off', value: new Date(fixture.kickoff.at).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }) }
      : null,
    { label: 'Settled markets', value: `${marketResults.filter(m => m.viewerOutcome !== null).length} of ${marketResults.length}` },
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <FixtureResultsScreen
      leagueId={leagueId}
      leagueName={league?.name ?? 'This league'}
      competition={fixture.competition?.displayName ?? ''}
      backHref={backHref}
      homeName={homeName}
      awayName={awayName}
      homeCode={fixture.homeTeam?.code || 'HOM'}
      awayCode={fixture.awayTeam?.code || 'AWA'}
      homeLogo={fixture.homeTeam?.logoUrl ?? null}
      awayLogo={fixture.awayTeam?.logoUrl ?? null}
      score={score}
      phase={phase}
      markets={markets}
      members={(members?.items ?? []) as RivalMember[]}
      totalMembers={members?.totalActiveMembers ?? 0}
      pointsEarned={marketResults.reduce((n, m) => n + (m.viewerOutcome?.pointsDelta ?? 0), 0)}
      pointsAtStake={(league?.scoring.markets ?? [])
        .filter(m => markets.some(r => r.marketType === m.marketType))
        .reduce((n, m) => n + m.maximumPoints, 0)}
      facts={facts}
    />
  );
}
