'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { timeUntilLabel, personInitials } from '@/lib/format';
import Link from 'next/link';
import Image from 'next/image';
import { MobileNav } from '../MobileNav';
import { TeamCrest } from '../TeamCrest';
import { tintFor } from '@/lib/crest';
import { heroGradient } from '@/lib/crest-colour';
import { useTeamPalettes } from '@/hooks/useTeamPalettes';
import { ThemeMenu } from '../ThemeMenu';
import type { HomeLeagueEntry, HomeQueueEntry, TeamIdentity } from '@/lib/home/home-data';

/**
 * The home screen — one component for both platforms.
 *
 * Everything it draws arrives already fetched and shaped from the server page
 * above it. It is a Client Component for one reason: the hero carries a live
 * countdown, which has to tick.
 *
 * The two twins it replaces both read a `rowStyle` prop on the queue and league
 * rows that the page never provided, so those rows rendered with no layout at
 * all. They are styled with classes here.
 */

/** Below this the hero turns red — the deadline is close enough to lose points to. */
const URGENT_WITHIN_SECONDS = 15 * 60;

/** Crest tints for teams the catalogue did not resolve a logo for. */


function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Counts down against the server's clock, not the browser's. The offset is
 * measured once from the `serverTime` that came with the data, so a device with
 * a wrong clock still sees the deadline the server will actually enforce.
 */
/** Now, as the server counts it — the clock every deadline here is measured against. */
function useServerNow(serverTime: string) {
  const [offsetMs] = useState(() => Date.parse(serverTime) - Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now + offsetMs;
}

function secondsUntil(deadlineAt: string | null, nowMs: number) {
  if (!deadlineAt) return null;
  return Math.max(0, Math.round((Date.parse(deadlineAt) - nowMs) / 1000));
}

/**
 * The queue, as a table at width.
 *
 * The phone folds the league, what is still open and when it locks into one
 * stacked line because it has nowhere else to put them. Given the width the
 * design gives each its own column, so a round can be scanned for what is owed
 * rather than read row by row.
 */
/* Written out in full at each site rather than composed: Tailwind generates
   classes by scanning source text, so a `md:` variant assembled at runtime is a
   class that never exists. This is finding 04's failure mode. */
const QUEUE_GRID = 'md:grid md:grid-cols-[44px_minmax(0,1fr)_150px_96px_92px] md:gap-[14px] md:items-center';

function QueueHead() {
  return (
    <div className={`hidden ${QUEUE_GRID} px-[4px] py-[10px] border-b border-[var(--surface-border-strong)]`}>
      <span />
      <span className="tf-kicker">Match</span>
      <span className="tf-kicker">League</span>
      <span className="tf-kicker text-right">Still open</span>
      <span className="tf-kicker text-right">Locks</span>
    </div>
  );
}

function QueueMark({ entry }: { entry: HomeQueueEntry }) {
  if (entry.home && entry.away) {
    return (
      <div className="flex flex-col gap-[2px] flex-none">
        <TeamCrest code={entry.home.code} logoUrl={entry.home.logoUrl} size={22} />
        <TeamCrest code={entry.away.code} logoUrl={entry.away.logoUrl} size={22} />
      </div>
    );
  }
  return <span className="tf-crest flex-none w-[22px] h-[24px] text-[8px]" style={{ background: 'var(--surface-border-strong)' }}>Q</span>;
}

function QueueRow({ entry, nowMs }: { entry: HomeQueueEntry; nowMs: number }) {
  /* One row. The phone's stacked line and the wide table's columns are the same
     element with `md:` on it — rendering both and hiding one put 40KB of this
     screen into the document for a width nobody was looking at. */
  return (
    <Link
      href={entry.href}
      className={`flex items-center gap-[11px] py-[11px] border-b border-[var(--surface-border)] last:border-b-0 ${QUEUE_GRID} md:gap-[14px] md:border-b-0 md:px-[10px] md:-mx-[10px] md:py-[13px] md:rounded-[10px] md:hover:bg-[var(--surface-subtle)] md:transition-colors`}
    >
      <QueueMark entry={entry} />

      <div className="flex-1 md:flex-none min-w-0">
        <div className="font-heading font-semibold text-[12.5px] md:text-[13.5px] md:tracking-[-0.2px] truncate">{entry.title}</div>
        <div className="text-[9.5px] md:text-[10.5px] text-[var(--text-muted)] mt-[3px] truncate">
          <span className="md:hidden">{entry.competition} · {entry.league}</span>
          <span className="hidden md:inline">{entry.competition}</span>
        </div>
      </div>

      <div className="hidden md:block text-[11.5px] text-[var(--text-secondary)] truncate">{entry.league}</div>

      <div className="text-right flex-none md:flex-auto">
        <div className="md:hidden tf-num font-heading font-bold text-[12px]">{timeUntilLabel(entry.deadlineAt, nowMs)}</div>
        <div className="md:hidden tf-num text-[10px] text-[var(--text-link)] mt-[3px] font-bold">{entry.openLabel}</div>
        <div className="hidden md:block tf-num font-heading font-bold text-[12px] text-[var(--text-link)]">{entry.openLabel}</div>
      </div>

      <div className="hidden md:block tf-num text-right font-heading font-bold text-[12px]">
        {timeUntilLabel(entry.deadlineAt, nowMs)}
      </div>
    </Link>
  );
}

function LeagueRow({ entry }: { entry: HomeLeagueEntry }) {
  return (
    <Link
      href={`/leagues/${entry.id}`}
      className="flex items-center gap-[11px] px-[var(--gutter)] py-[11px] border-b border-[var(--surface-border)] last:border-b-0 md:px-[10px] md:-mx-[10px] md:rounded-[10px] md:hover:bg-[var(--surface-subtle)] md:transition-colors"
    >
      <span className="tf-crest w-[22px] h-[24px] text-[7.5px] flex-none" style={{ background: tintFor(entry.crest) }}>{entry.crest}</span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-[11.5px] md:text-[13px] truncate">{entry.name}</div>
        <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px] truncate">{entry.competition}</div>
      </div>
      <div className="text-right flex-none">
        {entry.standing ? (
          <>
            <div className="font-heading font-bold text-[15px] tf-num">{entry.standing}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-[3px] tf-num">{entry.points}</div>
          </>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)]">No standing yet</span>
        )}
      </div>
    </Link>
  );
}

export function HomeScreen({
  displayName, unreadCount, todayLabel, queue, queueCount, leagues, next, serverTime, payoff,
}: {
  displayName: string;
  unreadCount: number;
  todayLabel: string;
  /** Only the rows this screen shows — the rest of the queue lives on Predict. */
  queue: HomeQueueEntry[];
  /** Everything owed across every league, which is what the counts say. */
  queueCount: number;
  /** The payoff block, streamed in by the server so its reads stay off the
   *  critical path. Null once nothing has settled in the window. */
  payoff?: ReactNode;
  leagues: HomeLeagueEntry[];
  /** The soonest task, which the hero is about. Null when nothing is open. */
  next: HomeQueueEntry | null;
  serverTime: string;
}) {
  const nowMs = useServerNow(serverTime);
  const remaining = secondsUntil(next?.deadlineAt ?? null, nowMs);
  const caught = queueCount === 0;
  const urgent = remaining !== null && remaining > 0 && remaining <= URGENT_WITHIN_SECONDS;
  const isNewUser = leagues.length === 0;

  const tone = urgent ? 'var(--color-danger)' : caught ? 'var(--nav-positive)' : 'var(--nav-accent)';
  const [homePalette, awayPalette] = useTeamPalettes(
    { code: next?.home?.code ?? '', logoUrl: next?.home?.logoUrl ?? null },
    { code: next?.away?.code ?? '', logoUrl: next?.away?.logoUrl ?? null },
  );
  const heroBg = next?.home && next?.away
    ? heroGradient(homePalette, awayPalette)
    : 'var(--nav-surface)';

  if (isNewUser) {
    return (
      <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
        <div className="flex-1 grid place-items-center p-[var(--gutter)]">
          <div className="flex flex-col items-center text-center max-w-[440px]">
            <div className="w-[54px] h-[54px] rounded-[15px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[18px]">T/</div>
            <h1 className="font-heading font-bold text-[24px] md:text-[30px] leading-[1.12] tracking-[-0.7px] mt-[20px]">Join or create a league to begin</h1>
            <p className="text-[13.5px] md:text-[14px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">
              You need to join or create a league to start predicting. You can be in up to twenty at once — finished leagues give their place back.
            </p>
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-[10px] mt-[24px]">
              <Link href="/leagues/setup" className="h-[48px] md:px-[26px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px]">Create a league</Link>
              <Link href="/leagues/join" className="h-[48px] md:px-[26px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[13.5px]">Join with a code</Link>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      {/* Phone header. The wide layout gets its chrome from DesktopLevelOne. */}
      <header className="md:hidden bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(14px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[16px] flex-none flex items-center justify-between">
        <div className="font-heading font-bold text-[19px] leading-[1] tracking-[-0.7px]">TOPFOUR<span className="text-[var(--nav-accent)]">/</span></div>
        <div className="flex items-center gap-[9px]">
          {/* Beside the bell here too: the phone has no level-one bar, and
              burying appearance in Me is the thing this was meant to fix. */}
          <ThemeMenu />
          <Link href="/alerts" className="relative w-[36px] h-[36px] rounded-full grid place-items-center" aria-label={unreadCount > 0 ? `Alerts, ${unreadCount} unread` : 'Alerts'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-[2px] right-[2px] min-w-[14px] h-[14px] px-[3px] rounded-full bg-[var(--color-danger)] text-[var(--tf-white)] grid place-items-center font-heading font-bold text-[8px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/me" className="w-[36px] h-[36px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[11.5px]">
            {personInitials(displayName)}
          </Link>
        </div>
      </header>

      {/* Wide-screen context bar. */}
      <div className="hidden md:flex flex-none bg-[var(--surface-card)] border-b border-[var(--surface-border)] items-end gap-[20px] px-[24px] h-[54px]">
        <div className="flex items-baseline gap-[10px] pb-[13px] max-w-[1080px] mx-auto w-full">
          <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px]">Today</span>
          <span className="text-[11px] text-[var(--text-muted)]">{todayLabel}</span>
          <span className="ml-auto tf-num text-[11px] text-[var(--text-muted)]">
            {caught ? 'Everything answered' : `${queueCount} waiting on you`}
          </span>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto tf-scroll">
        <section style={{ background: heroBg, transition: 'background 240ms ease' }} className="px-[var(--gutter)] py-[22px] md:py-[30px] text-[var(--nav-text)] border-b border-[rgba(255,255,255,0.1)]">
          <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:flex md:items-center md:gap-[44px]">

            <div className="md:flex-none">
              <div className="flex items-center gap-[8px]">
                <span
                  className={`w-[7px] h-[7px] rounded-full flex-none ${urgent ? 'animate-[tfpulse_1.4s_ease-in-out_infinite]' : ''}`}
                  style={{ background: tone }}
                />
                <span className="tf-kicker" style={{ color: tone }}>{caught ? 'NEXT KICK-OFF' : 'NEXT LOCK'}</span>
              </div>
              <div
                className="tf-num font-heading font-bold text-[64px] md:text-[76px] leading-[0.84] tracking-[-2.8px] md:tracking-[-3.4px] mt-[10px] md:mt-[12px]"
                style={{ color: urgent ? 'var(--color-danger)' : 'var(--nav-text)' }}
              >
                {remaining === null ? 'TBD' : formatRemaining(remaining)}
              </div>
              <div className="text-[12px] md:text-[13px] text-[var(--nav-text-faint)] mt-[9px] md:mt-[11px] leading-[1.45]">
                {caught ? 'and you are ready for it' : 'until this one closes'}
              </div>
            </div>

            {next && (
              <div className="mt-[20px] md:mt-0 md:flex-1 md:min-w-0 rounded-[14px] bg-[rgba(255,255,255,0.06)] md:bg-transparent p-[14px_16px] md:p-0">
                <div className="flex items-center gap-[12px]">
                  <span className="font-heading font-bold text-[8.5px] md:text-[9.5px] tracking-[0.11em] px-[8px] py-[3px] md:py-[4px] rounded-[5px] md:rounded-[6px] bg-[var(--nav-fill)] text-[var(--nav-text)]">
                    {next.league.toUpperCase()}
                  </span>
                  <span className="font-heading font-semibold text-[9.5px] md:text-[10px] text-[var(--nav-text-faint)]">{next.competition}</span>
                </div>

                {next.home && next.away ? (
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-[16px] md:gap-[22px] items-center mt-[14px] md:mt-[16px]">
                    <div className="flex items-center gap-[9px] md:gap-[11px] justify-end min-w-0">
                      <TeamCrest code={next.home.code} logoUrl={next.home.logoUrl} size={28} />
                      <span className="font-heading font-[650] text-[18px] md:text-[21px] leading-[1.15] tracking-[-0.4px] truncate">{next.home.name}</span>
                    </div>
                    <span className="font-heading font-semibold text-[10px] md:text-[11px] text-[var(--nav-text-faint)]">v</span>
                    <div className="flex items-center gap-[9px] md:gap-[11px] min-w-0">
                      <span className="font-heading font-[650] text-[18px] md:text-[21px] leading-[1.15] tracking-[-0.4px] truncate text-right">{next.away.name}</span>
                      <TeamCrest code={next.away.code} logoUrl={next.away.logoUrl} size={28} />
                    </div>
                  </div>
                ) : (
                  <div className="font-heading font-[650] text-[16px] md:text-[19px] leading-[1.3] mt-[14px]">{next.title}</div>
                )}

                <Link
                  href={next.href}
                  className="mt-[16px] md:mt-[20px] h-[48px] md:w-[188px] rounded-[12px] grid place-items-center font-heading font-bold text-[14px] bg-[var(--nav-accent)] text-[var(--nav-on-accent)]"
                >
                  {caught ? 'Review your answers' : 'Predict now'}
                </Link>
              </div>
            )}
          </div>
        </section>

        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:grid md:grid-cols-[minmax(0,1fr)_330px] md:gap-[26px] md:pt-[26px] md:pb-[30px]">

          <section className="p-[24px_var(--gutter)] md:p-0">
            <div className="flex items-baseline justify-between mb-[12px]">
              <span className="tf-kicker">{caught ? 'Nothing else owed' : 'Also waiting on you'}</span>
              {queueCount > queue.length && (
                <Link href="/predict" className="font-heading font-bold text-[9px] tracking-[0.06em] text-[var(--text-link)]">SEE ALL {queueCount} →</Link>
              )}
            </div>

            {caught ? (
              <p className="text-[12px] leading-[1.6] text-[var(--text-secondary)]">
                Nothing else is waiting on you. Every other market in every league is answered.
              </p>
            ) : (
              <div className="flex flex-col md:block">
                <QueueHead />
                {queue.map(entry => <QueueRow key={`${entry.kind}-${entry.id}`} entry={entry} nowMs={nowMs} />)}
              </div>
            )}
          </section>

          {/* One grid child, two blocks: the payoff sits above the league strip
              in the rail at width, and between the queue and the strip on a
              phone. As separate children the grid would wrap the second one
              back under the queue. */}
          <div>
            {payoff}

            <section className="pt-[24px] md:pt-0 border-t-[6px] md:border-t-0 border-[var(--surface-subtle)]">
              <div className="flex items-baseline justify-between px-[var(--gutter)] md:px-0 mb-[10px]">
                <span className="tf-kicker">Where you stand</span>
                <Link href="/leagues" className="font-heading font-bold text-[9px] tracking-[0.06em] text-[var(--text-link)]">SEE ALL {leagues.length} →</Link>
              </div>
              <div className="md:px-0">
                {leagues.map(entry => <LeagueRow key={entry.id} entry={entry} />)}
              </div>
            </section>
          </div>
        </div>

        <div className="h-[26px]" />
      </main>

      <MobileNav />
    </div>
  );
}
