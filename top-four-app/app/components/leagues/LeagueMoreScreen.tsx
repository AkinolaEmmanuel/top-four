'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLeaveLeague } from '@/hooks/api/useLeagues';
import type { MoreEntry, MoreSection } from '@/lib/leagues/league-more';

/**
 * The league "More" menu — one component for both platforms.
 *
 * A Client Component for one action: leaving the league. Which entries appear
 * is decided on the server, so this only draws them.
 */

const TONE_TEXT: Record<MoreEntry['tone'], string> = {
  normal: 'text-[var(--text-primary)]',
  live: 'text-[var(--text-primary)]',
  quiet: 'text-[var(--text-secondary)]',
  danger: 'text-[var(--danger-text)]',
};

function EntryBody({ entry }: { entry: MoreEntry }) {
  return (
    <>
      <span className={`w-[32px] h-[32px] rounded-[9px] flex-none grid place-items-center font-heading font-bold text-[13px] bg-[var(--surface-subtle)] ${entry.tone === 'danger' ? 'text-[var(--danger-text)]' : 'text-[var(--text-secondary)]'}`}>
        {entry.glyph}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px]">
          <span className={`font-heading font-semibold text-[13.5px] ${TONE_TEXT[entry.tone]}`}>{entry.title}</span>
          {entry.badge && (
            <span className={`font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_7px] rounded-[4px] flex-none ${entry.tone === 'live' ? 'bg-[var(--accent-surface)] text-[var(--accent-text)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              {entry.badge}
            </span>
          )}
        </div>
        <div className="text-[10.5px] md:text-[11.5px] text-[var(--text-muted)] mt-[3px]">{entry.note}</div>
      </div>
      <span className="text-[16px] text-[var(--text-muted)] flex-none">›</span>
    </>
  );
}

export function LeagueMoreScreen({ leagueId, leagueName, lifecycleLabel, roleLabel, isComplete, sections, footNote }: {
  leagueId: string;
  leagueName: string;
  lifecycleLabel: string;
  roleLabel: string;
  isComplete: boolean;
  sections: MoreSection[];
  footNote: string;
}) {
  const router = useRouter();
  const leaveLeague = useLeaveLeague(leagueId);
  const [failed, setFailed] = useState<string | null>(null);

  const leave = () => {
    if (leaveLeague.isPending) return;
    const confirmed = window.confirm(
      'Leave this league? Your predictions and points stay in the table, without your name attached. Rejoining later starts you back on zero.',
    );
    if (!confirmed) return;
    setFailed(null);
    leaveLeague.mutate(undefined, {
      onSuccess: () => router.push('/leagues'),
      onError: () => setFailed("That didn't go through — you are still in the league."),
    });
  };

  const rowClass = (entry: MoreEntry) =>
    `flex items-center gap-[13px] p-[13px_var(--gutter)] md:px-[6px] border-t border-[var(--surface-border)] last:border-b w-full text-left ${entry.tone === 'danger' ? 'shadow-[inset_3px_0_0_0_var(--color-danger)]' : ''}`;

  return (
    <>



          {sections.map(section => (
            <section key={section.label} className="mt-[18px] md:mt-[24px]">
              <div className="p-[0_var(--gutter)_9px] md:px-0">
                <span className="tf-kicker" style={{ color: section.tone === 'danger' ? 'var(--danger-text)' : 'var(--text-muted)' }}>
                  {section.label}
                </span>
              </div>
              {section.entries.map(entry => (
                entry.href ? (
                  <Link key={entry.title} href={entry.href} className={`tf-tap ${rowClass(entry)}`}>
                    <EntryBody entry={entry} />
                  </Link>
                ) : (
                  <button
                    key={entry.title}
                    type="button"
                    onClick={entry.action === 'leave' ? leave : undefined}
                    disabled={leaveLeague.isPending}
                    className={`tf-tap ${rowClass(entry)}`}
                  >
                    <EntryBody entry={entry} />
                  </button>
                )
              ))}
            </section>
          ))}

          {failed && (
            <p role="alert" className="px-[var(--gutter)] md:px-0 pt-[14px] text-[11.5px] text-[var(--danger-text)]">{failed}</p>
          )}

          <p className="p-[20px_var(--gutter)_26px] md:px-0 text-[11px] leading-[1.6] text-[var(--text-muted)]">{footNote}</p>
    </>
  );
}
