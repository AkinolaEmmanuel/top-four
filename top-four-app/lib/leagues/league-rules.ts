import type { LeagueRuleset } from '@/lib/api/leagues';
import { MARKET_LABELS, TIEBREAK_LABELS } from '@/lib/constants/markets';
import { pluralise } from '@/lib/format';

/**
 * The league's frozen rules, read once on the server.
 *
 * Every number here comes from the ruleset the league froze at publication —
 * none of it is spelled out in prose, because the screen used to close with the
 * prototype's arithmetic ("2 result + 5 score + …") under a table that said
 * something else entirely.
 */

/** A lineup scores once per correct starter across both elevens. */
const LINEUP_STARTERS = 22;

export interface MarketRule {
  marketType: string;
  label: string;
  note: string;
  /** What one correct answer is worth, in the product's words. */
  price: string;
  enabled: boolean;
}

export interface CompetitionRule {
  name: string;
  scope: string;
  season: string;
}

const MARKET_NOTES: Record<string, string> = {
  match_result: 'Home, draw or away',
  exact_score: "Both teams' goals",
  both_teams_to_score: 'Yes or no',
  total_goals: 'Over or under the league’s line',
  anytime_goalscorer: 'Extra time counts; shootouts and own goals do not',
  player_card: 'Yellow, second yellow or straight red, if the player appears',
  lineup: 'Both elevens — one point per correct starter',
};

export function toMarketRules(ruleset: LeagueRuleset | undefined): MarketRule[] {
  return (ruleset?.markets ?? []).map(market => ({
    marketType: market.marketType,
    label: MARKET_LABELS[market.marketType] ?? market.marketType,
    note: market.marketType === 'total_goals'
      ? `Over or under ${ruleset?.totalGoalsLine ?? 2.5}`
      : MARKET_NOTES[market.marketType] ?? '',
    price: market.marketType === 'lineup'
      ? `${pluralise(market.points, 'pt')} per starter`
      : pluralise(market.points, 'pt'),
    enabled: market.enabled,
  }));
}

/** Everything one fixture is worth, both elevens included. */
export function maxPointsPerFixture(ruleset: LeagueRuleset | undefined): number {
  return (ruleset?.markets ?? [])
    .filter(m => m.enabled)
    .reduce((total, m) => total + m.points * (m.marketType === 'lineup' ? LINEUP_STARTERS : 1), 0);
}

/**
 * How that total is made up, derived rather than written out — so it cannot
 * drift from the table above it the way the hardcoded version did.
 */
export function maxPointsNote(ruleset: LeagueRuleset | undefined): string {
  const enabled = (ruleset?.markets ?? []).filter(m => m.enabled);
  const standard = enabled.filter(m => m.marketType !== 'lineup');
  const lineup = enabled.find(m => m.marketType === 'lineup');
  const disabled = (ruleset?.markets ?? []).filter(m => !m.enabled)
    .map(m => MARKET_LABELS[m.marketType] ?? m.marketType);

  const parts = [`${pluralise(standard.length, 'market')} worth ${standard.reduce((n, m) => n + m.points, 0)}`];
  if (lineup) parts.push(`plus ${LINEUP_STARTERS} lineup places at ${pluralise(lineup.points, 'pt')} each`);

  let note = `${parts.join(', ')}.`;
  if (disabled.length > 0) {
    note += ` ${disabled.join(', ')} ${disabled.length === 1 ? 'is' : 'are'} not run here.`;
  }
  return note;
}

/** Total points is always first, and is not part of the configured list. */
export function toTiebreakerLabels(ruleset: LeagueRuleset | undefined): string[] {
  return ['Total points', ...(ruleset?.tiebreakers ?? []).map(t => TIEBREAK_LABELS[t] ?? t)];
}

export function lockMinutes(ruleset: LeagueRuleset | undefined): number {
  return ruleset?.standardLock?.offsetMinutes ?? 5;
}

/** Late joining, in the API's own words rather than a guessed constant. */
export function lateJoinLabel(ruleset: LeagueRuleset | undefined): string {
  return ruleset?.lateJoinPolicy === 'close_when_in_progress'
    ? 'Closes when the league starts'
    : 'Permitted';
}
