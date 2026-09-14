/**
 * The ruleset carries market types and points, never labels. These are the
 * product's words for them, kept in one place so two screens cannot disagree
 * about what the same league froze.
 */

export const STANDARD_MARKET_TYPES = [
  'match_result',
  'exact_score',
  'both_teams_to_score',
  'total_goals',
  'anytime_goalscorer',
  'player_card',
] as const;

export const MARKET_LABELS: Record<string, string> = {
  match_result: 'Match result',
  exact_score: 'Exact score',
  both_teams_to_score: 'Both teams to score',
  total_goals: 'Total goals',
  anytime_goalscorer: 'Anytime goalscorer',
  player_card: 'Player to be carded',
  lineup: 'Starting lineups',
};

/** Phrased as the thing being counted, because that is how a tie is broken. */
export const TIEBREAK_LABELS: Record<string, string> = {
  match_result: 'Match results correct',
  exact_score: 'Exact scores correct',
  both_teams_to_score: 'Both teams to score, correct',
  total_goals: 'Total goals, correct',
  anytime_goalscorer: 'Anytime goalscorers correct',
  player_card: 'Player cards correct',
  lineup: 'Lineup players correct',
};

/** A lineup scores once per correct starter across both elevens. */
export const LINEUP_STARTERS_PER_FIXTURE = 22;

/**
 * Total points at stake in one fixture under a frozen ruleset. Total points is
 * always the first tiebreaker and is not part of the configured list, so it is
 * prepended wherever the order is shown.
 */
export function fixturePointsAtStake(
  markets: ReadonlyArray<{ marketType: string; enabled: boolean; points: number }>,
): number {
  return markets
    .filter(m => m.enabled)
    .reduce((total, m) => total + m.points * (m.marketType === 'lineup' ? LINEUP_STARTERS_PER_FIXTURE : 1), 0);
}

export function tiebreakerOrder(tiebreakers: readonly string[]): string[] {
  return ['Total points', ...tiebreakers.map(t => TIEBREAK_LABELS[t] ?? t)];
}
