'use client';

import { useState } from 'react';
import { personInitials } from '@/lib/format';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MobileNav } from '../MobileNav';
import { ThemeToggle } from '../ThemeToggle';
import { useUpdateNotificationPreferences } from '@/hooks/api/useNotifications';
import { useAuth } from '@/context/auth-context';
import type { FormBar, MeLeagueRow } from '@/lib/me/me-data';

/**
 * The account screen — one component for both platforms.
 *
 * A Client Component because two things here write: the email toggles, and
 * signing out. Everything read arrives from the server page above.
 *
 * The two toggles are restored here. The design has three email rows — the
 * weekly reminder, the custom-question chaser, and a locked account-security
 * one — but only the locked row had been built, so the preference API was being
 * fetched and could never be changed.
 */

const CREST_TINTS: Record<string, string> = {
  PP: '#0879bf', OL: '#7f56d9', AL: '#0e7a5f', SS: '#1746a2',
  FC: '#b7152b', UN: '#0e7a5f', NB: '#7f56d9', WW: '#c8182f',
};
const tintFor = (crest: string) => CREST_TINTS[crest] || '#0879bf';

interface Preferences {
  roundReminder: boolean;
  customQuestionAdmin: boolean;
}

function Switch({ on, locked, onToggle, label }: {
  on: boolean; locked?: boolean; onToggle?: () => void; label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      onClick={onToggle}
      className={`w-[44px] h-[26px] rounded-full flex-none relative transition-colors ${locked ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'}`}
      style={{ background: on ? 'var(--color-brand)' : 'var(--surface-border-strong)' }}
    >
      <span
        className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] transition-[left]"
        style={{ left: on ? '21px' : '3px' }}
      />
    </button>
  );
}

function Row({ title, note, badge, href, onClick, children }: {
  title: string; note: string; badge?: string; href?: string;
  onClick?: () => void; children?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px]">
          <span className="font-heading font-semibold text-[13.5px]">{title}</span>
          {badge && (
            <span className="font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_7px] rounded-[4px] bg-[var(--warn-surface)] text-[var(--warn-text)] flex-none">{badge}</span>
          )}
        </div>
        <div className="text-[10.5px] md:text-[11.5px] text-[var(--text-muted)] mt-[3px]">{note}</div>
      </div>
      {children ?? (href && <span className="text-[16px] text-[var(--text-muted)] flex-none">›</span>)}
    </>
  );

  const shared = 'flex items-center gap-[13px] p-[14px_var(--gutter)] md:px-[4px] border-b border-[var(--surface-border)] w-full text-left';
  if (href) return <Link href={href} className={`${shared} cursor-pointer`}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={`${shared} cursor-pointer`}>{body}</button>;
  return <div className={shared}>{body}</div>;
}

export function MeScreen({
  displayName, email, emailVerified, hasGoogle, leagues, totalPoints, form, formLeagueName, preferences,
}: {
  displayName: string;
  email: string;
  emailVerified: boolean;
  hasGoogle: boolean;
  leagues: MeLeagueRow[];
  totalPoints: number;
  form: FormBar[];
  formLeagueName: string | null;
  preferences: Preferences;
}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();

  // Held locally so the switch moves at once, then reconciled with the server.
  const [prefs, setPrefs] = useState<Preferences>(preferences);
  const [failed, setFailed] = useState<string | null>(null);

  const toggle = (key: keyof Preferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    const previous = prefs;
    setPrefs(next);
    setFailed(null);
    updatePreferences(next, {
      // The server page above holds the same values, so it has to re-read them.
      onSuccess: () => router.refresh(),
      onError: () => {
        setPrefs(previous);
        setFailed('That setting did not save — try again.');
      },
    });
  };

  const peak = Math.max(1, ...form.map(f => f.points));

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(16px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[22px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:py-[26px] md:flex md:items-center md:gap-[20px]">
          <div className="w-[56px] h-[56px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[18px] flex-none">
            {personInitials(displayName)}
          </div>
          <div className="mt-[14px] md:mt-0 min-w-0">
            <div className="font-heading font-bold text-[24px] md:text-[26px] leading-[1] tracking-[-0.8px] truncate">{displayName || 'Your account'}</div>
            <div className="text-[12px] text-[var(--nav-text-faint)] mt-[7px] truncate">{email}</div>
          </div>
          <div className="mt-[16px] md:mt-0 md:ml-auto md:text-right">
            <div className="tf-num font-heading font-bold text-[28px] leading-[1] tracking-[-1px]">{totalPoints}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[5px]">points across {pluraliseLeagues(leagues.length)}</div>
          </div>
        </div>
      </header>

      <main className="tf-scroll flex-1 min-h-0 overflow-auto">
        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px] md:grid md:grid-cols-[minmax(0,1fr)_360px] md:gap-[28px] md:py-[24px]">

          <div>
            {form.length > 0 && (
              <section className="p-[20px_var(--gutter)_0] md:p-0">
                <div className="flex items-baseline justify-between">
                  <span className="tf-kicker">Recent form</span>
                  {formLeagueName && <span className="text-[10.5px] text-[var(--text-muted)]">{formLeagueName}</span>}
                </div>
                {/* A bar keeps a bar's width. With one settled day `flex-1`
                    stretched it across the whole row, which reads as a loading
                    block rather than a sparse history — so the row fills from
                    the left and the bars stay the size of bars. */}
                <div className="flex items-end justify-start gap-[6px] h-[80px] md:h-[110px] mt-[14px]">
                  {form.map((bar, i) => (
                    <div key={i} className="flex-1 max-w-[64px] flex flex-col items-center justify-end h-full gap-[6px]">
                      <div
                        className={`w-full rounded-t-[4px] ${bar.corrected ? 'bg-[var(--state-provisional)]' : 'bg-[var(--color-brand)]'}`}
                        style={{ height: `${Math.round((bar.points / peak) * 100)}%`, minHeight: bar.points > 0 ? 3 : 1 }}
                        title={`${bar.label}: ${bar.points}`}
                      />
                      <span className="text-[8.5px] text-[var(--text-muted)] whitespace-nowrap">{bar.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10.5px] text-[var(--text-muted)] mt-[10px] leading-[1.5]">
                  {form.length === 1
                    ? 'One day has settled so far. A lighter bar is a day whose settlement was later corrected.'
                    : 'Points by day. A lighter bar is a day whose settlement was later corrected.'}
                </p>
              </section>
            )}

            <section className="mt-[24px]">
              <div className="tf-kicker px-[var(--gutter)] md:px-0 pb-[8px]">Your leagues</div>
              {leagues.length === 0 ? (
                <div className="px-[var(--gutter)] md:px-0">
                  <p className="text-[12.5px] leading-[1.55] text-[var(--text-secondary)]">
                    You are not in a league yet. Everything on this page — your points, your form, your history — starts with one.
                  </p>
                  <div className="flex gap-[9px] mt-[13px]">
                    <Link href="/leagues/setup" className="h-[38px] px-[14px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[11.5px] grid place-items-center">
                      Start a league
                    </Link>
                    <Link href="/leagues/join" className="h-[38px] px-[14px] rounded-[10px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[11.5px] grid place-items-center">
                      Join with a code
                    </Link>
                  </div>
                </div>
              ) : leagues.map(league => (
                <Link key={league.id} href={`/leagues/${league.id}`} className="flex items-center gap-[12px] p-[13px_var(--gutter)] md:px-[4px] border-b border-[var(--surface-border)]">
                  <span className="tf-crest w-[26px] h-[28px] text-[8px] flex-none" style={{ background: tintFor(league.crest) }}>{league.crest}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[13px] truncate">{league.name}</div>
                    <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px] truncate">{league.meta}</div>
                  </div>
                  <span className="tf-num font-heading font-bold text-[13px] flex-none">{league.points}</span>
                </Link>
              ))}
            </section>
          </div>

          <div>
            <section className="mt-[24px] md:mt-0">
              <div className="tf-kicker px-[var(--gutter)] md:px-0 pb-[8px]">Account</div>
              <Row title="Display name" note={`${displayName} · shown on every leaderboard`} href="/me/name" />
              <Row title="Change password" note="Needs your current one. This session stays open, others do not." href="/me/password" />
              <Row
                title="Email address"
                note={`${email} · ${emailVerified ? 'verified' : 'not yet verified'}`}
                badge={emailVerified ? undefined : 'UNVERIFIED'}
                href="/me/email"
              />
              <Row title="Google" note={hasGoogle ? `Linked to ${email}` : 'Not linked · sign in with your password only'} />
            </section>

            <section className="mt-[24px]">
              <div className="tf-kicker px-[var(--gutter)] md:px-0 pb-[8px]">Appearance</div>
              <ThemeToggle />
            </section>

            <section className="mt-[24px]">
              <div className="tf-kicker px-[var(--gutter)] md:px-0 pb-[8px]">Emails</div>
              <Row title="Weekly prediction reminder" note="One email a week, only if something is unanswered">
                <Switch label="Weekly prediction reminder" on={prefs.roundReminder} onToggle={() => toggle('roundReminder')} />
              </Row>
              <Row title="Custom question admin" note="Chasers before a question you own would void">
                <Switch label="Custom question admin" on={prefs.customQuestionAdmin} onToggle={() => toggle('customQuestionAdmin')} />
              </Row>
              <Row title="Account security" note="Sign-ins, password and email changes. Always sent.">
                <Switch label="Account security" on locked />
              </Row>
              {failed && (
                <p role="alert" className="px-[var(--gutter)] md:px-0 pt-[10px] text-[11px] text-[var(--danger-text)]">{failed}</p>
              )}
            </section>

            {/* The only route to these from inside the app — everywhere else
                they are linked lives behind the sign-in screen. */}
            <section className="mt-[24px]">
              <div className="tf-kicker px-[var(--gutter)] md:px-0 pb-[8px]">Legal</div>
              <Row title="Privacy policy" note="What we collect, who sees it, and how to have it removed." href="/privacy" />
              <Row title="Terms of service" note="The rules for using TopFour." href="/terms" />
            </section>

            <section className="mt-[24px] pb-[26px]">
              <div className="tf-kicker px-[var(--gutter)] md:px-0 pb-[8px]">Signing out</div>
              <Row title="Sign out" note="This device only. Your other sessions stay signed in." onClick={signOut} />
            </section>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

function pluraliseLeagues(n: number): string {
  return `${n} league${n === 1 ? '' : 's'}`;
}
