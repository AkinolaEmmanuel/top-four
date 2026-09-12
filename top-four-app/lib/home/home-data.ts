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

export interface HomeQueueEntry {
  id: string;
  kind: 'fixture' | 'custom_question';
  title: string;
  competition: string;
  league: string;
  /** The deadline, ISO, so the screen can format it in the viewer's zone. */
  deadlineAt: string | null;
  openLabel: string;
  home: TeamIdentity | null;
  away: TeamIdentity | null;
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
    return {
      id: task.leagueFixtureId,
      kind: 'fixture',
      title: `${task.homeTeam.displayName} v ${task.awayTeam.displayName}`,
      competition: task.competition?.displayName || 'Match',
      league: task.league.name,
      deadlineAt: task.nextDeadlineAt ?? null,
      openLabel: open > 0 ? pluralise(open, 'market') : 'Open',
      home: toTeamIdentity(task.homeTeam),
      away: toTeamIdentity(task.awayTeam),
      href: `/predict/fixture/${task.leagueFixtureId}?leagueId=${task.league.id}`,
    };
  }

  return {
    id: task.question.id,
    kind: 'custom_question',
    title: task.question.questionText,
    competition: 'Custom question',
    league: task.league.name,
    deadlineAt: task.question.deadlineAt ?? null,
    openLabel: 'Open',
    home: null,
    away: null,
    href: `/leagues/${task.league.id}/questions`,
  };
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
