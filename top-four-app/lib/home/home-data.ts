import type { Api } from '@/lib/api/types';
import type { LeagueListItem } from '@/lib/api/leagues';
import type { CatalogueTeam } from '@/lib/api/catalogue';
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

/** Crest identity, which prediction-tasks does not carry — see `resolveCrest`. */
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
 * `prediction-tasks` returns a team's id and display name but neither its code
 * nor its crest, unlike fixture availability. Until the API carries both, the
 * catalogue is walked to recover them; `crests` is that lookup, and a team
 * missing from it falls back to the first three letters of its name.
 */
export function resolveCrest(
  team: { id: string; displayName: string },
  crests: Record<string, CatalogueTeam>,
): TeamIdentity {
  const known = crests[team.id];
  return {
    code: known?.code || team.displayName.substring(0, 3).toUpperCase(),
    name: team.displayName,
    logoUrl: known?.logoUrl ?? null,
  };
}

export function toQueueEntry(task: PredictionTask, crests: Record<string, CatalogueTeam>): HomeQueueEntry {
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
      home: resolveCrest(task.homeTeam, crests),
      away: resolveCrest(task.awayTeam, crests),
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
    crest: league.name.substring(0, 2).toUpperCase(),
    competition: league.competitions[0]?.displayName || 'League',
    standing: league.ownStanding ? ordinal(league.ownStanding.position) : null,
    points: league.ownStanding ? pluralise(league.ownStanding.totalPoints, 'pt') : null,
  };
}

/** The competitions whose squads must be walked to recover the crests above. */
export function competitionIdsIn(tasks: PredictionTask[]): string[] {
  const ids = tasks
    .filter((t): t is Extract<PredictionTask, { kind: 'fixture' }> => t.kind === 'fixture')
    .map(t => t.competition?.id)
    .filter((id): id is string => !!id);
  return Array.from(new Set(ids));
}
