/**
 * Presentation helpers shared across screens, so the same value is never
 * written two different ways on two halves of the same product.
 */

/** 1st, 2nd, 3rd, 4th — and 11th/12th/13th, which break the last-digit rule. */
export function ordinal(n: number): string {
  const teens = n % 100;
  if (teens >= 11 && teens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** "1 member" / "12 members" — the singular case is common enough to matter. */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
