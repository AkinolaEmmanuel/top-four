'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

/**
 * The league tab bar — a bottom bar on a phone, a context strip on a wide
 * screen.
 *
 * It exists because this bar was copy-pasted inline into four screens and
 * missing from three others, so tapping "Table" from a league left you with no
 * way back: Table, Rules and Admin each dropped it. One component, used by every
 * league screen, cannot be missing from one of them.
 */

/**
 * Five tabs at width, four on a phone.
 *
 * Questions is a tab on desktop and a More row on a phone — the design is
 * explicit that this is a slot problem, not a ranking one: it is member-facing,
 * it carries a badge and it has points riding on it, and the four-slot bottom
 * bar simply ran out of room. Desktop may add tabs; it may never rename one.
 */
export type TabId = 'overview' | 'fixtures' | 'table' | 'questions' | 'more';

/** Narrowed once here, so the phone bar's icon lookup needs no cast. */
type PhoneTabId = Exclude<TabId, 'questions'>;

/** Phone-bar icons only; the wide bar is text. Questions has no phone slot. */
const ICONS: Record<PhoneTabId, ReactElement> = {
  overview: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" /><path d="M9.5 20v-6h5v6" /></svg>
  ),
  fixtures: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" /></svg>
  ),
  table: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19V11M12 19V5M19 19V8" /></svg>
  ),
  more: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0"><path d="M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
  ),
};

const TABS: Array<{ id: TabId; label: string; wideOnly?: boolean }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'table', label: 'Table' },
  { id: 'questions', label: 'Questions', wideOnly: true },
  { id: 'more', label: 'More' },
];

const PHONE_TABS: Array<{ id: PhoneTabId; label: string }> = TABS
  .filter((tab): tab is { id: PhoneTabId; label: string } => tab.id !== 'questions')
  .map(({ id, label }) => ({ id, label }));

const hrefFor = (leagueId: string, id: TabId) =>
  id === 'overview' ? `/leagues/${leagueId}` : `/leagues/${leagueId}/${id}`;

/**
 * Derives the active tab from the URL rather than taking it as a prop, so the
 * bar can live in the league layout and survive navigation between tabs
 * instead of remounting with each screen.
 */
function activeFrom(pathname: string, leagueId: string): TabId | null {
  const base = `/leagues/${leagueId}`;
  // The strip also appears on Fixture Predict, which is not a league route.
  // Nothing there is a tab, so nothing is marked current — before this guard
  // the fall-through lit "More" on every fixture.
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return null;
  const rest = pathname.slice(base.length);
  if (rest.startsWith('/fixtures')) return 'fixtures';
  if (rest.startsWith('/table')) return 'table';
  if (rest.startsWith('/questions')) return 'questions';
  if (rest === '' || rest === '/') return 'overview';
  // Rules and Admin are reached through More at both widths.
  return 'more';
}

export function LeagueTabs({ leagueId, badge, variant }: {
  leagueId: string;
  /** Unanswered markets, shown on Fixtures. Empty string hides it. */
  badge?: string;
  /**
   * Which bar to draw. They are separate elements in separate places now — the
   * wide one sits inside the level-two bar beside the league's name, the phone
   * one is fixed to the bottom of the viewport — so the component can no longer
   * render both and let a media query pick.
   */
  variant: 'wide' | 'phone';
}) {
  const active = activeFrom(usePathname() ?? '', leagueId);
  const badgeFor = (id: TabId) => (id === 'fixtures' ? badge : '');

  /*
   * Just the tabs. The bar around them is the level-two bar's job now — this
   * kept its old standalone chrome after it moved inside, so a centred 1080px
   * box left the tabs stranded mid-bar instead of pushed to the right edge
   * where the design puts them.
   */
  if (variant === 'wide') {
    return (
      <nav aria-label="League sections" className="flex items-end self-stretch ml-auto">
          <div className="flex items-end gap-[2px] h-[45px]">
            {TABS.map(tab => {
              const on = tab.id === active;
              const count = badgeFor(tab.id);
              return (
                <Link
                  key={tab.id}
                  href={hrefFor(leagueId, tab.id)}
                  aria-current={on ? 'page' : undefined}
                  className={`flex items-center h-full px-[13px] font-heading font-semibold text-[12.5px] border-b-2 ${on ? 'border-[var(--color-brand)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >
                  {tab.label}
                  {count && (
                    <span className="ml-[7px] min-w-[16px] h-[16px] px-[4px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] inline-grid place-items-center font-bold text-[9px]">{count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-card)] border-t border-[var(--surface-border)] grid grid-cols-4 pt-[7px] px-[4px] pb-[calc(8px+env(safe-area-inset-bottom))] min-h-[66px]">
          {PHONE_TABS.map(tab => {
            // Questions is a wide-screen tab; on a phone it stays a More row, so
            // landing there lights More rather than nothing.
            const on = tab.id === active || (tab.id === 'more' && active === 'questions');
            const count = badgeFor(tab.id);
            return (
              <Link
                key={tab.id}
                href={hrefFor(leagueId, tab.id)}
                aria-current={on ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center font-heading font-semibold text-[9px] leading-[1]"
                style={{ color: on ? 'var(--color-brand)' : 'var(--text-muted)' }}
              >
                <div className="w-[19px] h-[19px] grid place-items-center">{ICONS[tab.id]}</div>
                <span className="mt-[6px] tracking-[0.01em] uppercase">{tab.label}</span>
                {count && (
                  <span className="absolute top-[2px] left-[calc(50%+6px)] min-w-[15px] h-[15px] px-[3px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] grid place-items-center font-bold text-[8px]">{count}</span>
                )}
              </Link>
            );
          })}
        </nav>
  );
}
