'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toBreakdown, type TablePage, type TableRow } from '@/lib/leagues/league-table';

/**
 * The league table — one component for both platforms.
 *
 * Pagination is in the URL rather than in state, so a page is linkable and the
 * back button works. The only thing held locally is which row is expanded.
 */

function Breakdown({ row, competitionNames, accent }: {
  row: TableRow;
  competitionNames: Map<string, string>;
  accent: boolean;
}) {
  const lines = toBreakdown(row, competitionNames);
  return (
    <div className="pb-[12px] px-[var(--gutter)] md:px-[8px]">
      {lines.map(line => (
        <div
          key={line.label}
          className={`flex items-baseline justify-between gap-[10px] py-[5px] ${line.isTotal ? 'mt-[4px] pt-[8px] border-t' : ''}`}
          style={line.isTotal ? { borderTopColor: accent ? 'rgba(255,255,255,0.18)' : 'var(--surface-border)' } : undefined}
        >
          <span
            className={`text-[11.5px] ${line.isTotal ? 'font-heading font-bold' : ''}`}
            style={{ color: line.isTotal
              ? (accent ? 'var(--tf-white)' : 'var(--text-primary)')
              : (accent ? 'rgba(255,255,255,.72)' : 'var(--text-secondary)') }}
          >
            {line.label}
          </span>
          <span
            className={`font-heading ${line.isTotal ? 'font-bold' : 'font-semibold'} text-[11.5px] tf-num`}
            style={{ color: line.isTotal
              ? (accent ? 'var(--tf-white)' : 'var(--text-primary)')
              : (accent ? 'rgba(255,255,255,.72)' : 'var(--text-secondary)') }}
          >
            {line.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LeagueTableScreen({
  leagueId, leagueName, table, competitionNames, ownPosition, ownCaption, ownPoints, tiebreakers, isFinal,
}: {
  leagueId: string;
  leagueName: string;
  table: TablePage;
  /** Competition id → display name, for the per-member breakdown. */
  competitionNames: Map<string, string>;
  ownPosition: string;
  ownCaption: string;
  ownPoints: string;
  tiebreakers: string[];
  isFinal: boolean;
}) {
  const [openRow, setOpenRow] = useState<string | null>(null);

  const pageHref = (page: number) =>
    page <= 1 ? `/leagues/${leagueId}/table` : `/leagues/${leagueId}/table?page=${page}`;

  return (
    <>
      {/* The member's own standing. It used to live in this screen's header,
          which made the league chrome a different height on this tab than on
          every other; as content it says the same thing without moving the
          page around. */}
      <section className="flex items-end gap-[12px] p-[16px_var(--gutter)] md:px-0 md:pt-[4px] md:pb-[18px]">
        <span className="tf-num font-heading font-bold text-[40px] md:text-[46px] leading-[0.88] tracking-[-1.8px]">
          {ownPosition}
        </span>
        <div className="pb-[5px]">
          <div className="font-heading font-semibold text-[12.5px]">{ownPoints}</div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">
            {ownCaption} · {isFinal ? 'final' : 'updated live'}
          </div>
        </div>
      </section>

          {/* Column headings, wide screens only — and only over actual rows;
              a heading strip above an empty table reads as a failed load. */}
          <div className={`${table.rows.length === 0 ? 'hidden' : 'hidden md:grid'} grid-cols-[46px_minmax(0,1fr)_110px_24px] gap-[14px] items-center p-[10px_8px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]`}>
            <span className="tf-kicker">Pos</span>
            <span className="tf-kicker">Member</span>
            <span className="tf-kicker text-right">Points</span>
            <span />
          </div>

          {table.rows.length === 0 ? (
            <p className="p-[50px_30px] text-center text-[12.5px] text-[var(--text-secondary)]">
              Nobody has scored in this league yet. The table fills in once the first fixture settles.
            </p>
          ) : table.rows.map(row => {
            const open = openRow === row.membershipId;
            return (
              <div
                key={row.membershipId}
                className={`border-b border-[var(--surface-border)] ${row.isYou ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : open ? 'bg-[var(--surface-subtle)]' : ''}`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenRow(open ? null : row.membershipId)}
                  className="w-full text-left grid grid-cols-[34px_minmax(0,1fr)_auto_20px] md:grid-cols-[46px_minmax(0,1fr)_110px_24px] gap-[10px] md:gap-[14px] items-center p-[12px_var(--gutter)] md:p-[13px_8px]"
                >
                  <span className="font-heading font-bold text-[13px] tf-num text-[var(--text-primary)]">
                    {row.position}
                    {row.isTied && <span className="ml-[3px] text-[10px] font-medium text-[var(--text-muted)]">=</span>}
                  </span>

                  <span className="flex items-center gap-[10px] min-w-0">
                    <span
                      className={`w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] ${row.isYou ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]' : 'text-[var(--text-primary)]'}`}
                      style={row.isYou ? undefined : { background: `var(--ident-${row.tint})` }}
                    >
                      {row.initials}
                    </span>
                    <span className={`truncate font-heading text-[13.5px] ${row.isYou ? 'font-bold text-[var(--accent-text-strong)]' : 'font-semibold'}`}>{row.name}</span>
                  </span>

                  <span className={`tf-num font-heading font-bold text-[14px] text-right ${row.isYou ? 'text-[var(--accent-text-strong)]' : ''}`}>{row.pointsLabel}</span>

                  <span className={`text-[12px] text-[var(--text-muted)] text-center transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
                </button>

                {open && <Breakdown row={row} competitionNames={competitionNames} accent={false} />}
              </div>
            );
          })}

          {table.pageCount > 1 && (
            <nav className="flex items-center justify-between gap-[10px] p-[16px_var(--gutter)] md:px-[8px]" aria-label="Table pages">
              <Link
                href={pageHref(table.page - 1)}
                aria-disabled={table.page <= 1}
                className={`h-[38px] px-[16px] rounded-[10px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-semibold text-[12px] ${table.page <= 1 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                ‹ Previous
              </Link>
              <span className="tf-num text-[11.5px] text-[var(--text-muted)]">{table.from}–{table.to} of {table.totalMembers}</span>
              <Link
                href={pageHref(table.page + 1)}
                aria-disabled={table.page >= table.pageCount}
                className={`h-[38px] px-[16px] rounded-[10px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-semibold text-[12px] ${table.page >= table.pageCount ? 'opacity-40 pointer-events-none' : ''}`}
              >
                Next ›
              </Link>
            </nav>
          )}

          {tiebreakers.length > 0 && (
            <section className="p-[20px_var(--gutter)_26px] md:px-[8px]">
              <div className="tf-kicker text-[var(--text-muted)]">How ties are broken</div>
              <ol className="mt-[10px] flex flex-col gap-[6px]">
                {tiebreakers.map((label, i) => (
                  <li key={label} className="flex gap-[10px] text-[11.5px] text-[var(--text-secondary)]">
                    <span className="tf-num font-heading font-bold text-[var(--text-muted)] flex-none">{i + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>
            </section>
          )}
    </>
  );
}
