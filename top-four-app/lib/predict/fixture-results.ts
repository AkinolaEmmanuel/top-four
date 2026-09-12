import { landedAnswerFor, landedScoreFor, type ResolvedAnswer } from './fixture-predict';
import { MARKET_LABELS } from '@/lib/constants/markets';
import { personInitials } from '@/lib/format';
import type { Api } from '@/lib/api/types';
import type { MemberMarketResult } from '@/lib/api/predictions-fixture';

/**
 * A settled fixture, as the league sees it.
 *
 * The predict screen answers "what did I say"; this one answers "what did
 * everyone say, and what landed" — which is the social half of the product and
 * the only place a league reads each other.
 */

export type RivalMember = Api<'RivalPredictionMemberDto'>;

export interface ResultMarket {
  marketType: string;
  /** Home and away lineups share a market type, so they need their own key. */
  key: string;
  label: string;
  /** What landed, in the same words the members' answers are rendered in. */
  landedLabel: string | null;
  /** Every player who scored or was booked — a player market lands as a set. */
  landedPlayerIds: string[];
  /** The settled payload, kept for the match-facts panel. */
  resolved: ResolvedAnswer | null;
  pointsAwarded: number | null;
}

export interface MemberAnswer {
  membershipId: string;
  position: number;
  name: string;
  initials: string;
  isViewer: boolean;
  /** The member's answer in the words they chose it by, or null for silence. */
  answer: string | null;
  /** True only when the answer matches what landed. Never true while unsettled. */
  landed: boolean;
}

/** Markets with something to disclose, in the order the design lists them. */
export function toResultMarkets(
  results: MemberMarketResult[],
  context: { homeName: string; awayName: string; totalGoalsLine: number },
): ResultMarket[] {
  return results
    .filter(result => result.viewerOutcome !== null || result.resolvedAnswer !== null)
    .map(result => {
      const resolved = result.resolvedAnswer ?? null;
      return {
        marketType: result.marketType,
        key: result.side ? `${result.side}_${result.marketType}` : result.marketType,
        // Both lineup markets are `lineup`; only the side tells them apart, and
        // two chips reading "Starting lineups" name neither team.
        label: result.side
          ? `${result.side === 'home' ? context.homeName : context.awayName} XI`
          : MARKET_LABELS[result.marketType] ?? result.marketType,
        landedLabel: landedInWords(result.marketType, resolved, context),
        landedPlayerIds: resolved && 'playerIds' in resolved && Array.isArray(resolved.playerIds)
          ? resolved.playerIds.filter((v): v is string => typeof v === 'string')
          : [],
        resolved,
        pointsAwarded: result.viewerOutcome?.pointsDelta ?? null,
      };
    });
}

/**
 * What landed, phrased the way the members' answers are phrased.
 *
 * `landedAnswerFor` returns the *id* an own answer compares against, which is
 * the right thing on the predict screen and the wrong thing here: this list
 * shows words, and comparing "Draw" to "draw" never matches. The resolved shape
 * is also not the answer shape — total goals resolves to a count and a line
 * rather than to over or under — so it is read out by the fields it has.
 */
function landedInWords(
  marketType: string,
  resolved: ResolvedAnswer | null,
  context: { homeName: string; awayName: string; totalGoalsLine: number },
): string | null {
  if (!resolved) return null;

  if (marketType === 'match_result') {
    const outcome = landedAnswerFor(marketType, resolved, undefined);
    if (outcome === 'home') return context.homeName;
    if (outcome === 'away') return context.awayName;
    if (outcome === 'draw') return 'Draw';
    return null;
  }
  if (marketType === 'exact_score') {
    const score = landedScoreFor(resolved);
    return score ? `${score[0]}–${score[1]}` : null;
  }
  if (marketType === 'both_teams_to_score') {
    const landed = landedAnswerFor(marketType, resolved, undefined);
    return landed === 'yes' ? 'Yes' : landed === 'no' ? 'No' : null;
  }
  if (marketType === 'total_goals') {
    const landed = landedAnswerFor(marketType, resolved, undefined);
    if (!landed) return null;
    return landed === 'over' ? `Over ${context.totalGoalsLine}` : `Under ${context.totalGoalsLine}`;
  }
  // A player market lands as a set, so there is no single label for it — the
  // rows are marked by membership of `landedPlayerIds` instead.
  return null;
}

/**
 * One member's answer to one market, in words.
 *
 * The wire carries each answer as its own shape — an outcome, a pair of goals,
 * a player id — so each is read out by the field it actually has rather than
 * cast to a common type it does not share.
 */
export function answerInWords(
  value: unknown,
  marketType: string,
  homeName: string,
  awayName: string,
  playerNames: Map<string, string>,
  totalGoalsLine: number,
): string | null {
  if (value === null || value === undefined || typeof value !== 'object') return null;
  const answer = value as Record<string, unknown>;

  if (typeof answer.outcome === 'string') {
    if (answer.outcome === 'home') return homeName;
    if (answer.outcome === 'away') return awayName;
    if (answer.outcome === 'draw') return 'Draw';
    return answer.outcome;
  }
  if (typeof answer.homeGoals === 'number' && typeof answer.awayGoals === 'number') {
    return `${answer.homeGoals}–${answer.awayGoals}`;
  }
  if (typeof answer.bothScore === 'boolean') return answer.bothScore ? 'Yes' : 'No';
  if (typeof answer.over === 'boolean') {
    return answer.over ? `Over ${totalGoalsLine}` : `Under ${totalGoalsLine}`;
  }
  if (typeof answer.playerId === 'string') {
    return playerNames.get(answer.playerId) ?? 'A player';
  }
  return null;
}

/** Everyone's answer to one market, in the league's own order. */
export function toMemberAnswers(
  members: RivalMember[],
  market: ResultMarket,
  context: {
    homeName: string; awayName: string;
    playerNames: Map<string, string>; totalGoalsLine: number;
  },
): MemberAnswer[] {
  return members.map(member => {
    const slot = member.predictions.find(p => p.marketType === market.marketType);
    const answer = answerInWords(
      slot?.answer?.value ?? null,
      market.marketType,
      context.homeName, context.awayName,
      context.playerNames, context.totalGoalsLine,
    );

    // Compared against the landing, not against the viewer's own answer: the
    // colour marks the answer that was right, never the person holding it.
    const raw = slot?.answer?.value as Record<string, unknown> | undefined;
    const pickedPlayer = raw && typeof raw.playerId === 'string' ? raw.playerId : null;

    const landed = pickedPlayer !== null
      ? market.landedPlayerIds.includes(pickedPlayer)
      : market.landedLabel !== null && answer !== null && answer === market.landedLabel;

    return {
      membershipId: member.membershipId,
      position: member.position,
      name: member.displayName,
      initials: personInitials(member.displayName),
      isViewer: member.isViewer,
      answer,
      landed,
    };
  });
}
