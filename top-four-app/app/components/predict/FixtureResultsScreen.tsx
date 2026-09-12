'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LeagueContextBar } from '../leagues/LeagueContextBar';
import { Breadcrumb } from '../Breadcrumb';
import { TeamCrest } from '../TeamCrest';
import { toMemberAnswers, type ResultMarket, type RivalMember } from '@/lib/predict/fixture-results';

/**
 * A settled fixture, read by the league.
 *
 * The predict screen answers "what did I say". This one answers "what did
 * everyone say, and what landed" — the only place a league reads each other,
 * and the social half of a social prediction product.
 */

export type ResultsPhase = 'sealed' | 'provisional' | 'final';

const STATUS: Record<ResultsPhase, { label: string; colour: string }> = {
  sealed: { label: 'Not yet disclosed', colour: 'var(--nav-text-faint)' },
  provisional: { label: 'Provisional', colour: 'var(--state-provisional)' },
  final: { label: 'Full time · settled', colour: 'var(--nav-positive)' },
};

export function FixtureResultsScreen({
  leagueId, leagueName, competition, backHref,
  homeName, awayName, homeCode, awayCode, homeLogo, awayLogo,
  score, phase, markets, members, totalMembers, pointsEarned, pointsAtStake, facts,
}: {
  leagueId: string;
  leagueName: string;
  competition: string;
  backHref: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  homeLogo: string | null;
  awayLogo: string | null;
  score: [number, number] | null;
  phase: ResultsPhase;
  markets: ResultMarket[];
  /** Empty while sealed — the API refuses the read rather than redacting it. */
  members: RivalMember[];
  totalMembers: number;
  pointsEarned: number;
  pointsAtStake: number;
  homeNameForAnswers?: string;
  facts: Array<{ label: string; value: string }>;
}) {
  const [marketKey, setMarketKey] = useState<string>(markets[0]?.key ?? '');
  const market = markets.find(m => m.key === marketKey) ?? markets[0] ?? null;

  const playerNames = new Map<string, string>();
  const rows = market
    ? toMemberAnswers(members, market, { homeName, awayName, playerNames, totalGoalsLine: 2.5 })
    : [];

  const status = STATUS[phase];

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      <Breadcrumb trail={[
        { label: 'Leagues', href: '/leagues' },
        { label: leagueName, href: `/leagues/${leagueId}/fixtures` },
        { label: `${homeName} v ${awayName}` },
      ]} />

      <LeagueContextBar leagueId={leagueId} leagueName={leagueName} meta={competition} linkName />

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:hidden">
        <Link href={backHref} aria-label="Back to the fixture" className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center text-[var(--nav-text-quiet)] text-[15px]">‹</Link>
      </header>

      <main className="tf-scroll flex-1 min-h-0 overflow-auto pb-[26px]">
        <section className="bg-[var(--nav-surface)] text-[var(--nav-text)] py-[22px] md:py-[26px] border-b border-[rgba(255,255,255,0.1)]">
          <div className="md:max-w-[1080px] md:mx-auto px-[var(--gutter)] md:px-[24px]">
            <span className="tf-kicker" style={{ color: status.colour }}>{status.label}</span>

            <div className="flex items-center gap-[14px] mt-[16px] md:max-w-[780px] md:mx-auto">
              <div className="flex-1 flex items-center gap-[9px] min-w-0">
                <TeamCrest code={homeCode} logoUrl={homeLogo} size={40} />
                <span className="font-heading font-[650] text-[15px] md:text-[17px] truncate">{homeName}</span>
              </div>
              <span className="tf-num font-heading font-bold text-[22px] md:text-[28px] tracking-[-0.8px] flex-none">
                {score ? `${score[0]} — ${score[1]}` : '—'}
              </span>
              <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                <span className="font-heading font-[650] text-[15px] md:text-[17px] truncate text-right">{awayName}</span>
                <TeamCrest code={awayCode} logoUrl={awayLogo} size={40} />
              </div>
            </div>

            <div className="flex items-end gap-[10px] mt-[18px] md:max-w-[780px] md:mx-auto">
              <span className="tf-num font-heading font-bold text-[34px] leading-[0.9] tracking-[-1.4px]">
                {pointsEarned > 0 ? `+${pointsEarned}` : '0'}
              </span>
              <span className="text-[11px] text-[var(--nav-text-faint)] pb-[5px]">
                of {pointsAtStake} · {competition}
              </span>
            </div>
          </div>
        </section>

        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px]">
          {phase === 'sealed' ? (
            <div className="p-[64px_30px] text-center">
              <h2 className="font-heading font-bold text-[19px] tracking-[-0.3px]">Everyone&apos;s answers stay sealed</h2>
              <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[420px] mx-auto">
                Nothing is shown until every market on this fixture has closed — and that applies to
                owners and admins too. There is nothing behind a lock here; the screen simply has
                nothing to say yet.
              </p>
            </div>
          ) : (
            <>
              {markets.length > 1 && (
                <div className="tf-scroll flex gap-[7px] p-[16px_var(--gutter)_0] md:px-0 overflow-x-auto">
                  {markets.map(m => {
                    const on = m.key === market?.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setMarketKey(m.key)}
                        className="h-[32px] px-[12px] rounded-full grid place-items-center whitespace-nowrap flex-none font-heading font-bold text-[10.5px]"
                        style={on
                          ? { background: 'var(--text-primary)', color: 'var(--surface-canvas)' }
                          : { border: '1px solid var(--surface-border-strong)', color: 'var(--text-secondary)' }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {market && (
                <p className="p-[14px_var(--gutter)_10px] md:px-0 text-[11.5px] text-[var(--text-muted)]">
                  {market.landedLabel
                    ? <>What landed: <strong className="text-[var(--text-primary)]">{market.landedLabel}</strong></>
                    : market.landedPlayerIds.length > 0
                      ? `${market.landedPlayerIds.length} player${market.landedPlayerIds.length === 1 ? '' : 's'} landed this market`
                      : 'Waiting on the outcome'}
                </p>
              )}

              {rows.map((row, i) => (
                <div
                  key={row.membershipId}
                  className={`flex items-center gap-[11px] p-[11px_var(--gutter)] md:px-0 border-t border-[var(--surface-border)] ${i === rows.length - 1 ? 'border-b' : ''} ${row.isViewer ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}
                >
                  <span className={`w-[22px] flex-none font-heading font-bold text-[11.5px] tf-num ${row.isViewer ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-muted)]'}`}>
                    {row.position}
                  </span>
                  <span
                    className="w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]"
                    style={{ background: row.isViewer ? 'var(--color-brand)' : `var(--ident-${row.position % 8})` }}
                  >
                    {row.initials}
                  </span>
                  <span className={`flex-1 min-w-0 truncate font-heading text-[13.5px] ${row.isViewer ? 'font-bold text-[var(--accent-text-strong)]' : 'font-semibold'}`}>
                    {row.name}
                  </span>
                  {/* Colour marks the answer that landed, never the person. */}
                  <span
                    className="flex-none px-[10px] py-[6px] rounded-[8px] font-heading font-bold text-[11.5px] whitespace-nowrap"
                    style={row.answer === null
                      ? { border: '1px dashed var(--surface-border-strong)', color: 'var(--text-muted)' }
                      : row.landed
                        ? { background: 'var(--color-success)', color: 'var(--tf-white)' }
                        : { background: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {row.answer ?? 'no answer'}
                  </span>
                </div>
              ))}

              {rows.length < totalMembers && (
                <p className="p-[12px_var(--gutter)] md:px-0 text-[11px] text-[var(--text-muted)]">
                  Showing {rows.length} of {totalMembers} members.
                </p>
              )}

              {facts.length > 0 && (
                <section className="mt-[24px]">
                  <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_8px] md:px-0">The match facts this settled on</div>
                  {facts.map((fact, i) => (
                    <div key={fact.label} className={`flex items-baseline gap-[14px] p-[12px_var(--gutter)] md:px-0 border-t border-[var(--surface-border)] ${i === facts.length - 1 ? 'border-b' : ''}`}>
                      <span className="text-[11.5px] text-[var(--text-muted)] w-[110px] flex-none">{fact.label}</span>
                      <span className="text-[12.5px]">{fact.value}</span>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
