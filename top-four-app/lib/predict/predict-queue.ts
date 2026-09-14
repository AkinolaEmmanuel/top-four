import type { Api } from '@/lib/api/types';
import { pluralise, countdownLabel } from '@/lib/format';

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

/** One league a task is outstanding in, with that league's own progress. */
export interface PredictEntryLeague {
  id: string;
  name: string;
  href: string;
  deadlineAt: string | null;
  /** This league's own "1 of 8" — two leagues on one match rarely agree. */
  progressLabel: string;
}

export interface PredictEntry {
  id: string;
  kind: 'fixture' | 'custom_question';
  title: string;
  /**
   * Every league this same match is outstanding in, soonest deadline first.
   *
   * The feed is keyed per (league, fixture), so one match filled a row per
   * league. Grouped, the row still has to carry each league's own progress:
   * answering in one does not advance the other, and the two numbers differ.
   */
  leagues: PredictEntryLeague[];
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
    // The real match, not the per-league row, so two leagues running it group.
    id: isFixture ? task.fixtureId : task.question.id,
    kind: isFixture ? 'fixture' : 'custom_question',
    title: isFixture
      ? `${task.homeTeam.displayName} v ${task.awayTeam.displayName}`
      : task.question.questionText,
    leagues: [{
      id: task.league.id,
      name: task.league.name,
      href: isFixture
        ? `/predict/fixture/${task.leagueFixtureId}?leagueId=${task.league.id}`
        : `/leagues/${task.league.id}/questions`,
      deadlineAt,
      progressLabel: progress
        ? `${progress.answered} of ${progress.required}`
        : openCount > 0 ? pluralise(openCount, 'market') : 'Open',
    }],
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

/** Sorts null last: a task with no deadline cannot be the soonest. */
function soonest(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return Date.parse(a) - Date.parse(b);
}

/**
 * The queue, one row per real match.
 *
 * A custom question belongs to one league and is never shared, so questions are
 * left alone. Fixtures group on the canonical `fixtureId`; the row then counts
 * down to whichever league locks first and links there, and its bar sums the
 * markets across them all — the per-league figures stay on the chips.
 *
 * Feed this the tasks the league filter has already kept. Filtered to one
 * league every row has exactly one, which is the screen as it was.
 */
export function toPredictEntries(tasks: PredictTask[], nowMs: number): PredictEntry[] {
  const byId = new Map<string, PredictEntry>();

  for (const task of tasks) {
    const entry = toPredictEntry(task, nowMs);
    const existing = task.kind === 'fixture' ? byId.get(entry.id) : undefined;
    if (!existing) {
      byId.set(entry.id, entry);
      continue;
    }
    if (existing.leagues.some(l => l.id === entry.leagues[0].id)) continue;

    existing.leagues = [...existing.leagues, ...entry.leagues]
      .sort((a, b) => soonest(a.deadlineAt, b.deadlineAt));
    existing.openCount += entry.openCount;
    existing.openLabel = existing.openCount > 0 ? pluralise(existing.openCount, 'market') : 'Open';

    // The bar spans every league, so it reads as the work left on this match.
    if (existing.progress && entry.progress) {
      existing.progress = {
        answered: existing.progress.answered + entry.progress.answered,
        required: existing.progress.required + entry.progress.required,
        actionable: existing.progress.actionable + entry.progress.actionable,
      };
      existing.progressLabel = `${existing.progress.answered} of ${existing.progress.required}`;
    }

    // The row follows whichever locks first, and says so.
    const first = existing.leagues[0];
    existing.deadlineAt = first.deadlineAt;
    existing.href = first.href;
    existing.bucket = bucketFor(first.deadlineAt, nowMs);
    existing.urgent = !!first.deadlineAt && Date.parse(first.deadlineAt) - nowMs <= URGENT_WITHIN_MS;
  }

  return [...byId.values()];
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
  const leagues = new Set(entries.flatMap(e => e.leagues.map(l => l.id))).size;
  const markets = openMarketCount(entries);
  // The market total belongs here rather than in the headline: it is worth
  // knowing and useless as a hero. "474 markets to answer" reads as a backlog
  // nobody could clear, when it is really this week's thirty matches.
  const parts = [pluralise(leagues, 'league')];
  if (markets > 0) parts.push(pluralise(markets, 'market'));

  const soonest = entries
    .map(e => e.deadlineAt)
    .filter((at): at is string => !!at)
    .sort()[0];

  if (soonest) {
    const ms = Date.parse(soonest) - nowMs;
    if (ms <= 0) {
      parts.push('next locks any moment');
    } else {
      parts.push(`next locks in ${countdownLabel(ms)}`);
    }
  }

  return `across ${parts.join(' · ')}`;
}

/** The filter sentinel meaning "every league", kept out of the id space. */
export const ALL_LEAGUES = '__all__';
