import Link from 'next/link';

/**
 * A whole-page problem state.
 *
 * The design gives these exact copy, and the reasons matter: a 404 and a 403 on
 * a league you cannot see must be indistinguishable, because telling you the
 * difference reveals which leagues exist and who is in them. Only the
 * unexpected state carries a reference, and it never prints the raw detail.
 */

export type ProblemIcon = 'ghost' | 'lock' | 'clock' | 'cloud' | 'warn';

const GLYPHS: Record<ProblemIcon, string> = {
  ghost: '◌',
  lock: '⌧',
  clock: '◔',
  cloud: '☁',
  warn: '⚠',
};

export function ProblemState({
  icon, title, body, tone = 'muted', action, secondary, reference, children,
}: {
  icon: ProblemIcon;
  title: string;
  body: string;
  /** Warn for the states that are our fault or time-bound; muted otherwise. */
  tone?: 'muted' | 'warn';
  action?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Shown only on an unexpected failure — the one identifier a member ever sees. */
  reference?: string;
  /** A retry control, which has to be a Client Component to do anything. */
  children?: React.ReactNode;
}) {
  const color = tone === 'warn' ? 'var(--warn-text)' : 'var(--text-muted)';

  return (
    <div className="flex flex-col flex-1 min-h-[100dvh] md:min-h-0 md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      <div className="flex-1 grid place-items-center p-[var(--gutter)]">
        <div className="flex flex-col items-center text-center max-w-[420px]">
          <div
            className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px]"
            style={{ color }}
            aria-hidden="true"
          >
            {GLYPHS[icon]}
          </div>

          <h1 className="font-heading font-bold text-[21px] md:text-[24px] leading-[1.2] tracking-[-0.5px] mt-[20px]">
            {title}
          </h1>

          <p className="text-[13px] md:text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">
            {body}
          </p>

          {children}

          {action && (
            <Link
              href={action.href}
              className="tf-tap mt-[22px] h-[48px] px-[24px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px]"
            >
              {action.label}
            </Link>
          )}

          {secondary && (
            <Link
              href={secondary.href}
              className="tf-tap mt-[12px] h-[40px] px-[16px] grid place-items-center font-heading font-semibold text-[12.5px] text-[var(--text-link)]"
            >
              {secondary.label}
            </Link>
          )}

          {reference && (
            <div className="mt-[22px] pt-[16px] border-t border-[var(--surface-border)] w-full">
              <div className="tf-kicker text-[var(--text-muted)]">REFERENCE</div>
              <code className="inline-block mt-[7px] text-[11.5px] text-[var(--text-secondary)] font-mono break-all">
                {reference}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
