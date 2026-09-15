'use client';

import Link from 'next/link';
import { Breadcrumb } from '../Breadcrumb';

/**
 * Join a league by code — one screen at every width.
 *
 * This was the last surviving mobile/desktop twin, and the two halves had
 * drifted into saying different things: the wide one advertised a "Standard
 * Rule Engine", a "Rulebook" that was not a link, and a lock rule that is not
 * the product's ("at whistle" — it is the league's standard lock). One screen
 * cannot disagree with itself.
 *
 * Ten boxes because the API issues and validates exactly ten characters, from
 * an alphabet with no I, L, O, U, 0 or 1 in it.
 */

export const JOIN_CODE_LENGTH = 10;

export interface JoinOutcome {
  tone: string;
  icon: string;
  title: string;
  body: string;
  primary?: string;
  secondary?: string;
  secondaryOff?: boolean;
  list?: boolean;
}

export function JoinLeagueScreen({
  outcome, detail, inviteCode, setInviteCode, pending,
  onJoinCode, onPrimary, onSecondary, onLeaveLeague, myLeagues,
}: {
  outcome: string | null;
  detail: JoinOutcome | null;
  inviteCode: string;
  setInviteCode: (code: string) => void;
  pending: boolean;
  onJoinCode: () => void;
  onPrimary: () => void;
  onSecondary?: () => void;
  onLeaveLeague: (leagueId: string) => void;
  myLeagues: Array<{ id: string; name: string; competition: string }>;
}) {
  const boxes = Array.from({ length: JOIN_CODE_LENGTH }, (_, i) => inviteCode[i] ?? '');

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      <Breadcrumb trail={[{ label: 'Leagues', href: '/leagues' }, { label: 'Join a league' }]} />

      {/* The way back on a phone. Without it this screen had no exit at all —
          not a chevron, not a tab bar, not a link. */}
      <header className="flex-none md:hidden bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px]">
        <div className="flex items-center gap-[11px]">
          <Link
            href="/leagues"
            aria-label="Back to my leagues"
            className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]"
          >‹</Link>
          <div className="font-heading font-[650] text-[17px] leading-[1.1] tracking-[-0.3px]">Join a league</div>
        </div>
      </header>

      <main className="tf-scroll flex-1 min-h-0 overflow-auto">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:pt-[28px]">
          {outcome === null ? (
            <section className="p-[24px_var(--gutter)] md:px-0 md:max-w-[560px]">
              <h1 className="font-heading font-bold text-[26px] md:text-[30px] leading-[1.15] tracking-[-1px]">
                Enter the code you were given
              </h1>
              <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">
                Ten characters, not case sensitive. A code names one league and behaves exactly like
                a link to it.
              </p>

              {/* The real field only ever got focus once, from `autoFocus` on
                  mount -- mobile browsers routinely ignore that outright, and
                  even where they honour it, tapping anywhere else (including
                  the boxes right here, which is exactly where a person tries
                  to interact with a code) blurs it with nothing on screen to
                  bring it back. There was then no way left to focus a field
                  that was never visible in the first place, so paste (and
                  typing) simply stopped working after the first tap.
                  A <label> wrapping the boxes fixes it without any JS: a
                  click anywhere inside natively focuses its associated
                  input, the same as clicking a checkbox's text does. */}
              <label
                htmlFor="join-code"
                className="flex gap-[5px] md:gap-[7px] mt-[22px] cursor-text"
              >
                <span className="sr-only">Invitation code</span>
                {boxes.map((char, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={`flex-1 h-[46px] rounded-[9px] grid place-items-center font-heading font-bold text-[16px] uppercase ${
                      char
                        ? 'bg-[var(--surface-card)] border border-[var(--surface-border-strong)]'
                        : i === inviteCode.length
                          ? 'border-2 border-[var(--color-brand)]'
                          : 'border border-[var(--surface-border)]'
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </label>

              <input
                id="join-code"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.replace(/[^a-z0-9]/gi, '').slice(0, JOIN_CODE_LENGTH).toUpperCase())}
                autoComplete="one-time-code"
                inputMode="text"
                className="sr-only"
                autoFocus
              />

              <button
                type="button"
                onClick={onJoinCode}
                disabled={inviteCode.length !== JOIN_CODE_LENGTH || pending}
                className="w-full md:w-auto md:px-[28px] h-[46px] mt-[18px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[13px] disabled:opacity-40"
              >
                {pending ? 'Checking…' : 'Join this league'}
              </button>
            </section>
          ) : detail && (
            <section className="p-[24px_var(--gutter)] md:px-0 md:max-w-[560px]">
              <span
                className="w-[44px] h-[44px] rounded-full grid place-items-center text-[20px]"
                style={{ background: 'var(--surface-subtle)', color: detail.tone }}
              >
                {detail.icon}
              </span>
              <h1 className="font-heading font-bold text-[22px] md:text-[26px] leading-[1.2] tracking-[-0.6px] mt-[16px]">
                {detail.title}
              </h1>
              <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">{detail.body}</p>

              {detail.list && myLeagues.length > 0 && (
                <div className="mt-[18px]">
                  {myLeagues.map(league => (
                    <div key={league.id} className="flex items-center gap-[12px] py-[12px] border-t border-[var(--surface-border)] last:border-b">
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13.5px] truncate">{league.name}</div>
                        <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px] truncate">{league.competition}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onLeaveLeague(league.id)}
                        className="h-[34px] px-[14px] rounded-[9px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[11.5px] flex-none"
                      >
                        Leave
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-[9px] mt-[20px]">
                {detail.primary && (
                  <button
                    type="button"
                    onClick={onPrimary}
                    className="h-[46px] px-[20px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[13px]"
                  >
                    {detail.primary}
                  </button>
                )}
                {detail.secondary && !detail.secondaryOff && (
                  <button
                    type="button"
                    onClick={onSecondary}
                    className="h-[46px] px-[20px] rounded-[12px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px]"
                  >
                    {detail.secondary}
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
