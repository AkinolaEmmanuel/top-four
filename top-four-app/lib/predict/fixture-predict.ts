import type {
  FixtureAvailability, MemberMarketResult, OwnFixturePredictions,
  SelectablePlayer, CopyLeagueReport, CopyOutcome,
} from '@/lib/api/predictions-fixture';
import type { LeagueRuleset, RulesetMarketType } from '@/lib/api/leagues';
import { STANDARD_MARKET_TYPES } from '@/lib/constants/markets';
import { pluralise } from '@/lib/format';

/**
 * Everything the fixture screen needs to know, decided once on the server.
 *
 * The screen below draws these and owns nothing but the answers in flight. No
 * styling is decided here — the previous version shipped Tailwind strings and
 * inline style objects through an untyped bag, once per platform, which is how
 * three markets came to be unanswerable on a phone.
 */

export type MarketKind = 'tiles' | 'score' | 'players' | 'lineup';
export type FixturePhase = 'open' | 'urgent' | 'locked' | 'settled';
/** How a settled market treated the member's answer. */
export type MarketOutcome = 'hit' | 'miss' | 'void' | 'review';

export interface TileOption {
  id: string;
  label: string;
  /** "win" under a team name; empty for Draw and the yes/no pairs. */
  sub: string;
}

export interface PlayerOption {
  id: string;
  name: string;
  /** "ARS 7" — the club and shirt number, trimmed when there is no number. */
  meta: string;
  initials: string;
}

export interface FixtureMarket {
  /** `match_result`, or `home_lineup` / `away_lineup`. */
  key: string;
  marketType: RulesetMarketType;
  name: string;
  kind: MarketKind;
  points: number;
  pointsLabel: string;
  tiles: TileOption[];
  players: PlayerOption[];
  side?: 'home' | 'away';
  /** False once this market's own deadline has passed, whatever the others do. */
  open: boolean;
  outcome: MarketOutcome | null;
  pointsAwarded: number | null;
  /**
   * The answer that actually landed, as the id the member's pick compares
   * against. Null while unsettled, or where landing is not a single choice.
   */
  landed: string | null;
  /** Settled exact score, home and away. */
  landedScore: [number, number] | null;
}

/** The member's in-flight answers, keyed by market key. */
export type FixtureAnswers = Record<string, unknown>;

const PLAYER_MARKETS = new Set(['anytime_goalscorer', 'player_card']);

const MARKET_NAMES: Record<string, string> = {
  match_result: 'Match result',
  exact_score: 'Exact score',
  both_teams_to_score: 'Both teams to score',
  total_goals: 'Total goals',
  anytime_goalscorer: 'Anytime goalscorer',
  player_card: 'Player to be carded',
};

function initialsOf(name: string): string {
  return name.split(' ').map(part => part[0] ?? '').join('').substring(0, 2).toUpperCase();
}

export function toPlayerOption(player: SelectablePlayer, teamCode: string): PlayerOption {
  // Without the trim a player with no shirt number renders a trailing space.
  return {
    id: player.playerId,
    name: player.displayName,
    meta: `${teamCode} ${player.shirtNumber ?? ''}`.trim(),
    initials: initialsOf(player.displayName),
  };
}

/**
 * What the settlement says actually happened, as the id a tile compares against.
 *
 * The resolved shape is *not* the answer shape — `total_goals` resolves to the
 * goals and the line rather than to over/under, and the player markets resolve
 * to every player who scored or was booked rather than to one. Each is narrowed
 * here, once, because `resolvedAnswer` is untyped on the wire.
 */
export function landedAnswerFor(
  marketType: string,
  resolved: Record<string, unknown> | null,
  ownPick: unknown,
): string | null {
  if (!resolved) return null;

  if (marketType === 'match_result') {
    return typeof resolved.outcome === 'string' ? resolved.outcome : null;
  }
  if (marketType === 'both_teams_to_score') {
    return typeof resolved.bothScore === 'boolean' ? (resolved.bothScore ? 'yes' : 'no') : null;
  }
  if (marketType === 'total_goals') {
    const { goals, line } = resolved;
    if (typeof goals !== 'number' || typeof line !== 'number') return null;
    return goals > line ? 'over' : 'under';
  }
  if (PLAYER_MARKETS.has(marketType)) {
    // Several players can have scored or been booked, so "landed" is membership
    // of that set rather than one id — only the member's own pick can be marked.
    const ids = Array.isArray(resolved.playerIds) ? resolved.playerIds : [];
    return typeof ownPick === 'string' && ids.includes(ownPick) ? ownPick : null;
  }
  return null;
}

export function landedScoreFor(resolved: Record<string, unknown> | null): [number, number] | null {
  if (!resolved) return null;
  const { homeGoals, awayGoals } = resolved;
  return typeof homeGoals === 'number' && typeof awayGoals === 'number'
    ? [homeGoals, awayGoals]
    : null;
}

function outcomeOf(result: MemberMarketResult | undefined): MarketOutcome | null {
  if (!result) return null;
  if (result.viewerOutcome) {
    if (result.viewerOutcome.outcome === 'correct') return 'hit';
    if (result.viewerOutcome.outcome === 'void') return 'void';
    return 'miss';
  }
  return result.state === 'pending_review' ? 'review' : null;
}

export function tilesFor(
  marketType: string,
  homeName: string,
  awayName: string,
  totalGoalsLine: number,
): TileOption[] {
  if (marketType === 'match_result') {
    return [
      { id: 'home', label: homeName, sub: 'win' },
      { id: 'draw', label: 'Draw', sub: '' },
      { id: 'away', label: awayName, sub: 'win' },
    ];
  }
  if (marketType === 'both_teams_to_score') {
    return [{ id: 'yes', label: 'Yes', sub: '' }, { id: 'no', label: 'No', sub: '' }];
  }
  if (marketType === 'total_goals') {
    return [
      { id: 'over', label: `Over ${totalGoalsLine}`, sub: '' },
      { id: 'under', label: `Under ${totalGoalsLine}`, sub: '' },
    ];
  }
  return [];
}

function kindOf(marketType: string): MarketKind {
  if (marketType === 'exact_score') return 'score';
  if (PLAYER_MARKETS.has(marketType)) return 'players';
  return 'tiles';
}

export interface BuildMarketsInput {
  availability: FixtureAvailability;
  ruleset: LeagueRuleset | null;
  predictions: OwnFixturePredictions | null;
  results: MemberMarketResult[];
  answers: FixtureAnswers;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  players: SelectablePlayer[];
}

/**
 * The markets this fixture actually offers.
 *
 * A market the league disabled is not drawn at all, and the over/under tiles
 * carry the league's own frozen line — answering a different question from the
 * one that will be scored is worse than showing nothing.
 */
export function toFixtureMarkets(input: BuildMarketsInput): FixtureMarket[] {
  const { availability, ruleset, predictions, results, answers } = input;
  const priced = new Map((ruleset?.markets ?? []).map(m => [m.marketType, m] as const));
  const points = (marketType: RulesetMarketType): number | null => {
    const entry = priced.get(marketType);
    return entry?.enabled ? entry.points : null;
  };

  const line = ruleset?.totalGoalsLine ?? 2.5;
  const bySettledMarket = new Map(results.map(r => [r.side ? `${r.side}_${r.marketType}` : r.marketType, r]));
  const byPredictionSlot = new Map((predictions?.markets ?? []).map(s => [s.marketType, s]));

  const standard: FixtureMarket[] = STANDARD_MARKET_TYPES
    .filter(marketType => points(marketType) !== null)
    .map(marketType => {
      const price = points(marketType) as number;
      const result = bySettledMarket.get(marketType);
      const resolved = (result?.resolvedAnswer ?? null) as Record<string, unknown> | null;
      const slot = byPredictionSlot.get(marketType);

      return {
        key: marketType,
        marketType,
        name: MARKET_NAMES[marketType] ?? marketType,
        kind: kindOf(marketType),
        points: price,
        pointsLabel: pluralise(price, 'pt'),
        tiles: tilesFor(marketType, input.homeName, input.awayName, line),
        players: PLAYER_MARKETS.has(marketType)
          ? input.players.map(p => toPlayerOption(p, p.side === 'home' ? input.homeCode : input.awayCode))
          : [],
        open: slot?.submissionAllowed !== false,
        outcome: outcomeOf(result),
        pointsAwarded: result?.viewerOutcome?.pointsDelta ?? null,
        landed: landedAnswerFor(marketType, resolved, answers[marketType]),
        landedScore: marketType === 'exact_score' ? landedScoreFor(resolved) : null,
      };
    });

  const perStarter = points('lineup');
  if (perStarter === null) return standard;

  const lineupMarket = availability.markets.find(m => m.marketType === 'lineup');
  const sides: Array<'home' | 'away'> = ['home', 'away'];

  return [
    ...standard,
    ...sides.map(side => {
      const result = bySettledMarket.get(`${side}_lineup`);
      return {
        key: `${side}_lineup`,
        marketType: 'lineup' as RulesetMarketType,
        name: `${side === 'home' ? input.homeName : input.awayName} Starting XI`,
        kind: 'lineup' as MarketKind,
        // One point per correct starter, so a side is worth the price × 11.
        points: perStarter * 11,
        pointsLabel: `${pluralise(perStarter, 'pt')} × 11`,
        tiles: [],
        players: (side === 'home' ? input.players.filter(p => p.side === 'home') : input.players.filter(p => p.side === 'away'))
          .map(p => toPlayerOption(p, side === 'home' ? input.homeCode : input.awayCode)),
        side,
        open: lineupMarket?.submissionAllowed !== false,
        outcome: outcomeOf(result),
        pointsAwarded: result?.viewerOutcome?.pointsDelta ?? null,
        landed: null,
        landedScore: null,
      };
    }),
  ];
}

/**
 * The stored answers, read back into the ids the controls compare against.
 *
 * Each branch narrows on the field it needs rather than trusting `marketType`
 * to imply it: a market whose answer does not carry the expected shape is left
 * unhydrated instead of writing `undefined` into the form.
 */
export function hydrateAnswers(predictions: OwnFixturePredictions | null): FixtureAnswers {
  if (!predictions) return {};
  const answers: FixtureAnswers = {};

  for (const slot of predictions.markets) {
    if (!slot.answer) continue;
    const value = slot.answer.value;
    if ('outcome' in value) answers.match_result = value.outcome;
    else if ('homeGoals' in value) answers.exact_score = [value.homeGoals, value.awayGoals];
    else if ('bothScore' in value) answers.both_teams_to_score = value.bothScore ? 'yes' : 'no';
    else if ('selection' in value) answers.total_goals = value.selection;
    else if ('playerId' in value) answers[slot.marketType] = value.playerId;
  }

  if (predictions.lineups.home) answers.home_lineup = predictions.lineups.home.answer.value.playerIds;
  if (predictions.lineups.away) answers.away_lineup = predictions.lineups.away.answer.value.playerIds;
  return answers;
}

/** The local value, shaped into the body each market requires on the wire. */
export function toAnswerPayload(
  marketType: string,
  value: unknown,
  snapshotId: string | undefined,
): Record<string, unknown> {
  switch (marketType) {
    case 'match_result': return { outcome: value };
    case 'both_teams_to_score': return { bothScore: value === 'yes' };
    case 'total_goals': return { selection: value };
    case 'anytime_goalscorer':
    case 'player_card':
      return { playerId: value, snapshotId };
    case 'exact_score': {
      const score = value as [number, number];
      return { homeGoals: score[0], awayGoals: score[1] };
    }
    default: return value as Record<string, unknown>;
  }
}

export interface FixtureProgress {
  answered: number;
  total: number;
  pct: number;
  standardAnswered: number;
  standardTotal: number;
  lineupsAnswered: number;
  lineupsTotal: number;
}

/** Both elevens are separate answers, so the fixture has one slot per market plus two. */
export function progressOf(markets: FixtureMarket[], answers: FixtureAnswers): FixtureProgress {
  const isAnswered = (key: string) => {
    const value = answers[key];
    return value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0);
  };

  const standard = markets.filter(m => m.kind !== 'lineup');
  const lineups = markets.filter(m => m.kind === 'lineup');
  const standardAnswered = standard.filter(m => isAnswered(m.key)).length;
  const lineupsAnswered = lineups.filter(m => isAnswered(m.key)).length;
  const answered = standardAnswered + lineupsAnswered;
  const total = standard.length + lineups.length;

  return {
    answered,
    total,
    pct: total > 0 ? Math.round((answered / total) * 100) : 0,
    standardAnswered,
    standardTotal: standard.length,
    lineupsAnswered,
    lineupsTotal: lineups.length,
  };
}

/**
 * The phase the screen is in, read from the fixture rather than from a flag the
 * screen sets itself. "Urgent" is the window after the lineups have closed
 * while the standard markets are still open.
 */
export function fixturePhaseOf(availability: FixtureAvailability): FixturePhase {
  if ((availability.marketStateCounts.settled ?? 0) > 0) return 'settled';
  if (!availability.hasOpenMarkets) return 'locked';
  const lineup = availability.markets.find(m => m.marketType === 'lineup');
  return lineup && !lineup.submissionAllowed ? 'urgent' : 'open';
}

/** Everything this fixture is worth, both elevens included. */
export function pointsAtStake(markets: FixtureMarket[]): number {
  return markets.reduce((sum, m) => sum + m.points, 0);
}

export function pointsEarned(results: MemberMarketResult[]): number {
  return results.reduce((sum, r) => sum + (r.viewerOutcome?.pointsDelta ?? 0), 0);
}

const COPY_OUTCOME_LABELS: Record<CopyOutcome, string> = {
  copied: 'copied',
  replaced: 'replaced what was there',
  unchanged: 'already the same',
  locked: 'that market had closed',
  not_enabled: 'that league does not run it',
  league_closed: 'that league has finished',
  changed_elsewhere: 'changed on another device',
  no_longer_member: 'you have left that league',
  snapshot_unavailable: 'its squad list was unavailable',
  player_unavailable: 'that player is not selectable there',
  line_differs: 'that league froze a different goals line',
};

export interface CopyLeagueSummary {
  leagueId: string;
  leagueName: string;
  /** How many answers actually landed there. */
  copied: number;
  total: number;
  /** Every reason an answer did not land, said once each. */
  refusals: string[];
}

/**
 * What copying actually did, per league.
 *
 * Partial success is normal and the API says so, so the refusals are reported
 * rather than flattened into a tick — the screen used to claim every answer
 * landed everywhere regardless of what came back.
 */
export function toCopySummaries(leagues: CopyLeagueReport[]): CopyLeagueSummary[] {
  return leagues.map(league => {
    const landed = league.answers.filter(a => a.outcome === 'copied' || a.outcome === 'replaced');
    const refusals = new Set<string>();
    for (const answer of league.answers) {
      if (answer.outcome === 'copied' || answer.outcome === 'replaced') continue;
      refusals.add(COPY_OUTCOME_LABELS[answer.outcome] ?? answer.outcome);
    }
    return {
      leagueId: league.leagueId,
      leagueName: league.leagueName,
      copied: landed.length,
      total: league.answers.length,
      refusals: [...refusals],
    };
  });
}

/** The answers that will travel, as the member sees them named. */
export function carryLabelsFor(markets: FixtureMarket[], answers: FixtureAnswers): string[] {
  return markets.flatMap(market => {
    const value = answers[market.key];
    if (value === null || value === undefined) return [];

    if (market.kind === 'score') {
      const score = value as [number, number];
      return Array.isArray(score) ? [`${score[0]}–${score[1]}`] : [];
    }
    if (market.kind === 'players') {
      const player = market.players.find(p => p.id === value);
      return player ? [player.name] : [];
    }
    if (market.kind === 'lineup') return [];
    const tile = market.tiles.find(t => t.id === value);
    return tile ? [tile.label] : [];
  });
}
