/*
 * The TopFour mark: a "4" cut from four blocks.
 *
 * Traced from the brand PNG by measuring it rather than by eye, and verified by
 * overlaying the two: every remaining difference is a one-pixel edge, which is
 * the anti-aliasing of the source.
 *
 * `currentColor` on purpose. The mark is a single colour, so it inherits from
 * whatever it sits in and follows the theme without a second file or a swap —
 * the same reason `football-ball.tsx` does it.
 */
export function TopFourMark({ className, style, title }: {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 510 474"
      fill="currentColor"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {/* top left, cut by the diagonal */}
      <path d="M40 0H198A40 40 0 0 1 238 40V79L104 227H40A40 40 0 0 1 0 187V40A40 40 0 0 1 40 0Z" />
      {/* bottom left. The cut is one straight line through the whole mark, which
          the source art broke here: its lower segment sat on a shallower angle,
          leaving a 20px jog at the gap. Collinear with the top block's cut. */}
      <path d="M40 249H84L19 321H238V433A40 40 0 0 1 198 473H40A40 40 0 0 1 0 433V289A40 40 0 0 1 40 249Z" />
      {/* the stem, with its shoulder */}
      <path d="M310 0H469A40 40 0 0 1 509 40V187A40 40 0 0 1 469 227H336V81H270V40A40 40 0 0 1 310 0Z" />
      {/* bottom right */}
      <path d="M336 249H469A40 40 0 0 1 509 289V433A40 40 0 0 1 469 473H336Z" />
    </svg>
  );
}
