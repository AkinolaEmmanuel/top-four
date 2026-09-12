import type { Api } from '@/lib/api/types';
import type { FixtureResultsResponse } from '@/lib/api/predictions-fixture';
import { MARKET_LABELS } from '@/lib/constants/markets';
import { ordinal } from '@/lib/format';

/**
 * The league overview's facts, shaped once on the server.
 *
 * As elsewhere, no presentation here — the screen decides how an urgent
 * deadline or a settled fixture should look. This decides only what is true.
 */

const IDENTITY_TINTS = 7;
/** Below this the screen calls the next lock urgent. */
export const URGENT_WITHIN_MS = 2 * 60 * 60 * 1000;

/**
 * A member's palette slot, keyed by their own id rather than their row
 * position — a position-keyed tint repaints the same person a different colour
 * every time the table reorders, which is what a settlement does.
 */
export function identityTint(membershipId: string): number {
  let hash = 0;
  for (let i = 0; i < membershipId.length; i++) {
    hash = (hash * 31 + membershipId.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % IDENTITY_TINTS) + 1;
}

export type LeagueOverviewPhase = 'urgent' | 'caughtup' | 'live';

export interface StandingRow {
  membershipId: string;
  position: number;
  name: string;
  initials: string;
  points: number;
  tint: number;
  isYou: boolean;
}

export interface NextFixture {
  leagueFixtureId: string;
  homeName: string;
  homeCode: string;
  awayName: string;
  awayCode: string;
  homeLogo: string | null;
  awayLogo: string | null;
  kickoffAt: string | null;
  /** Answered and required for this fixture alone, not the whole season. */
  answered: number;
  required: number;
}

export interface LastResult {
  /** So the block can open the results screen rather than being a dead panel. */
  leagueFixtureId: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  homeLogo: string | null;
  awayLogo: string | null;
  score: string | null;
  pointsAwarded: number | null;
  outcome: 'won' | 'part' | 'lost' | 'void' | null;
  breakdown: Array<{ label: string; points: string; correct: boolean }>;
}

/**
 * The smallest single market that would close a gap, in the member's words.
 *
 * The design's third line — "One exact score would do it." It turns a number
 * into an action, which is the whole point of quoting the gap at all.
 */
export function closingMarketFor(gapPoints: number, markets: Array<{ label: string; points: number }>): string | null {
  if (gapPoints <= 0) return null;
  const enough = markets
    .filter(m => m.points >= gapPoints)
    .sort((a, b) => a.points - b.points)[0];
  return enough ? `One ${enough.label.toLowerCase()} would do it.` : null;
}

export interface RivalGap {
  /** How the member sits in the whole league, not the loaded page of it. */
  positionLabel: string;
  /** Null when the member leads, or has no standing yet. */
  behind: { points: number; name: string } | null;
  clearOf: { points: number; positionLabel: string } | null;
}

export function toStandingRows(
  entries: Api<'StandingEntryDto'>[],
  ownMembershipId: string | undefined,
  ownDisplayName: string | undefined,
): StandingRow[] {
  return entries.map(entry => {
    const isYou = entry.membershipId === ownMembershipId;
    const name = isYou && ownDisplayName ? ownDisplayName : entry.displayName;
    return {
      membershipId: entry.membershipId,
      position: entry.position,
      name,
      initials: name.substring(0, 2).toUpperCase(),
      points: entry.totalPoints,
      tint: identityTint(entry.membershipId),
      isYou,
    };
  });
}

/**
 * The rows either side of the member, not the top of the table.
 *
 * The design frames this block around whoever you are chasing: three rows with
 * the viewer in the middle. Listing the leaders instead shows five strangers in
 * a league of any size, and the gap line underneath — which is computed against
 * your actual neighbour — then reads against people you are nowhere near.
 */
export function toNeighbourhood(rows: StandingRow[], size = 5): StandingRow[] {
  const me = rows.findIndex(row => row.isYou);
  if (me === -1) return rows.slice(0, size);

  const before = Math.floor((size - 1) / 2);
  // Clamped so the window stays `size` long at either end of the table rather
  // than shrinking when the member is first or last.
  const start = Math.max(0, Math.min(me - before, rows.length - size));
  return rows.slice(start, start + size);
}

export function toRivalGap(rows: StandingRow[], totalMembers: number): RivalGap {
  const me = rows.find(r => r.isYou);
  if (!me) return { positionLabel: 'Not ranked yet', behind: null, clearOf: null };

  const above = rows.find(r => r.position === me.position - 1);
  const below = rows.find(r => r.position === me.position + 1);

  return {
    positionLabel: `You are ${ordinal(me.position)} of ${totalMembers}`,
    behind: above ? { points: above.points - me.points, name: above.name } : null,
    clearOf: below ? { points: me.points - below.points, positionLabel: ordinal(below.position) } : null,
  };
}

export function toLastResult(
  fixture: {
    leagueFixtureId: string;
    homeTeam: string; awayTeam: string; homeTeamCode: string; awayTeamCode: string;
    homeTeamLogoUrl?: string | null; awayTeamLogoUrl?: string | null;
    score?: { home: number; away: number }; pointsAwarded?: number;
    predictionState?: string;
  },
  results: FixtureResultsResponse | undefined,
): LastResult {
  const outcome = fixture.predictionState === 'won' || fixture.predictionState === 'part'
    || fixture.predictionState === 'lost' || fixture.predictionState === 'void'
    ? fixture.predictionState : null;

  return {
    leagueFixtureId: fixture.leagueFixtureId,
    homeName: fixture.homeTeam,
    awayName: fixture.awayTeam,
    homeCode: fixture.homeTeamCode,
    awayCode: fixture.awayTeamCode,
    homeLogo: fixture.homeTeamLogoUrl ?? null,
    awayLogo: fixture.awayTeamLogoUrl ?? null,
    score: fixture.score ? `${fixture.score.home} — ${fixture.score.away}` : null,
    pointsAwarded: fixture.pointsAwarded ?? null,
    outcome,
    breakdown: (results?.markets ?? []).map(m => ({
      // Both lineups are one market type, so without the side they render as
      // two identical chips.
      label: m.marketType === 'lineup' && m.side
        ? `${m.side === 'home' ? 'Home' : 'Away'} lineup`
        : MARKET_LABELS[m.marketType] ?? m.marketType,
      points: m.viewerOutcome ? (m.viewerOutcome.pointsDelta > 0 ? `+${m.viewerOutcome.pointsDelta}` : '0') : '',
      correct: m.viewerOutcome?.outcome === 'correct',
    })),
  };
}

/** Time to the next lock, as the hero says it. */
export function timeUntil(deadlineAt: string | null, nowMs: number): string {
  if (!deadlineAt) return '—';
  const diff = Date.parse(deadlineAt) - nowMs;
  if (diff <= 0) return '0m';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export function phaseFor(
  { complete, required }: { complete: boolean; required: number },
  deadlineAt: string | null,
  nowMs: number,
): LeagueOverviewPhase {
  if (required > 0 && complete) return 'caughtup';
  if (deadlineAt && Date.parse(deadlineAt) - nowMs <= URGENT_WITHIN_MS) return 'urgent';
  return 'live';
}
