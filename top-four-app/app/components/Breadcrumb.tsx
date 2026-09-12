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

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:block flex-none bg-[var(--surface-card)]"
    >
      <ol className="max-w-[1080px] mx-auto px-[24px] h-[38px] flex items-center gap-[7px] text-[11.5px] text-[var(--text-muted)]">
        {trail.map((crumb, i) => (
          <li key={i} className="flex items-center gap-[7px] min-w-0">
            {i > 0 && <span aria-hidden="true" className="text-[var(--surface-border-strong)]">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="truncate hover:text-[var(--text-link)] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate text-[var(--text-secondary)]" aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
