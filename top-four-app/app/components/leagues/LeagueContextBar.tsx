import Link from 'next/link';
import { LeagueTabs } from './LeagueTabs';
import { lifecycleBadge, leagueInitials } from '@/lib/leagues/lifecycle';

/**
 * The design's level two: one 54px bar naming the league, with its tabs pushed
 * to the right edge.
 *
 * It replaces the two stacked bars we drew — a name bar and then a tab bar —
 * which cost 97px of every wide screen and read as two unrelated strips.
 *
 * Fixture Predict sits inside a league without being a league route, so it
 * shows the bar with no tab marked current and without the league's lifecycle
 * or member count, which it has no reason to have fetched.
 */
export function LeagueContextBar({
  leagueId, leagueName, meta, lifecycleState, linkName = false,
}: {
  leagueId: string;
  leagueName: string;
  /** Competition, and member count where the screen already knows it. */
  meta: string;
  lifecycleState?: string;
  /** True where the bar is context rather than the page you are on. */
  linkName?: boolean;
}) {
  const badge = lifecycleState ? lifecycleBadge(lifecycleState) : null;

  const name = (
    <span className="font-heading font-bold text-[14.5px] tracking-[-0.2px] whitespace-nowrap">
      {leagueName}
    </span>
  );

  return (
    <div className="hidden md:flex flex-none items-end gap-[20px] h-[54px] px-[24px] bg-[var(--surface-card)] border-b border-[var(--surface-border)]">
      <div className="flex items-center gap-[10px] pb-[11px] min-w-0">
        {/* The way out. A phone has the header's back chevron, but that header
            is `md:hidden`, so on a wide screen a league was a room with no door
            — every tab led further in and none led back to the list. */}
        <Link
          href="/leagues"
          aria-label="Back to my leagues"
          className="w-[24px] h-[24px] rounded-[7px] grid place-items-center flex-none text-[14px] leading-none text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors"
        >‹</Link>
        <span className="w-[26px] h-[26px] rounded-[8px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[10px] flex-none">
          {leagueInitials(leagueName)}
        </span>
        {linkName
          ? <Link href={`/leagues/${leagueId}`} className="hover:text-[var(--text-link)] transition-colors">{name}</Link>
          : name}
        {badge && (
          <span
            className="font-heading font-semibold text-[10.5px] px-[9px] py-[3px] rounded-full flex-none"
            style={{ background: badge.surface, color: badge.text }}
          >
            {badge.label}
          </span>
        )}
        <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap truncate">{meta}</span>
      </div>
      <LeagueTabs leagueId={leagueId} variant="wide" />
    </div>
  );
}
