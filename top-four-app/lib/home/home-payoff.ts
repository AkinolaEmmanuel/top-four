import { MARKET_LABELS } from '@/lib/constants/markets';
import type { FixtureResultsResponse } from '@/lib/api/predictions-fixture';
import { landedScoreFor } from '@/lib/predict/fixture-predict';

/**
 * The design's payoff block, shaped on the server.
 *
 * Cross-league and backward-looking, which makes it the only place the product
 * tells a member they did well. Everything else on Home is what they still owe.
 *
 * Built from the results feed rather than the points ledger: the ledger is
 * per-league and carries no team names, so naming a row from it would mean a
 * second join per entry. The results read already carries both the names and
 * the per-market outcome.
 */

/** How far back the block looks. A round of football, midweek games included. */
export const PAYOFF_WINDOW_DAYS = 7;
export const PAYOFF_WINDOW_MS = PAYOFF_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * The block's kicker, derived from the window rather than written beside it.
 *
 * The design's word is "YOUR WEEKEND", which assumes football only happens at
 * weekends — a midweek round would have this block lying about when it scored.
 * Naming the window keeps it true whatever the fixture list does.
 */
export const PAYOFF_KICKER = `Your last ${PAYOFF_WINDOW_DAYS} days`;

/** Rows on screen. Beyond this it stops being a payoff and becomes a ledger. */
export const PAYOFF_ROWS = 3;

export interface PayoffRow {
  /** "Liverpool 2 — 1 Spurs · exact score", or "· nothing landed". */
  label: string;
  points: string;
  /** Drives the light mark; false renders the muted one. */
  won: boolean;
  href: string;
}

export interface HomePayoff {
  /** Signed, because a settlement correction can take points back. */
  points: number;
  pointsLabel: string;
  /** Leagues that actually contributed, not leagues joined. */
  leagueCount: number;
  rows: PayoffRow[];
  /** Settled fixtures past the three shown. */
  more: number;
}

export interface PayoffFixture {
  leagueId: string;
  leagueFixtureId: string;
  homeName: string;
  awayName: string;
  kickoffAt: string | null;
  results: FixtureResultsResponse | undefined;
}

function marketLabel(market: FixtureResultsResponse['markets'][number]): string {
  // Both lineups are one market type; without the side they read as duplicates.
  return market.marketType === 'lineup' && market.side
    ? `${market.side === 'home' ? 'home' : 'away'} lineup`
    : (MARKET_LABELS[market.marketType] ?? market.marketType).toLowerCase();
}

/**
 * The fixtures a member scored on in the window, newest first.
 *
 * A fixture with no settled market is dropped rather than shown at zero: it has
 * not been scored yet, which is a different thing from having scored nothing.
 */
export function toPayoff(fixtures: PayoffFixture[]): HomePayoff | null {
  const scored = fixtures
    .map(fixture => {
      const settled = (fixture.results?.markets ?? []).filter(m => m.viewerOutcome !== null);
      if (settled.length === 0) return null;

      const points = settled.reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta ?? 0), 0);
      const exact = fixture.results?.markets.find(m => m.marketType === 'exact_score');
      const landed = landedScoreFor(exact?.resolvedAnswer);
      const score = landed ? `${landed[0]} — ${landed[1]}` : 'v';

      // The best thing that landed is what a member wants named. Nothing landing
      // is worth naming too — the block is a record, not a highlight reel.
      const best = settled
        .filter(m => m.viewerOutcome?.outcome === 'correct')
        .sort((a, b) => (b.viewerOutcome?.pointsDelta ?? 0) - (a.viewerOutcome?.pointsDelta ?? 0))[0];

      return {
        leagueId: fixture.leagueId,
        kickoffMs: Date.parse(fixture.kickoffAt ?? '') || 0,
        points,
        row: {
          label: `${fixture.homeName} ${score} ${fixture.awayName} · ${best ? marketLabel(best) : 'nothing landed'}`,
          points: points > 0 ? `+${points}` : String(points),
          won: !!best,
          href: `/predict/fixture/${fixture.leagueFixtureId}/results?leagueId=${fixture.leagueId}`,
        },
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.kickoffMs - a.kickoffMs);

  if (scored.length === 0) return null;

  const points = scored.reduce((sum, entry) => sum + entry.points, 0);

  return {
    points,
    pointsLabel: points > 0 ? `+${points}` : String(points),
    leagueCount: new Set(scored.map(entry => entry.leagueId)).size,
    rows: scored.slice(0, PAYOFF_ROWS).map(entry => entry.row),
    more: Math.max(0, scored.length - PAYOFF_ROWS),
  };
}
