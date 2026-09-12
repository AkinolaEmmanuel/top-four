import type { Api } from '@/lib/api/types';
import type { CompetitionSpanKind, CreateLeaguePayload, CreateLeagueScope } from '@/lib/api/leagues';

/**
 * League setup, shaped once on the server.
 *
 * The wizard writes the ruleset every other screen then quotes for the life of
 * the league, so the ids it needs are carried end to end here. The version this
 * replaces reduced each stage to a round *count* and dropped the stage and
 * round ids, which made the round-range selection unsendable: a league scoped
 * to three matchdays was created covering the whole season.
 */

export type MarketType = Api<'MarketConfigurationDto'>['marketType'];
export type LockKind = Api<'StandardLockDto'>['kind'];
/** How a round range is chosen for one competition, in the wizard's own terms. */
export type ScopeSelection = 'season' | 'round' | 'range';

/** The wizard's selection, as the API names it. */
const SPAN_KIND: Record<ScopeSelection, CompetitionSpanKind> = {
  season: 'full_season',
  round: 'single_round',
  range: 'round_range',
};

export interface SetupStage {
  id: string;
  name: string;
}

export interface SetupRound {
  stageId: string;
  roundId: string;
  /** "1", "MD3" — compact, for the round grid. */
  label: string;
  /** The round's own name from the catalogue, for the summary line. */
  full: string;
}

export interface SetupCompetition {
  /** The slug, which is what the wizard keys its per-competition state by. */
  id: string;
  supportedCompetitionId: string;
  seasonId: string;
  name: string;
  abbr: string;
  season: string;
  logoUrl: string | null;
  /** Named only when there is more than one, as the round grid groups by stage. */
  stages: SetupStage[];
  rounds: SetupRound[];
}

export interface MarketPreset {
  marketType: MarketType;
  name: string;
  note: string;
  /** The server's own default, mirrored so the wizard can show it before any edit. */
  points: number;
  perPlayer?: boolean;
  tiebreakerLabel: string;
  colour: string;
}

/**
 * The seven official markets at the server's committed defaults.
 *
 * These match `DEFAULT_MARKET_POINTS` on the API exactly. The configuration
 * section is optional on create — omitting it takes the same defaults — so this
 * exists to show the creator what they are, not to override them.
 */
export const MARKET_PRESETS: MarketPreset[] = [
  { marketType: 'match_result', name: 'Match result', note: 'Home, draw or away', points: 2, tiebreakerLabel: 'Most correct match results', colour: 'var(--cat-1)' },
  { marketType: 'exact_score', name: 'Exact score', note: "Both teams' goals", points: 5, tiebreakerLabel: 'Most correct exact scores', colour: 'var(--cat-6)' },
  { marketType: 'both_teams_to_score', name: 'Both teams to score', note: 'Yes or no', points: 1, tiebreakerLabel: 'Most correct both-teams-to-score', colour: 'var(--cat-2)' },
  { marketType: 'total_goals', name: 'Total goals', note: 'Over or under the line', points: 1, tiebreakerLabel: 'Most correct total goals', colour: 'var(--cat-4)' },
  { marketType: 'anytime_goalscorer', name: 'Anytime goalscorer', note: 'One player · own goals do not count', points: 5, tiebreakerLabel: 'Most correct goalscorers', colour: 'var(--cat-3)' },
  { marketType: 'player_card', name: 'Player card', note: 'Yellow, second yellow or red', points: 4, tiebreakerLabel: 'Most correct player cards', colour: 'var(--cat-5)' },
  { marketType: 'lineup', name: 'Correct lineup starter', note: 'Per player · always locks 2h before kick-off', points: 1, perPlayer: true, tiebreakerLabel: 'Most correct lineup players', colour: 'var(--cat-7)' },
];

export interface LockPreset {
  kind: LockKind;
  label: string;
  note: string;
}

export const LOCK_PRESETS: LockPreset[] = [
  { kind: 'at_kickoff', label: 'Kick-off', note: 'Deadlines land the moment the whistle goes. Nothing to spare if a member is late.' },
  { kind: 'minutes_5', label: '5 min', note: 'The default. Team news is out, and nobody is answering during the match.' },
  { kind: 'minutes_15', label: '15 min', note: 'Fifteen minutes of quiet before kick-off.' },
  { kind: 'minutes_30', label: '30 min', note: 'Half an hour ahead of kick-off, roughly when line-ups are confirmed.' },
  { kind: 'minutes_60', label: '1 hour', note: 'An hour ahead. Predictions close before most team news lands.' },
  { kind: 'minutes_120', label: '2 hours', note: 'Matches the lineup market, so every deadline in the league falls together.' },
  { kind: 'custom', label: 'Custom', note: 'Any whole number of minutes up to seven days. A value matching a preset is stored as that preset.' },
];

/** The round grid's compact label: the trailing number of "Regular Season - 12". */
export function roundLabel(name: string, index: number): string {
  const trailing = /(\d+)\s*$/.exec(name);
  return trailing ? trailing[1] : String(index + 1);
}

/** One competition's chosen span, as the wizard holds it. */
export interface CompetitionChoice {
  selection: ScopeSelection;
  /** Index into `rounds` — the single round, or the start of a range. */
  from?: number;
  /** Index into `rounds` — the end of a range. */
  to?: number;
}

export interface SpanSummary {
  /** False while a range is half-picked, when nothing should be claimed yet. */
  complete: boolean;
  roundCount: number;
  /** "Every round · 38 of them", or "MD1 → MD3 · 3 rounds". */
  label: string;
}

/**
 * What a chosen span covers.
 *
 * Deliberately counts rounds and not fixtures: the catalogue does not publish a
 * fixture count per round, and the version this replaces invented one by
 * assuming ten a round for every competition — wrong for an eighteen-team
 * league and wrong again for a thirty-six-team league phase.
 */
export function summariseSpan(competition: SetupCompetition, choice: CompetitionChoice): SpanSummary {
  const rounds = competition.rounds;
  const { selection, from, to } = choice;

  if (selection === 'season') {
    return { complete: true, roundCount: rounds.length, label: `Every round · ${rounds.length} of them` };
  }
  if (selection === 'round' && from != null) {
    return { complete: true, roundCount: 1, label: rounds[from]?.full ?? '' };
  }
  if (selection === 'range' && from != null && to != null) {
    const count = Math.abs(to - from) + 1;
    const [a, b] = from <= to ? [from, to] : [to, from];
    return { complete: true, roundCount: count, label: `${rounds[a]?.full ?? ''} → ${rounds[b]?.full ?? ''} · ${count} rounds` };
  }
  return { complete: false, roundCount: 0, label: '' };
}

/**
 * One competition's scope, round boundaries included.
 *
 * The API takes `round` for a single round and `firstRound`/`lastRound` for a
 * span; sending neither means the whole season, whatever the creator picked.
 */
export function toCompetitionScope(competition: SetupCompetition, choice: CompetitionChoice): CreateLeagueScope {
  const base: CreateLeagueScope = {
    supportedCompetitionId: competition.supportedCompetitionId,
    seasonId: competition.seasonId,
    kind: SPAN_KIND[choice.selection],
  };

  const boundary = (index: number) => {
    const round = competition.rounds[index];
    return round ? { stageId: round.stageId, roundId: round.roundId } : undefined;
  };

  if (choice.selection === 'round' && choice.from != null) {
    const round = boundary(choice.from);
    return round ? { ...base, round } : base;
  }

  if (choice.selection === 'range' && choice.from != null && choice.to != null) {
    const [a, b] = choice.from <= choice.to ? [choice.from, choice.to] : [choice.to, choice.from];
    const firstRound = boundary(a);
    const lastRound = boundary(b);
    return firstRound && lastRound ? { ...base, firstRound, lastRound } : base;
  }

  return base;
}

export interface LeagueDraft {
  name: string;
  description: string;
  joinApprovalRequired: boolean;
  lateJoinPolicy: Api<'LeagueConfigurationDto'>['lateJoinPolicy'];
  totalGoalsLine: Api<'LeagueConfigurationDto'>['totalGoalsLine'];
  lock: LockKind;
  customLockMinutes?: number;
  /** Points per market, only where the creator moved them off the default. */
  points: Partial<Record<MarketType, number>>;
  disabled: Partial<Record<MarketType, boolean>>;
  tiebreakers: MarketType[];
  /** Keyed by competition slug. */
  choices: Record<string, CompetitionChoice>;
}

export function buildCreatePayload(
  draft: LeagueDraft,
  competitions: SetupCompetition[],
): CreateLeaguePayload {
  const chosen = competitions.filter(c => {
    const choice = draft.choices[c.id];
    return choice && summariseSpan(c, choice).complete;
  });

  return {
    name: draft.name.trim() || 'New League',
    description: draft.description.trim() || undefined,
    invitationSettings: { joinApprovalRequired: draft.joinApprovalRequired, enabled: true },
    configuration: {
      lateJoinPolicy: draft.lateJoinPolicy,
      totalGoalsLine: draft.totalGoalsLine,
      competitionScopes: chosen.map(c => toCompetitionScope(c, draft.choices[c.id])),
      markets: MARKET_PRESETS.map(preset => ({
        marketType: preset.marketType,
        enabled: !draft.disabled[preset.marketType],
        points: draft.points[preset.marketType] ?? preset.points,
      })),
      tiebreakers: draft.tiebreakers,
      standardLock: draft.lock === 'custom' && draft.customLockMinutes != null
        ? { kind: 'custom', offsetMinutes: draft.customLockMinutes }
        : { kind: draft.lock },
    },
  };
}
