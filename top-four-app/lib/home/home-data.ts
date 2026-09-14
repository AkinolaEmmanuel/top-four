import type { Api } from '@/lib/api/types';
import { leagueInitials } from '@/lib/leagues/lifecycle';
import type { LeagueListItem } from '@/lib/api/leagues';
import { ordinal, pluralise } from '@/lib/format';

/**
 * The home screen's data, shaped once on the server.
 *
 * Everything here is a fact — a name, a time, a count. No class names and no
 * colours: the screen decides how an urgent deadline or a settled league should
 * look. That split is what lets one responsive component replace the two twins
 * this screen used to need.
 */

export type PredictionTask = Api<'PredictionTaskPageDto'>['items'][number];

/** A team as the screen draws it. */
export interface TeamIdentity {
  code: string;
  name: string;
  logoUrl: string | null;
}

/** One league a queue row can be answered in. */
export interface QueueLeague {
  id: string;
  name: string;
  href: string;
  deadlineAt: string | null;
  openLabel: string;
}

export interface HomeQueueEntry {
  id: string;
  kind: 'fixture' | 'custom_question';
  title: string;
  competition: string;
  /**
   * Every league this same match is still open in, soonest deadline first.
   *
   * The feed is keyed per (league, fixture), so a member in three leagues that
   * all run the same match had three full-size rows for one game. One row now
   * carries them all and names each.
   */
  leagues: QueueLeague[];
  /** The soonest deadline across those leagues — what the row counts down to. */
  deadlineAt: string | null;
  openLabel: string;
  home: TeamIdentity | null;
  away: TeamIdentity | null;
  /** The soonest league's link: the row's primary action. */
  href: string;
}

export interface HomeLeagueEntry {
  id: string;
  name: string;
  crest: string;
  competition: string;
  standing: string | null;
  points: string | null;
}

/**
 * The feed now carries `code` and `logoUrl` directly. It did not until recently,
 * which is why this screen used to walk the whole competition catalogue to
 * recover them; that walk is gone. `code` is still nullable upstream, so the
 * initials remain as a fallback.
 */
export function toTeamIdentity(team: { code: string | null; logoUrl: string | null; displayName: string }): TeamIdentity {
  return {
    code: team.code || team.displayName.substring(0, 3).toUpperCase(),
    name: team.displayName,
    logoUrl: team.logoUrl,
  };
}

export function toQueueEntry(task: PredictionTask): HomeQueueEntry {
  if (task.kind === 'fixture') {
    const open = task.missingPredictions?.length ?? 0;
    const league: QueueLeague = {
      id: task.league.id,
      name: task.league.name,
      href: `/predict/fixture/${task.leagueFixtureId}?leagueId=${task.league.id}`,
      deadlineAt: task.nextDeadlineAt ?? null,
      openLabel: open > 0 ? pluralise(open, 'market') : 'Open',
    };
    return {
      // The real-world match, not the per-league row, so two leagues running it
      // land on the same entry.
      id: task.fixtureId,
      kind: 'fixture',
      title: `${task.homeTeam.displayName} v ${task.awayTeam.displayName}`,
      competition: task.competition?.displayName || 'Match',
      leagues: [league],
      deadlineAt: league.deadlineAt,
      openLabel: league.openLabel,
      home: toTeamIdentity(task.homeTeam),
      away: toTeamIdentity(task.awayTeam),
      href: league.href,
    };
  }

  const league: QueueLeague = {
    id: task.league.id,
    name: task.league.name,
    href: `/leagues/${task.league.id}/questions`,
    deadlineAt: task.question.deadlineAt ?? null,
    openLabel: 'Open',
  };
  return {
    id: task.question.id,
    kind: 'custom_question',
    title: task.question.questionText,
    competition: 'Custom question',
    leagues: [league],
    deadlineAt: league.deadlineAt,
    openLabel: league.openLabel,
    home: null,
    away: null,
    href: league.href,
  };
}

/** Sorts null last: a row with no deadline cannot be the soonest. */
function soonest(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return Date.parse(a) - Date.parse(b);
}

/**
 * The queue, one row per real match.
 *
 * A custom question is a per-league thing of its own — two leagues never share
 * one — so questions are never grouped. Fixtures are, on the canonical
 * `fixtureId`; the row then counts down to whichever league locks first and
 * links there, and names every league it is open in.
 *
 * Order is preserved from the feed, which is already deadline-ordered: a match
 * takes the position of its first appearance.
 */
export function toQueueEntries(tasks: PredictionTask[]): HomeQueueEntry[] {
  const byId = new Map<string, HomeQueueEntry>();

  for (const task of tasks) {
    const entry = toQueueEntry(task);
    const existing = task.kind === 'fixture' ? byId.get(entry.id) : undefined;
    if (!existing) {
      byId.set(entry.id, entry);
      continue;
    }
    if (existing.leagues.some(l => l.id === entry.leagues[0].id)) continue;
    existing.leagues = [...existing.leagues, ...entry.leagues]
      .sort((a, b) => soonest(a.deadlineAt, b.deadlineAt));
    existing.deadlineAt = existing.leagues[0].deadlineAt;
    existing.openLabel = existing.leagues[0].openLabel;
    existing.href = existing.leagues[0].href;
  }

  return [...byId.values()];
}

export function toHomeLeague(league: LeagueListItem): HomeLeagueEntry {
  return {
    id: league.id,
    name: league.name,
    crest: leagueInitials(league.name),
    competition: league.competitions[0]?.displayName || 'League',
    standing: league.ownStanding ? ordinal(league.ownStanding.position) : null,
    points: league.ownStanding ? pluralise(league.ownStanding.totalPoints, 'pt') : null,
  };
}
