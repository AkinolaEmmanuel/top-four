import Link from 'next/link';
import { LeagueColumn } from './LeagueColumn';

/**
 * What a league looks like once it is over.
 *
 * A finished league used to keep showing the in-progress Overview — a countdown
 * to a lock that will never come, and a "Finish predictions" button for markets
 * that closed weeks ago. The three end states differ in what they say happened,
 * not in what they let you do: everything stays readable, nothing stays
 * answerable.
 */

export type EndState = 'completed' | 'cancelled' | 'archived';

interface Banner {
  badge: string;
  badgeSurface: string;
  badgeText: string;
  headline: string;
  lead: string;
  body: string;
  accent: string;
}

const BANNERS: Record<EndState, Banner> = {
  completed: {
    badge: 'COMPLETED',
    badgeSurface: 'var(--success-surface)',
    badgeText: 'var(--success-text)',
    headline: 'The table is final',
    lead: 'Every market has settled',
    body: 'A league finishes when the last expected market reaches a final decision and no question is still unresolved. A market that settled as void is a final decision, not a missing one.',
    accent: 'var(--color-success)',
  },
  cancelled: {
    badge: 'CANCELLED',
    badgeSurface: 'var(--danger-surface)',
    badgeText: 'var(--danger-text)',
    headline: 'The owner ended this league',
    lead: 'Everything kicking off after the cutoff was voided',
    body: 'The cutoff is a moment, and kick-off decides the side. A fixture that had already kicked off settled normally on the real facts. Everything later was voided outright, whether or not it had been answered.',
    accent: 'var(--color-danger)',
  },
  archived: {
    badge: 'ARCHIVED',
    badgeSurface: 'var(--surface-subtle)',
    badgeText: 'var(--text-muted)',
    headline: 'Moved out of the active list',
    lead: 'Nothing else changed',
    body: 'Archiving only moves a completed league out of everyone’s active list. Nothing was voided, no points changed, and every screen reads exactly as it did the day it finished.',
    accent: 'var(--surface-border-strong)',
  },
};

const CLOSED: Record<EndState, Array<{ title: string; note: string }>> = {
  completed: [
    { title: 'Predicting', note: 'There is nothing left to answer' },
    { title: 'Asking questions', note: 'Every question has resolved' },
    { title: 'Joining', note: 'A finished league cannot take new members' },
  ],
  cancelled: [
    { title: 'Predicting', note: 'Cancellation closed every remaining market' },
    { title: 'Resuming', note: 'Permanent. A new league is the only way forward' },
  ],
  archived: [
    { title: 'Predicting', note: 'The league completed before it was archived' },
    { title: 'Joining', note: 'Membership closed when the league completed' },
  ],
};

export function LeagueEndStateScreen({
  leagueId, state, ownPosition, ownPoints, memberCount, fixtureCount, questionCount,
}: {
  leagueId: string;
  state: EndState;
  /** "3rd", or null where the member never scored. */
  ownPosition: string | null;
  ownPoints: number | null;
  memberCount: number;
  fixtureCount: number;
  questionCount: number;
}) {
  const banner = BANNERS[state];

  const open = [
    { title: 'Final table', href: `/leagues/${leagueId}/table`, note: `${memberCount} member${memberCount === 1 ? '' : 's'}, every tiebreaker applied` },
    { title: `All ${fixtureCount} fixtures`, href: `/leagues/${leagueId}/fixtures?view=results`, note: 'Your answers beside everyone else’s' },
    ...(questionCount > 0
      ? [{ title: 'Questions', href: `/leagues/${leagueId}/questions`, note: `${questionCount} written for this league` }]
      : []),
    { title: 'League rules', href: `/leagues/${leagueId}/rules`, note: 'The ruleset this league was played under' },
  ];

  return (
    <LeagueColumn className="md:pt-[20px]">
      <section
        className="p-[18px_var(--gutter)] md:px-[18px] md:rounded-[14px] md:mt-0 border-l-[3px]"
        style={{ borderColor: banner.accent, background: 'var(--surface-subtle)' }}
      >
        <div className="flex items-center gap-[9px]">
          <span
            className="font-heading font-bold text-[9px] tracking-[0.08em] px-[7px] py-[3px] rounded-[5px] flex-none"
            style={{ background: banner.badgeSurface, color: banner.badgeText }}
          >
            {banner.badge}
          </span>
          <span className="tf-kicker text-[var(--text-muted)]">{banner.lead}</span>
        </div>
        <h2 className="font-heading font-bold text-[20px] md:text-[23px] tracking-[-0.5px] mt-[10px]">{banner.headline}</h2>
        <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px] max-w-[70ch]">{banner.body}</p>
      </section>

      {ownPosition && (
        <section className="flex items-end gap-[12px] p-[20px_var(--gutter)_0] md:px-0">
          <span className="tf-num font-heading font-bold text-[44px] md:text-[52px] leading-[0.85] tracking-[-2px]">
            {ownPosition}
          </span>
          <div className="pb-[5px]">
            <div className="font-heading font-semibold text-[12.5px]">of {memberCount} member{memberCount === 1 ? '' : 's'}</div>
            {ownPoints !== null && (
              <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">
                {ownPoints.toLocaleString('en-GB')} points · {state === 'cancelled' ? 'on what counted' : 'final'}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="md:grid md:grid-cols-2 md:gap-[28px] md:mt-[24px]">
        <section className="mt-[22px] md:mt-0">
          <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_8px] md:px-0">Still open to you</div>
          {open.map(entry => (
            <Link
              key={entry.title}
              href={entry.href}
              className="flex items-center gap-[12px] p-[13px_var(--gutter)] md:px-0 border-t border-[var(--surface-border)] last:border-b"
            >
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-[13.5px]">{entry.title}</div>
                <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{entry.note}</div>
              </div>
              <span className="text-[16px] text-[var(--text-muted)] flex-none">›</span>
            </Link>
          ))}
        </section>

        <section className="mt-[22px] md:mt-0">
          <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_8px] md:px-0">Now closed</div>
          {CLOSED[state].map(entry => (
            <div
              key={entry.title}
              className="flex items-center gap-[12px] p-[13px_var(--gutter)] md:px-0 border-t border-[var(--surface-border)] last:border-b opacity-65"
            >
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-[13.5px]">{entry.title}</div>
                <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{entry.note}</div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <p className="p-[20px_var(--gutter)_26px] md:px-0 text-[11px] leading-[1.6] text-[var(--text-muted)]">
        {state === 'cancelled'
          ? 'Cancellation cannot be undone and cannot be partially applied. Every member was emailed when it happened.'
          : 'A finished league is kept indefinitely and stays fully readable. It no longer counts against your twenty unfinished leagues.'}
      </p>
    </LeagueColumn>
  );
}
