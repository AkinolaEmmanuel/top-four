import { TopFourMark } from './top-four-mark';

/*
 * The lockup: the mark, then the name with "Four" in the brand colour.
 *
 * The name stays live text in the app's heading font rather than traced
 * letterforms. It is selectable, read aloud correctly, and takes its colours
 * from the same tokens as everything around it; a traced wordmark would freeze
 * a typeface into the markup and need its own light and dark handling.
 *
 * The mark is `currentColor`, so both halves follow the surface they sit on.
 *
 * `accent` exists because the nav paints itself from a different palette than
 * the page does, and its blue is `--nav-accent` rather than `--color-brand`.
 */
export function TopFourLogo({
  size = 17,
  accent = 'var(--color-brand)',
  className,
}: {
  /** Font size of the name in px; the mark is scaled to match its cap height. */
  size?: number;
  accent?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[8px] ${className ?? ''}`}>
      <TopFourMark className="w-auto flex-none" style={{ height: size * 1.25 }} />
      <span
        className="font-heading font-bold leading-[1] tracking-[-0.6px]"
        style={{ fontSize: size }}
      >
        Top<span style={{ color: accent }}>Four</span>
      </span>
    </span>
  );
}
