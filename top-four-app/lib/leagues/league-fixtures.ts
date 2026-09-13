import type { LeagueFixture } from '@/lib/api/leagues';

/**
 * The league fixtures list, shaped once on the server.
 *
 * The screen has two halves — what is coming and what has been played — and
 * they differ in more than content: the middle column is a kick-off time on one
 * and a score on the other, the right-hand column a countdown or the points won.
 * Both are described here so the component draws one row either way.
 */

export type FixtureView = 'upcoming' | 'results';

export type FixtureFilter = 'all' | 'unanswered' | 'open' | 'locked';

export const FIXTURE_FILTERS: Array<{ id: FixtureFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'open', label: 'Open' },
  { id: 'locked', label: 'Locked' },
];

/** Only the upcoming half is filterable; a result is not open or locked. */
export function matchesFilter(state: LeagueFixture['predictionState'], filter: FixtureFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'unanswered') return state === 'open';
  if (filter === 'open') return state === 'open' || state === 'ready';
  return state === 'syncing';
}

export interface FixtureRow {
  id: string;
  homeName: string;
  homeCode: string;
  homeLogo: string | null;
  awayName: string;
  awayCode: string;
  awayLogo: string | null;
  /** The kick-off time, or the final score once played. */
  middle: string;
  /** What the member's prediction did, once there is something to say. */
  state: LeagueFixture['predictionState'];
  /** Points won, on a played fixture only. */
  points: string | null;
  kickoffAt: string | null;
  /** Answered and required for this fixture, which the phone hides in a note. */
  progress: string | null;
  /** Time until the first market closes, or what landed once it is played. */
  note: string | null;
  deadlineAt: string | null;
  href: string;
}

export interface FixtureCounts {
  upcoming: number;
  results: number;
}

const PLAYED: ReadonlySet<LeagueFixture['status']> = new Set(['finished', 'voided']);

/** Kickoff order. A fixture without a confirmed time sorts last either way. */
function byKickoff(a: LeagueFixture, b: LeagueFixture, newestFirst: boolean): number {
  const at = Date.parse(a.kickoffAt || '');
  const bt = Date.parse(b.kickoffAt || '');
  if (!Number.isFinite(at)) return Number.isFinite(bt) ? 1 : 0;
  if (!Number.isFinite(bt)) return -1;
  return newestFirst ? bt - at : at - bt;
}

/**
 * The two halves, each in the order its own half is read in.
 *
 * Upcoming runs forwards — the thing closing soonest is the thing to act on.
 * Results run backwards, because the fixture a member wants after a weekend is
 * the one that just finished, not the season opener. Availability returns both
 * ascending by kickoff, so the results half is reversed here rather than at the
 * two screens that render it.
 */
export function splitFixtures(fixtures: LeagueFixture[]): Record<FixtureView, LeagueFixture[]> {
  return {
    upcoming: fixtures.filter(f => !PLAYED.has(f.status)).sort((a, b) => byKickoff(a, b, false)),
    results: fixtures.filter(f => PLAYED.has(f.status)).sort((a, b) => byKickoff(a, b, true)),
  };
}

export function toFixtureRow(fixture: LeagueFixture, leagueId: string, view: FixtureView): FixtureRow {
  const played = view === 'results';
  return {
    id: fixture.id,
    homeName: fixture.homeTeam,
    homeCode: fixture.homeTeamCode,
    homeLogo: fixture.homeTeamLogoUrl,
    awayName: fixture.awayTeam,
    awayCode: fixture.awayTeamCode,
    awayLogo: fixture.awayTeamLogoUrl,
    middle: played
      ? (fixture.score ? `${fixture.score.home} — ${fixture.score.away}` : '—')
      : (fixture.kickoffAt
        ? new Date(fixture.kickoffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : 'TBD'),
    state: fixture.predictionState,
    /* A played fixture that has not been scored yet shows a dash, not a zero.
       Zero is a result — "you got nothing" — and the two are not the same
       sentence to somebody waiting on a settlement. */
    points: played
      ? (fixture.pointsAwarded === undefined ? '—' : `+${fixture.pointsAwarded}`)
      : null,
    kickoffAt: fixture.kickoffAt || null,
    progress: typeof fixture.required === 'number' && fixture.required > 0
      ? `${fixture.answered ?? 0} of ${fixture.required}`
      : null,
    note: played ? (fixture.landed ?? null) : (fixture.predictionNote ?? null),
    deadlineAt: fixture.deadlineAt ?? null,
    // A played fixture opens on what the league answered, not on controls that
    // can no longer be used.
    href: played
      ? `/predict/fixture/${fixture.id}/results?leagueId=${leagueId}`
      : `/predict/fixture/${fixture.id}?leagueId=${leagueId}`,
  };
}

/**
 * The state as a chip — one short token, the design's own vocabulary.
 *
 * `stateLabel` below is a sentence, and a sentence does not fit a 19px pill in a
 * 104px column: "Some of it landed" wrapped onto two lines and spilled out of
 * its own background. The design keeps the prose in the row's note and puts
 * a token here.
 */
export function stateChip(state: LeagueFixture['predictionState'], view: FixtureView): string {
  if (view === 'results') {
    switch (state) {
      case 'won': return 'ALL LANDED';
      case 'part': return 'PARTIAL';
      case 'void': return 'VOID';
      case 'lost': return 'NO POINTS';
      case 'missed': return 'NOT ANSWERED';
      default: return 'AWAITING RESULT';
    }
  }
  switch (state) {
    case 'ready': return 'READY';
    case 'open': return 'OPEN';
    case 'syncing': return 'SYNCING';
    default: return 'TO ANSWER';
  }
}

/** What a fixture's prediction state means, in the product's words. */
export function stateLabel(state: LeagueFixture['predictionState'], view: FixtureView): string {
  if (view === 'results') {
    switch (state) {
      case 'won': return 'Everything landed';
      case 'part': return 'Some of it landed';
      case 'void': return 'Voided — nobody scored';
      case 'lost': return 'Nothing landed';
      case 'missed': return 'You did not answer this one';
      default: return 'Not settled yet';
    }
  }
  switch (state) {
    case 'ready': return 'All answered';
    case 'open': return 'Still open';
    case 'syncing': return 'Waiting on the squad list';
    default: return 'Not answered';
  }
}

/** Fixtures grouped by the day they kick off, newest last for upcoming. */
export function groupByDay(rows: FixtureRow[]): Array<{ label: string; rows: FixtureRow[] }> {
  const byDay = new Map<string, FixtureRow[]>();
  for (const row of rows) {
    const key = row.kickoffAt ? row.kickoffAt.slice(0, 10) : 'unscheduled';
    byDay.set(key, [...(byDay.get(key) ?? []), row]);
  }
  return Array.from(byDay.entries()).map(([key, dayRows]) => ({
    label: key === 'unscheduled'
      ? 'Date to be confirmed'
      : new Date(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
    rows: dayRows,
  }));
}
