import Image from 'next/image';
import { tintFor } from '@/lib/crest';

/**
 * A team's badge, or its code when the provider has none.
 *
 * A real badge renders on its own. The design's shield — a white plate, a
 * clip-path and a drawn edge — was a stand-in for badges the prototype did not
 * have; putting a real crest inside another crest reads as a sticker on a
 * shield. Only the fallback keeps the shield, because there it *is* the badge.
 *
 * The two share a box of the same size so a row of teams does not jump when
 * one of them is missing a badge.
 *
 * Both are `inline-block` on purpose. The width and height are inline styles,
 * and an inline element ignores them — this rendered at 0×0 the moment a caller
 * wrapped it in anything that was not a flex container, which is exactly what
 * happened on the fixture hero.
 */
export function TeamCrest({ code, logoUrl, size, className = '' }: {
  code: string;
  logoUrl?: string | null;
  /** Width in px; the box is slightly taller, which is the shield's ratio. */
  size: number;
  className?: string;
}) {
  const height = Math.round(size * 1.08);

  if (logoUrl) {
    return (
      <span className={`relative inline-block flex-none align-middle ${className}`} style={{ width: size, height }}>
        <Image src={logoUrl} alt={code} fill sizes={`${size}px`} className="object-contain" />
      </span>
    );
  }

  return (
    <span
      className={`tf-crest inline-grid flex-none align-middle ${className}`}
      style={{ background: tintFor(code), width: size, height, fontSize: Math.round(size * 0.32) }}
    >
      {code}
    </span>
  );
}
