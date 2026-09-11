import { notFound, redirect } from 'next/navigation';
import { PlayerPickerScreen } from '../../../../components/predict/PlayerPickerScreen';
import { serverFetch, serverFetchOrNull, NotAuthenticatedError } from '@/lib/api/server-fetch';
import { ApiError } from '@/lib/api/fetcher';
import { MARKET_TYPE, toSquads, type PickerMarket } from '@/lib/predict/player-picker';
import { pluralise } from '@/lib/format';
import type { Api } from '@/lib/api/types';
import type { LeaguesPage } from '@/lib/api/leagues';
import type { FixtureAvailability, OwnFixturePredictions, SelectablePlayer, SnapshotRef } from '@/lib/api/predictions-fixture';

/**
 * The player picker, fetched on the server.
 *
 * `market` says which of the two player markets launched it. Without it the
 * screen always opened in goalscorer mode, even from the card row.
 */

type Availability = { data: FixtureAvailability; serverTime: string };
type Predictions = { data: OwnFixturePredictions };
type Players = { data: { snapshot: SnapshotRef | null; players: SelectablePlayer[] } };

export default async function PlayerPickerPage({ params, searchParams }: {
  params: { id: string };
  searchParams: { leagueId?: string; market?: string };
}) {
  const fixtureId = params.id;
  const leagueId = searchParams.leagueId ?? '';
  const market: PickerMarket = searchParams.market === 'card' ? 'card' : 'scorer';
  const backHref = `/predict/fixture/${fixtureId}${leagueId ? `?leagueId=${leagueId}` : ''}`;

  if (!leagueId) notFound();

  let availability: Availability;
  let predictions: Predictions | null;
  let players: Players | null;
  let ruleset: { ruleset?: Api<'LeagueRulesetResponseDto'> } | null;
  let leagues: LeaguesPage | null;

  try {
    [availability, predictions, players, ruleset, leagues] = await Promise.all([
      serverFetch<Availability>(`/leagues/${leagueId}/fixtures/${fixtureId}/availability`),
      serverFetchOrNull<Predictions>(`/leagues/${leagueId}/fixtures/${fixtureId}/predictions/me`),
      // The squad list pages; both squads fit inside the endpoint's maximum, so
      // one call is complete rather than the default page's first fifty.
      serverFetchOrNull<Players>(`/leagues/${leagueId}/fixtures/${fixtureId}/selectable-players?limit=200`),
      serverFetchOrNull<{ ruleset?: Api<'LeagueRulesetResponseDto'> }>(`/leagues/${leagueId}`),
      serverFetchOrNull<LeaguesPage>('/leagues'),
    ]);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) redirect(`/?redirect=${encodeURIComponent(backHref)}`);
    if (error instanceof ApiError && error.status === 401) redirect(`/?redirect=${encodeURIComponent(backHref)}`);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  const fixture = availability.data;
  const slot = predictions?.data.markets.find(m => m.marketType === MARKET_TYPE[market]);
  const saved = slot?.answer?.value;

  // Priced from the league's own frozen ruleset. An unknown price shows nothing
  // rather than a guess — the fixture screen quotes the same number.
  const priced = ruleset?.ruleset?.markets.find(m => m.marketType === MARKET_TYPE[market]);

  return (
    <PlayerPickerScreen
      leagueId={leagueId}
      fixtureId={fixtureId}
      market={market}
      squads={toSquads(
        players?.data.players ?? [],
        { code: fixture.homeTeam?.code || 'HOM', name: fixture.homeTeam?.displayName || 'Home' },
        { code: fixture.awayTeam?.code || 'AWA', name: fixture.awayTeam?.displayName || 'Away' },
      )}
      savedPlayerId={saved && 'playerId' in saved ? saved.playerId : null}
      expectedVersion={slot?.version ?? 0}
      snapshotId={players?.data.snapshot?.snapshotId ?? null}
      price={priced?.enabled ? pluralise(priced.points, 'pt') : ''}
      leagueName={leagues?.items.find(l => l.id === leagueId)?.name ?? ''}
      backHref={backHref}
    />
  );
}
