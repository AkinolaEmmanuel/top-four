import Link from 'next/link';
import { TeamCrest } from '../TeamCrest';
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


function Row({ row, view }: { row: FixtureRow; view: FixtureView }) {
  return (
    <Link
      href={row.href}
      className="flex items-center gap-[11px] p-[13px_var(--gutter)] md:px-[8px] border-t border-[var(--surface-border)] last:border-b md:hover:bg-[var(--surface-subtle)] md:transition-colors"
    >
      <div className="flex flex-col gap-[3px] flex-none">
        <TeamCrest code={row.homeCode} logoUrl={row.homeLogo} size={24} />
        <TeamCrest code={row.awayCode} logoUrl={row.awayLogo} size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-[13px] md:text-[14px] truncate">{row.homeName}</div>
        <div className="font-heading font-semibold text-[13px] md:text-[14px] truncate mt-[4px]">{row.awayName}</div>
      </div>

      <div className="flex-none text-center min-w-[54px]">
        <div className={view === 'results'
          ? 'font-heading font-bold text-[15px] tracking-[-0.4px] tf-num'
          : 'font-heading font-semibold text-[12px] text-[var(--text-muted)] tf-num'}>
          {row.middle}
        </div>
      </div>

      <div className="flex-none text-right min-w-[92px] hidden sm:block">
        <div className={`text-[10.5px] ${stateTone(row.state, view)}`}>{stateLabel(row.state, view)}</div>
        {row.points && <div className="tf-num font-heading font-bold text-[13px] mt-[3px]">{row.points}</div>}
      </div>
    </Link>
  );
}

export function LeagueFixturesScreen({
  leagueId, leagueName, competition, view, rows, counts, unansweredBadge, showMoreHref,
}: {
  leagueId: string;
  leagueName: string;
  competition: string;
  view: FixtureView;
  /** The active view only, already windowed. */
  rows: FixtureRow[];
  counts: FixtureCounts;
  unansweredBadge: string;
  /** Null once the window covers the whole view. */
  showMoreHref: string | null;
}) {
  const days = groupByDay(rows);

  return (
    <>




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
            days.map(day => (
              <section key={day.label} className="mt-[18px] md:mt-[24px]">
                <div className="p-[0_var(--gutter)_9px] md:px-0 md:pb-[10px] md:border-b md:border-[var(--surface-border-strong)]">
                  <span className="tf-kicker text-[var(--text-muted)] md:text-[13px] md:tracking-[-0.1px] md:normal-case md:font-bold md:text-[var(--text-primary)]">{day.label}</span>
                </div>
                {day.rows.map(row => <Row key={row.id} row={row} view={view} />)}
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
                Show more
                <span className="ml-[7px] tf-num opacity-60">
                  {rows.length} of {view === 'upcoming' ? counts.upcoming : counts.results}
                </span>
              </Link>
            </div>
          )}

          <p className="p-[20px_var(--gutter)_26px] md:px-0 text-[11px] leading-[1.6] text-[var(--text-muted)]">
            A fixture stays readable after it settles. Points are provisional until review closes, and a voided market scores nothing for anyone.
          </p>
    </>
  );
}
