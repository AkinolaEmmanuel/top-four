'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LeagueTabs } from './LeagueTabs';
import { groupByDay, stateLabel, type FixtureCounts, type FixtureRow, type FixtureView } from '@/lib/leagues/league-fixtures';

/**
 * The league fixtures list — one component for both platforms.
 *
 * Two views on the same data: what is coming, and what has been played. The
 * switch between them is the only thing this holds locally.
 */

const CLUB_TINTS: Record<string, string> = {
  ARS: '#c8182f', CHE: '#1746a2', LIV: '#b7152b', TOT: '#17233d',
  MCI: '#559ac7', EVE: '#153c85', MUN: '#d1262f', NEW: '#20242a',
};
const tintFor = (code: string) => CLUB_TINTS[code] || '#4b5563';

/** Green once something landed, muted when nothing did or nothing is settled. */
const stateTone = (state: FixtureRow['state'], view: FixtureView) => {
  if (view !== 'results') return state === 'ready' ? 'text-[var(--success-text)]' : 'text-[var(--text-muted)]';
  return state === 'won' || state === 'part' ? 'text-[var(--success-text)]' : 'text-[var(--text-muted)]';
};

function Crest({ logo, code, size }: { logo: string | null; code: string; size: number }) {
  const height = Math.round(size * 1.1);
  if (logo) {
    return (
      <span className="tf-crest relative overflow-hidden bg-white flex-none" style={{ width: size, height }}>
        <Image src={logo} alt={code} fill sizes={`${size}px`} className="object-contain p-[2px]" />
      </span>
    );
  }
  return (
    <span className="tf-crest flex-none" style={{ background: tintFor(code), width: size, height, fontSize: Math.round(size * 0.32) }}>{code}</span>
  );
}

function Row({ row, view }: { row: FixtureRow; view: FixtureView }) {
  return (
    <Link
      href={row.href}
      className="flex items-center gap-[11px] p-[13px_var(--gutter)] md:px-[8px] border-t border-[var(--surface-border)] last:border-b md:hover:bg-[var(--surface-subtle)] md:transition-colors"
    >
      <div className="flex flex-col gap-[3px] flex-none">
        <Crest logo={row.homeLogo} code={row.homeCode} size={24} />
        <Crest logo={row.awayLogo} code={row.awayCode} size={24} />
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
  leagueId, leagueName, competition, upcoming, results, counts, unansweredBadge,
}: {
  leagueId: string;
  leagueName: string;
  competition: string;
  upcoming: FixtureRow[];
  results: FixtureRow[];
  counts: FixtureCounts;
  unansweredBadge: string;
}) {
  // Opens on whichever half has something in it — a league whose fixtures have
  // all been played should not open on an empty "Upcoming".
  const [view, setView] = useState<FixtureView>(counts.upcoming > 0 ? 'upcoming' : 'results');

  const rows = view === 'upcoming' ? upcoming : results;
  const days = groupByDay(rows);

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:p-0 md:bg-[var(--surface-card)] md:border-b md:border-[var(--surface-border)]">
        <div className="flex items-center gap-[11px] md:max-w-[1080px] md:mx-auto md:px-[24px] md:h-[54px] md:items-end">
          <Link href={`/leagues/${leagueId}`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px] md:hidden">‹</Link>
          <div className="min-w-0 flex-1 md:flex md:items-baseline md:gap-[10px] md:pb-[11px]">
            <div className="font-heading font-[650] md:font-bold text-[17px] md:text-[14.5px] leading-[1.1] tracking-[-0.3px] truncate md:text-[var(--text-primary)]">{leagueName}</div>
            <div className="text-[10.5px] md:text-[11px] text-[var(--nav-text-faint)] md:text-[var(--text-muted)] mt-[4px] md:mt-0">{competition}</div>
          </div>
        </div>
      </header>

      <LeagueTabs leagueId={leagueId} active="fixtures" badge={unansweredBadge} />

      <main className="tf-scroll flex-1 overflow-auto pb-[86px] md:pb-[26px]">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:pt-[20px]">

          <div className="flex gap-[6px] p-[12px_var(--gutter)] md:px-0 md:pt-0 border-b border-[var(--surface-border)] md:border-b-0">
            {([['upcoming', 'Upcoming', counts.upcoming], ['results', 'Results', counts.results]] as const).map(([id, label, count]) => {
              const on = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setView(id)}
                  className="flex items-center h-[34px] px-[14px] rounded-full cursor-pointer whitespace-nowrap font-heading font-semibold text-[12px]"
                  style={on
                    ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' }
                    : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}
                >
                  {label}
                  <span className="ml-[7px] tf-num" style={{ opacity: on ? 0.7 : 0.55 }}>{count}</span>
                </button>
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

          <p className="p-[20px_var(--gutter)_26px] md:px-0 text-[11px] leading-[1.6] text-[var(--text-muted)]">
            A fixture stays readable after it settles. Points are provisional until review closes, and a voided market scores nothing for anyone.
          </p>
        </div>
      </main>
    </div>
  );
}
