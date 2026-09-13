import Link from 'next/link';

/**
 * The way back, on wide screens.
 *
 * The design gives desktop no back control at all — it assumes the tab bars
 * are enough. They are not: a fixture is reachable from Home, Predict, a
 * league's Overview and its Fixtures list, and none of those are a tab from
 * where you land. The browser's back button was the only answer. Narrow
 * screens keep their own chevron, which is the design's answer there.
 */

export interface Crumb {
  label: string;
  /** Omitted on the last crumb — you are already there. */
  href?: string;
}

/**
 * `dark` puts the trail on the nav band instead of the card.
 *
 * A screen whose own header is dark — league setup — otherwise gets a white
 * stripe between two navy ones, and the chrome reads as three bars rather than
 * one block. The light tone stays the default: everywhere else the breadcrumb
 * sits above light content and belongs to it.
 */
export function Breadcrumb({ trail, tone = 'light' }: { trail: Crumb[]; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <nav
      aria-label="Breadcrumb"
      className={`hidden md:block flex-none ${dark ? 'bg-[var(--nav-surface)]' : 'bg-[var(--surface-card)]'}`}
    >
      {/* Edge to edge with the same 24px as the bars above and below it. Capped
          at 1080 and centred, the trail started 167px in on a 1365px window
          while the brand mark and the league crest both started at 24 — the
          same mistake level one was making. */}
      <ol className={`px-[24px] h-[38px] flex items-center gap-[7px] text-[11.5px] ${dark ? 'text-[var(--nav-text-faint)]' : 'text-[var(--text-muted)]'}`}>
        {trail.map((crumb, i) => (
          <li key={i} className="flex items-center gap-[7px] min-w-0">
            {i > 0 && <span aria-hidden="true" className={dark ? 'text-[var(--nav-border)]' : 'text-[var(--surface-border-strong)]'}>/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={`tf-hit truncate transition-colors ${dark ? 'text-[var(--nav-text-quiet)] hover:text-[var(--nav-text)]' : 'hover:text-[var(--text-link)]'}`}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={`truncate ${dark ? 'text-[var(--nav-text)]' : 'text-[var(--text-secondary)]'}`} aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
