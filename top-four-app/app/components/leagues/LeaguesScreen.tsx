'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '../MobileNav';
import {
  capacityLabel,
  pointsLabel,
  standingLabel,
  toLeagueSections,
  type LeagueListEntry,
  type LeagueSection,
} from '@/lib/leagues/league-list';
import type { LeagueListItem, OwnPendingJoinRequest } from '@/lib/api/leagues';

/**
 * The leagues list — one component for both platforms.
 *
 * This replaces a mobile and a desktop twin that drew the same data from the
 * same prop bag in two hand-maintained markups. The layout difference between
 * them was real but narrow: a stacked row on a phone, a grid row with column
 * headings on a wide screen. Both are expressed here as breakpoints on one row.
 *
 * It is a Client Component only because the section filter is local state; the
 * data arrives already fetched from the server page above it.
 */

const LEAGUE_LIMIT = 20;

/** Crest tints, keyed by the league's initials. Unknown initials take the brand. */
const CREST_TINTS: Record<string, string> = {
  PP: '#0879bf', OL: '#7f56d9', AL: '#0e7a5f', E28: '#667085',
  SF: '#b45309', A24: '#0e7a5f', O24: '#7f56d9', SS: '#1746a2',
  FC: '#b7152b', UN: '#0e7a5f', NB: '#7f56d9', WW: '#c8182f',
};

const crestTint = (crest: string) => CREST_TINTS[crest] || '#0879bf';

function LeagueRow({ entry, isLast }: { entry: LeagueListEntry; isLast: boolean }) {
  const standing = standingLabel(entry);
  const points = pointsLabel(entry);
  const isPending = entry.section === 'pending';

  return (
    <Link
      href={`/leagues/${entry.id}`}
      className={`tf-tap flex items-center gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${isLast ? 'border-b' : ''}
                  md:grid md:gap-[14px] md:p-[13px_16px] md:grid-cols-[34px_minmax(0,1fr)_104px_112px_84px_92px] md:hover:bg-[var(--surface-subtle)] md:transition-colors`}
      style={{ opacity: entry.isPast ? 0.62 : 1 }}
    >
      <span className="tf-crest w-[30px] h-[33px] md:text-[9px]" style={{ background: crestTint(entry.crest) }}>{entry.crest}</span>

      <div className="flex-1 min-w-0 md:flex-none">
        <div className="flex items-center gap-[7px] md:gap-[8px]">
          <span className="font-heading font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{entry.name}</span>
          {entry.roleLabel && (
            <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_6px] rounded-[4px] bg-[var(--surface-subtle)] text-[var(--text-muted)] flex-none uppercase">{entry.roleLabel}</span>
          )}
        </div>
        {/* The phone has no columns, so the design carries the owed figure on
            this line instead — "128 members · 6 to predict". Ours keeps the
            competition too, which the design's row had no room for. */}
        <div className="text-[10.5px] md:text-[11px] text-[var(--text-muted)] mt-[3px]">
          {isPending ? 'Waiting on an admin to approve you' : (
            <>
              {entry.competitions}
              {!!entry.unansweredCount && (
                <span className="md:hidden">
                  {entry.competitions ? ' · ' : ''}
                  <span className="text-[var(--accent-text)] font-semibold tf-num">{entry.unansweredCount} to predict</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Members is a column the width earns: on a phone it is one more figure
          competing with the standing, which is the one a member came for. */}
      <span className="hidden md:block text-right tf-num text-[13px] text-[var(--text-secondary)]">
        {entry.memberCount > 0 ? entry.memberCount.toLocaleString('en-GB') : '—'}
      </span>

      {/* What this league is owed — the one column that asks the member to do
          something, and the reason the list is worth opening at all. Nothing
          owed reads as a dash rather than a zero. */}
      <span className="hidden md:block text-right">
        {entry.unansweredCount ? (
          <span className="font-heading font-bold text-[11px] tf-num p-[3px_9px] rounded-[6px] bg-[var(--accent-surface)] text-[var(--accent-text)]">
            {entry.unansweredCount}
          </span>
        ) : (
          <span className="tf-num text-[13px] text-[var(--text-muted)]">—</span>
        )}
      </span>

      {/* Standing. On a phone it sits right-aligned beside the name; on a wide
          screen it becomes its own column under a heading. */}
      <div className="text-right flex-none">
        {standing ? (
          <>
            <div className="font-heading font-bold text-[15px] tf-num text-[var(--text-primary)]">{standing}</div>
            <div className="text-[10px] tf-num text-[var(--text-muted)] mt-[3px] md:hidden">{points}</div>
          </>
        ) : (
          /* The wide layout's Position column is 84px — the width a place like
             "24th" needs — so the long form wrapped onto two lines there and
             pushed the row taller than its neighbours. The phone has the room. */
          <span className="text-[11.5px] text-[var(--text-muted)]">
            <span className="md:hidden">{isPending ? 'Pending' : 'No standing yet'}</span>
            <span className="hidden md:inline">{isPending ? 'Pending' : '—'}</span>
          </span>
        )}
      </div>

      <div className="hidden md:block text-right">
        {points && <span className="tf-num text-[13px] text-[var(--text-secondary)]">{points}</span>}
      </div>
    </Link>
  );
}

function Section({ section, actionableDays }: { section: LeagueSection; actionableDays: number }) {
  return (
    <section className="mt-[18px] md:mt-[32px] md:first:mt-0">
      <div className="flex items-baseline gap-[8px] md:gap-[10px] p-[0_var(--gutter)_9px] md:p-[0_0_10px] md:border-b md:border-[var(--surface-border-strong)]">
        <span className="font-heading font-bold text-[9.5px] leading-[1] tracking-[0.13em] uppercase text-[var(--text-muted)] md:text-[13px] md:tracking-[-0.1px] md:normal-case md:text-[var(--text-primary)]">{section.label}</span>
        <span className="font-heading font-bold text-[9.5px] tf-num text-[var(--text-muted)] md:text-[11.5px] md:font-normal">{section.entries.length}</span>
      </div>

      {/* Column headings belong to the wide layout only. */}
      <div className="hidden md:grid gap-[14px] items-center p-[10px_16px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)] grid-cols-[34px_minmax(0,1fr)_104px_112px_84px_92px]">
        <span />
        <span className="tf-kicker">League</span>
        <span className="tf-kicker text-right">Members</span>
        {/* The heading says the window, because the number is meaningless
            without it — and it used to be the season's, which is why it read
            "99+" in every real league. */}
        <span className="tf-kicker text-right">To predict · {actionableDays}d</span>
        <span className="tf-kicker text-right">Position</span>
        <span className="tf-kicker text-right">Points</span>
      </div>

      {section.entries.map((entry, i, all) => (
        <LeagueRow key={entry.id} entry={entry} isLast={i === all.length - 1} />
      ))}
    </section>
  );
}

export function LeaguesScreen({ leagues, pendingRequests, limit = LEAGUE_LIMIT, used, actionableDays }: {
  leagues: LeagueListItem[];
  pendingRequests: OwnPendingJoinRequest[];
  limit?: number;
  used: number;
  /** The window "To predict" counts, so the column can say what it means. */
  actionableDays: number;
}) {
  const [filter, setFilter] = useState<string>('All');

  const allSections = toLeagueSections(leagues, pendingRequests);
  const isEmpty = leagues.length === 0 && pendingRequests.length === 0;
  const atCapacity = used >= limit;
  const sections = filter === 'All' ? allSections : allSections.filter(s => s.label === filter);

  const filters = [
    { label: 'All', count: allSections.reduce((n, sec) => n + sec.entries.length, 0) },
    ...allSections.map(s => ({ label: s.label, count: s.entries.length })),
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="flex items-center justify-between md:max-w-[1080px] md:mx-auto md:px-[24px] md:py-[18px] md:gap-[26px]">
          <div className="md:flex-1 md:min-w-0">
            <div className="font-heading font-[650] text-[24px] md:text-[22px] leading-[1] tracking-[-0.8px] md:tracking-[-0.5px] md:font-bold">Leagues</div>
            <div className="font-medium text-[11.5px] md:text-[12px] mt-[6px] md:mt-[5px]" style={{ color: atCapacity ? 'var(--nav-accent)' : 'var(--nav-text-faint)' }}>
              {capacityLabel(used, limit)}
            </div>
          </div>

          {/* One action on a phone, two spelled out on a wide screen. */}
          <Link
            href="/leagues/setup"
            aria-disabled={atCapacity}
            className="tf-tap w-[42px] h-[42px] rounded-[13px] grid place-items-center font-['DM_Sans',sans-serif] text-[24px] flex-none md:hidden"
            style={atCapacity
              ? { background: 'var(--nav-fill)', color: 'var(--nav-text-faint)', cursor: 'not-allowed', pointerEvents: 'none' }
              : { background: 'var(--nav-accent)', color: 'var(--nav-on-accent)' }}
          >+</Link>

          <div className="hidden md:flex gap-[8px] flex-none">
            <Link href="/leagues/join" className="h-[40px] px-[18px] rounded-[11px] border border-[var(--nav-border)] flex items-center font-heading font-semibold text-[12.5px] cursor-pointer hover:bg-[var(--nav-fill)] transition-colors">Join a league</Link>
            <Link
              href="/leagues/setup"
              aria-disabled={atCapacity}
              className={`h-[40px] px-[18px] rounded-[11px] flex items-center font-heading font-bold text-[12.5px] ${atCapacity ? 'bg-[var(--nav-fill)] opacity-40 cursor-not-allowed pointer-events-none' : 'bg-[var(--nav-accent)] text-[var(--nav-on-accent)] cursor-pointer'}`}
            >+ Create a league</Link>
          </div>
        </div>
      </header>

      <main className="tf-scroll flex-1 min-h-0 overflow-auto bg-[var(--surface-canvas)]">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:py-[22px] md:pb-[30px]">

          {!isEmpty && (
            <div className="tf-scroll flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto border-b border-[var(--surface-border)] md:p-0 md:mb-[20px] md:border-b-0 md:overflow-visible">
              {filters.map(f => {
                const on = filter === f.label;
                return (
                  <button
                    key={f.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilter(f.label)}
                    className="flex items-center h-[32px] md:h-[33px] px-[12px] md:px-[13px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px] md:text-[12px]"
                    style={on
                      ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' }
                      : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}
                  >
                    {f.label}
                    <span className="ml-[6px] md:ml-[7px] tf-num" style={{ opacity: on ? 0.7 : 0.55 }}>{f.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {isEmpty ? (
            <div className="p-[70px_30px] md:pt-[100px] md:pb-[60px] flex flex-col items-center text-center animate-[tfin_0.16s_ease]">
              <div className="w-[52px] md:w-[56px] h-[52px] md:h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[20px] md:text-[22px] text-[var(--text-muted)]">◇</div>
              <div className="font-heading font-bold text-[21px] md:text-[24px] leading-[1.2] tracking-[-0.5px] mt-[20px] md:mt-[22px]">Where to join a league</div>
              <div className="text-[13px] md:text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] md:mt-[11px] max-w-[270px] md:max-w-[380px]">Join a league to begin. You can be in up to twenty at once.</div>
              <div className="w-full max-w-[280px] mt-[22px] md:w-auto md:max-w-none md:mt-[24px] md:flex md:gap-[10px]">
                <Link href="/leagues/setup" className="h-[50px] md:h-[46px] md:px-[22px] rounded-[13px] md:rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] md:text-[13px] cursor-pointer">Create a league</Link>
                <Link href="/leagues/join" className="h-[50px] md:h-[46px] md:px-[22px] rounded-[13px] md:rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-semibold text-[13.5px] md:text-[13px] mt-[10px] md:mt-0 cursor-pointer">Join with a code</Link>
              </div>
            </div>
          ) : (
            <div className="animate-[tfin_0.16s_ease]">
              {atCapacity && (
                <div className="m-[14px_var(--gutter)_0] md:mx-0 md:mb-[20px] p-[13px_15px] rounded-[12px] bg-[var(--warn-surface)] border border-[var(--color-warning)]">
                  <div className="font-heading font-semibold text-[12.5px] text-[var(--warn-text)]">All twenty places are used</div>
                  <div className="text-[11.5px] leading-[1.5] text-[var(--warn-text)] mt-[4px] opacity-90">Complete or leave a league to free one. Finished leagues do not count — only the twenty still running.</div>
                </div>
              )}

              {sections.map(section => <Section key={section.key} section={section} actionableDays={actionableDays} />)}

              <div className="p-[18px_var(--gutter)_26px] md:p-0 md:mt-[20px] text-[11px] leading-[1.55] text-[var(--text-muted)]">
                Completed and cancelled leagues stay readable forever and never count towards the twenty. Only leagues still running use a place.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Shared bar — derives its own active tab, and hides itself above md. */}
      <MobileNav />
    </div>
  );
}
