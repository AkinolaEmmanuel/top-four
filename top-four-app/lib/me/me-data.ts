import type { Api } from '@/lib/api/types';
import type { LeagueListItem } from '@/lib/api/leagues';
import { ordinal, pluralise } from '@/lib/format';

/**
 * The account screen's facts, shaped once on the server.
 */

export type PointsHistoryItem = Api<'PointsHistoryItemDto'>;

export interface FormBar {
  label: string;
  points: number;
  /** A settlement that was later corrected, which the chart marks differently. */
  corrected: boolean;
}

export interface MeLeagueRow {
  id: string;
  name: string;
  crest: string;
  /** The member's position, or the competition name when they have no standing. */
  meta: string;
  points: string;
}

/**
 * Recent form, bucketed by day.
 *
 * The points ledger carries no round number, and the history endpoint is
 * per-league while this screen is account-wide — so this is one league's recent
 * days, not a true "points by round". The screen labels it accordingly.
 */
export function toFormBars(entries: PointsHistoryItem[], days = 10): FormBar[] {
  const byDay = new Map<string, { points: number; corrected: boolean }>();

  for (const entry of entries) {
    const day = entry.occurredAt.slice(0, 10);
    const current = byDay.get(day) ?? { points: 0, corrected: false };
    current.points += entry.delta;
    if (entry.kind === 'correction') current.corrected = true;
    byDay.set(day, current);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-days)
    .map(([day, { points, corrected }]) => ({
      label: new Date(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      points: Math.max(points, 0),
      corrected,
    }));
}

export function toMeLeagueRow(league: LeagueListItem): MeLeagueRow {
  return {
    id: league.id,
    name: league.name,
    crest: league.name.substring(0, 2).toUpperCase(),
    meta: league.ownStanding
      ? `${ordinal(league.ownStanding.position)} of ${pluralise(league.memberCount, 'member')}`
      : league.competitions[0]?.displayName ?? 'No standing yet',
    points: league.ownStanding ? pluralise(league.ownStanding.totalPoints, 'pt') : '—',
  };
}

export function totalPointsAcross(leagues: LeagueListItem[]): number {
  return leagues.reduce((sum, l) => sum + (l.ownStanding?.totalPoints ?? 0), 0);
}

/**
 * The league whose form the chart shows: the one the member is actively
 * playing, falling back to their first.
 */
export function primaryLeague(leagues: LeagueListItem[]): LeagueListItem | undefined {
  return leagues.find(l => l.lifecycleState === 'in_progress' || l.lifecycleState === 'published')
    ?? leagues[0];
}
