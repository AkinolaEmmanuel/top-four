import type { Api } from '@/lib/api/types';
import { pluralise } from '@/lib/format';

/**
 * The to-do list's facts, shaped once on the server.
 *
 * Three things the old prop-bag factory got wrong are fixed here rather than
 * carried over: the bucket was hardcoded to today-or-this-week so "Later" could
 * never appear; the league filter was applied on the desktop layout only, so the
 * chips did nothing on a phone; and it matched leagues with `startsWith`, which
 * would also match any league whose name began with another's.
 */

export type PredictTask = Api<'PredictionTaskPageDto'>['items'][number];
export type PredictBucket = 'today' | 'week' | 'later';

export interface PredictEntry {
  id: string;
  kind: 'fixture' | 'custom_question';
  title: string;
  leagueId: string;
  leagueName: string;
  deadlineAt: string | null;
  bucket: PredictBucket;
  /** True inside the last two hours, which the screen draws in red. */
  urgent: boolean;
  openCount: number;
  openLabel: string;
  /**
   * How far through this fixture the member is — the design's "4 of 8".
   *
   * Null for a custom question, which is a single answer and has no progress to
   * report. Until the task feed carried a total there was nothing to divide by,
   * so this row could only say what was left.
   */
  progress: { answered: number; required: number; actionable: number } | null;
  progressLabel: string;
  homeCode: string | null;
  awayCode: string | null;
  homeLogo: string | null;
  awayLogo: string | null;
  href: string;
}

export interface PredictGroup {
  key: PredictBucket;
  label: string;
  note: string;
  entries: PredictEntry[];
}

const GROUP_META: Record<PredictBucket, { label: string; note: string }> = {
  today: { label: 'Locking today', note: 'act on these first' },
  week: { label: 'This week', note: 'these close within seven days' },
  later: { label: 'Later', note: 'open, but no rush' },
};

const URGENT_WITHIN_MS = 2 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Which section a deadline falls in, measured against the server's own clock. */
export function bucketFor(deadlineAt: string | null, nowMs: number): PredictBucket {
  if (!deadlineAt) return 'later';
  const at = Date.parse(deadlineAt);
  const endOfToday = new Date(nowMs);
  endOfToday.setHours(23, 59, 59, 999);
  if (at <= endOfToday.getTime()) return 'today';
  if (at - nowMs <= WEEK_MS) return 'week';
  return 'later';
}

export function toPredictEntry(task: PredictTask, nowMs: number): PredictEntry {
  const isFixture = task.kind === 'fixture';
  const deadlineAt = isFixture ? task.nextDeadlineAt ?? null : task.question.deadlineAt ?? null;
  const openCount = isFixture ? task.missingPredictions?.length ?? 0 : 1;
  const completeness = isFixture ? task.predictionCompleteness : null;
  /*
   * Three numbers, not two.
   *
   * `required - answered` counts every slot still blank; `missingPredictions`
   * counts only the ones still open. They differ once a market locks — a fixture
   * whose lineups have closed is 1 of 8 answered with 5 open and 2 that can
   * never be answered now. Drawing only the first pair gives a bar that cannot
   * reach its end, which reads as a stuck screen rather than a passed deadline.
   */
  const progress = completeness && completeness.required > 0
    ? { ...completeness, actionable: openCount }
    : null;

  return {
    id: isFixture ? task.leagueFixtureId : task.question.id,
    kind: isFixture ? 'fixture' : 'custom_question',
    title: isFixture
      ? `${task.homeTeam.displayName} v ${task.awayTeam.displayName}`
      : task.question.questionText,
    leagueId: task.league.id,
    leagueName: task.league.name,
    deadlineAt,
    bucket: bucketFor(deadlineAt, nowMs),
    urgent: !!deadlineAt && Date.parse(deadlineAt) - nowMs <= URGENT_WITHIN_MS,
    openCount,
    openLabel: openCount > 0 ? pluralise(openCount, 'market') : 'Open',
    progress,
    // Progress where the server gives a total, the backlog where it cannot —
    // a custom question has one answer and nothing to be part-way through.
    progressLabel: progress
      ? `${progress.answered} of ${progress.required}`
      : openCount > 0 ? pluralise(openCount, 'market') : 'Open',
    homeCode: isFixture ? task.homeTeam.code || task.homeTeam.displayName.substring(0, 3).toUpperCase() : null,
    awayCode: isFixture ? task.awayTeam.code || task.awayTeam.displayName.substring(0, 3).toUpperCase() : null,
    homeLogo: isFixture ? task.homeTeam.logoUrl : null,
    awayLogo: isFixture ? task.awayTeam.logoUrl : null,
    href: isFixture
      ? `/predict/fixture/${task.leagueFixtureId}?leagueId=${task.league.id}`
      : `/leagues/${task.league.id}/questions`,
  };
}

/** Groups in the order the screen shows them, empty ones dropped. */
export function toPredictGroups(entries: PredictEntry[]): PredictGroup[] {
  const order: PredictBucket[] = ['today', 'week', 'later'];
  return order
    .map(key => ({ key, ...GROUP_META[key], entries: entries.filter(e => e.bucket === key) }))
    .filter(group => group.entries.length > 0);
}

/** Every market still open in whatever slice it is handed. */
export function openMarketCount(entries: PredictEntry[]): number {
  return entries.reduce((total, entry) => total + entry.openCount, 0);
}

/** Soonest deadline first. A task with no deadline has no urgency, so it sorts last. */
export function byDeadline(a: PredictEntry, b: PredictEntry): number {
  if (!a.deadlineAt) return b.deadlineAt ? 1 : 0;
  if (!b.deadlineAt) return -1;
  return Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt);
}

/** The line under the headline number: how many leagues, and when the next lock is. */
export function summaryLine(entries: PredictEntry[], nowMs: number): string {
  const leagues = new Set(entries.map(e => e.leagueId)).size;
  const parts = [pluralise(leagues, 'league')];

  const soonest = entries
    .map(e => e.deadlineAt)
    .filter((at): at is string => !!at)
    .sort()[0];

  if (soonest) {
    const ms = Date.parse(soonest) - nowMs;
    if (ms <= 0) {
      parts.push('next locks any moment');
    } else {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      parts.push(`next locks in ${h > 0 ? `${h}h ${m}m` : `${m}m`}`);
    }
  }

  return `across ${parts.join(' · ')}`;
}

/** The filter sentinel meaning "every league", kept out of the id space. */
export const ALL_LEAGUES = '__all__';
