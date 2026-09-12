import Link from 'next/link';
import { LeagueColumn } from './LeagueColumn';
import { TeamCrest } from '../TeamCrest';
import { timeUntilLabel } from '@/lib/format';
import { FIXTURE_FILTERS, type FixtureFilter } from '@/lib/leagues/league-fixtures';
import { tintFor } from '@/lib/crest';
import Image from 'next/image';
import { groupByDay, stateLabel, type FixtureCounts, type FixtureRow, type FixtureView } from '@/lib/leagues/league-fixtures';

/**
 * The league fixtures list — one component for both platforms.
 *
 * Two views on the same data: what is coming, and what has been played. The
 * switch lives in the URL rather than in local state, so a season's worth of
 * rows never has to be shipped to the browser just to let a tab toggle: only
 * the view being looked at is rendered, a window at a time.
 */


/** Green once something landed, muted when nothing did or nothing is settled. */
const stateTone = (state: FixtureRow['state'], view: FixtureView) => {
  if (view !== 'results') return state === 'ready' ? 'text-[var(--success-text)]' : 'text-[var(--text-muted)]';
  return state === 'won' || state === 'part' ? 'text-[var(--success-text)]' : 'text-[var(--text-muted)]';
};


/**
 * Upcoming and results answer different questions, so the design gives them
 * different columns rather than one compromise set that suits neither.
 */
const GRID_MD = 'md:grid md:grid-cols-[104px_minmax(0,1fr)_78px_minmax(0,330px)_88px_84px] md:items-center';

const HEADS: Record<FixtureView, [string, string, string]> = {
  upcoming: ['Kick-off', 'Your answers', 'Locks in'],
  results: ['Score', 'What landed', 'Points'],
};

/**
 * One fixture, one element.
 *
 * The phone stacks the crests beside the names and folds progress and deadline
 * into the right edge; the width gives each its own column. Rendering both and
 * hiding one put 328KB — half this screen's markup — into the document for a
 * width the reader is not on.
 */
function Row({ row, view, nowMs }: { row: FixtureRow; view: FixtureView; nowMs: number }) {
  const urgent = view === 'upcoming' && row.state === 'open';
  return (
    <Link
      href={row.href}
      className={`flex items-center gap-[11px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] last:border-b ${GRID_MD} md:gap-[16px] md:py-[14px] md:px-[4px] md:border-t-0 md:border-b md:last:border-b md:hover:bg-[var(--surface-subtle)] md:transition-colors ${urgent ? 'md:bg-[var(--accent-surface)] md:shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}
    >
      <span className="hidden md:inline-flex items-center justify-self-start h-[19px] px-[7px] rounded-[4px] font-heading font-bold text-[8.5px] tracking-[0.06em] flex-none bg-[var(--surface-subtle)]">
        <span className={stateTone(row.state, view)}>{stateLabel(row.state, view).toUpperCase()}</span>
      </span>

      <div className="flex items-center gap-[11px] md:gap-[10px] min-w-0 flex-1 md:flex-none">
        <div className="flex flex-col gap-[3px] flex-none">
          <TeamCrest code={row.homeCode} logoUrl={row.homeLogo} size={22} />
          <TeamCrest code={row.awayCode} logoUrl={row.awayLogo} size={22} />
        </div>
        <div className="min-w-0">
          <div className="font-heading font-semibold text-[13px] md:text-[13px] md:tracking-[-0.1px] truncate">{row.homeName}</div>
          <div className="font-heading font-semibold text-[13px] md:tracking-[-0.1px] truncate mt-[4px] md:mt-[3px]">{row.awayName}</div>
        </div>
      </div>

      <div className={`flex-none text-center min-w-[54px] md:min-w-0 ${view === 'results'
        ? 'font-heading font-bold text-[15px] tracking-[-0.4px] tf-num'
        : 'font-heading font-semibold text-[12px] text-[var(--text-muted)] tf-num'}`}>
        {row.middle}
      </div>

      <div className="hidden md:block text-[11.5px] text-[var(--text-secondary)] truncate">
        {view === 'upcoming' ? (row.progress ?? '—') : (row.note ?? '—')}
      </div>

      <div className={`flex-none text-right min-w-[92px] md:min-w-0 ${view === 'results'
        ? `font-heading font-bold text-[14px] tf-num ${row.points && row.points !== '0' ? 'md:text-[var(--success-text)]' : 'md:text-[var(--text-muted)]'}`
        : `font-heading font-semibold text-[12px] tf-num ${urgent ? 'md:text-[var(--accent-text-strong)]' : 'md:text-[var(--text-secondary)]'}`}`}>
        <span className="md:hidden block text-[10.5px] font-normal">
          <span className={stateTone(row.state, view)}>{stateLabel(row.state, view)}</span>
        </span>
        <span className="md:hidden block mt-[3px]">{view === 'results' ? (row.points ?? '') : ''}</span>
        <span className="hidden md:block">
          {view === 'results'
            ? (row.points ?? '—')
            : (row.deadlineAt ? timeUntilLabel(row.deadlineAt, nowMs) : '—')}
        </span>
      </div>

      {/* A fixture that has kicked off but is not yet marked finished stays in
          Upcoming with every market locked. Offering "answer" there sends the
          reader to a screen with nothing to press. */}
      <span className={`hidden md:block text-right font-heading font-bold text-[10px] tracking-[0.05em] ${urgent || row.state === 'ready' ? 'text-[var(--text-link)]' : 'text-[var(--text-muted)]'}`}>
        {view === 'results' ? 'REVIEW' : row.deadlineAt ? 'ANSWER' : 'VIEW'}
      </span>
    </Link>
  );
}

export function LeagueFixturesScreen({
  leagueId, leagueName, competition, view, filter, filterCounts, rows, counts, horizon,
  showMoreHref,
}: {
  leagueId: string;
  leagueName: string;
  competition: string;
  view: FixtureView;
  filter: FixtureFilter;
  /** Counted over the whole upcoming half, not the window on screen. */
  filterCounts: Record<FixtureFilter, number>;
  /** The active view only, already windowed. */
  rows: FixtureRow[];
  counts: FixtureCounts;
  /** How far ahead Upcoming is looking, and what that leaves out. */
  horizon: { weeks: number; beyond: number };
  /** Null once the window covers the whole view. */
  showMoreHref: string | null;
}) {
  const days = groupByDay(rows);
  // One clock for the whole table, so every "locks in" is measured from the
  // same instant rather than drifting a row at a time.
  const nowMs = Date.now();

  return (
    <LeagueColumn className="md:pt-[20px]">




          <div className="flex gap-[6px] p-[12px_var(--gutter)] md:px-0 md:pt-0 border-b border-[var(--surface-border)] md:border-b-0">
            {([['upcoming', 'Upcoming', counts.upcoming], ['results', 'Results', counts.results]] as const).map(([id, label, count]) => {
              const on = view === id;
              return (
                <Link
                  key={id}
                  href={`/leagues/${leagueId}/fixtures?view=${id}`}
                  aria-current={on ? 'page' : undefined}
                  scroll={false}
                  className="tf-tap flex items-center h-[34px] px-[14px] rounded-full cursor-pointer whitespace-nowrap font-heading font-semibold text-[12px]"
                  style={on
                    ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' }
                    : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}
                >
                  {label}
                  <span className="ml-[7px] tf-num" style={{ opacity: on ? 0.7 : 0.55 }}>{count}</span>
                </Link>
              );
            })}
          </div>

          {/* What span is on screen. The design says "Round 3" here; a league
              running two competitions has no single round, so this names the
              window instead — and a member can always see which it is. */}
          {view === 'upcoming' && (
            <div className="px-[var(--gutter)] md:px-0 pt-[12px] md:pt-[14px] text-[11.5px] text-[var(--text-muted)]">
              {horizon.weeks === 1 ? 'Kicking off in the next 7 days' : `Kicking off in the next ${horizon.weeks} weeks`}
              {horizon.beyond > 0 && ` · ${horizon.beyond} further on`}
            </div>
          )}

          {view === 'upcoming' && (
            <div className="hidden md:flex items-center gap-[7px] mt-[14px]">
              {FIXTURE_FILTERS.map(f => {
                const on = filter === f.id;
                return (
                  <Link
                    key={f.id}
                    href={`/leagues/${leagueId}/fixtures?view=upcoming&filter=${f.id}`}
                    aria-current={on ? 'page' : undefined}
                    scroll={false}
                    className="flex items-center h-[32px] px-[13px] rounded-full whitespace-nowrap flex-none font-heading font-semibold text-[11.5px]"
                    style={on
                      ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' }
                      : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}
                  >
                    {f.label}
                    <span className="ml-[6px] tf-num" style={{ opacity: on ? 0.7 : 0.55 }}>{filterCounts[f.id]}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {rows.length === 0 ? (
            <div className="p-[60px_30px] text-center">
              <div className="font-heading font-bold text-[18px] tracking-[-0.4px]">
                {view === 'upcoming' ? 'No fixtures left to play' : 'Nothing settled yet'}
              </div>
              <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px] max-w-[340px] mx-auto">
                {view === 'upcoming'
                  ? 'Every fixture in this league has been played. The results are in the other tab.'
                  : 'Results appear here once a fixture has been played and its markets settle.'}
              </p>
            </div>
          ) : (
            days.map((day, dayIndex) => (
              <section key={day.label} className="mt-[18px] md:mt-[24px]">
                {dayIndex === 0 && (
                  <div className={`hidden ${GRID_MD} md:gap-[16px] px-[4px] pb-[8px] border-b border-[var(--surface-border-strong)] mb-[6px]`}>
                    <span className="tf-kicker">State</span>
                    <span className="tf-kicker">Fixture</span>
                    <span className="tf-kicker text-center">{HEADS[view][0]}</span>
                    <span className="tf-kicker">{HEADS[view][1]}</span>
                    <span className="tf-kicker text-right">{HEADS[view][2]}</span>
                    <span />
                  </div>
                )}
                <div className="p-[0_var(--gutter)_9px] md:px-0 md:pb-[10px] md:border-b md:border-[var(--surface-border-strong)]">
                  <span className="tf-kicker text-[var(--text-muted)] md:text-[13px] md:tracking-[-0.1px] md:normal-case md:font-bold md:text-[var(--text-primary)]">{day.label}</span>
                </div>
                {day.rows.map(row => <Row key={row.id} row={row} view={view} nowMs={nowMs} />)}
              </section>
            ))
          )}

          {showMoreHref && (
            <div className="px-[var(--gutter)] md:px-0 pt-[18px]">
              <Link
                href={showMoreHref}
                scroll={false}
                className="tf-tap flex items-center justify-center h-[44px] rounded-[12px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px] text-[var(--text-secondary)]"
              >
                {/* Either widening the page or widening the window; the label
                    says which, so "Show more" on a full week does not look like
                    it has nothing left to do. */}
                {view === 'upcoming' && rows.length >= counts.upcoming ? (
                  <>
                    Show the next week
                    <span className="ml-[7px] tf-num opacity-60">{horizon.beyond} further on</span>
                  </>
                ) : (
                  <>
                    Show more
                    <span className="ml-[7px] tf-num opacity-60">
                      {rows.length} of {view === 'upcoming' ? counts.upcoming : counts.results}
                    </span>
                  </>
                )}
              </Link>
            </div>
          )}
    </LeagueColumn>
  );
}
