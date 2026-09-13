'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * A player's photo, or their initials when there is none.
 *
 * The design's `.tf-face` is a circle of initials, and it stays the fallback:
 * a player has no photo until their catalogue entry is refreshed and the image
 * is ingested, so the tinted circle is the ordinary case rather than an error
 * state. Both render at the same size, so a squad list does not jump as photos
 * arrive.
 *
 * An image that fails to load falls back to the same circle. Photos are
 * ingested after the player exists, so a URL can outlive the object it names —
 * and a broken-image glyph in a round frame reads as a fault in the app.
 *
 * `background` is the caller's, because each screen tints its own way — by row
 * in the picker, by selection state on the fixture.
 */
export function PlayerFace({ name, initials, photoUrl, size, background, foreground, className = '' }: {
  name: string;
  initials: string;
  photoUrl?: string | null;
  size: number;
  background: string;
  /** The initials' colour, where the caller's background demands its own. */
  foreground?: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const base = `rounded-full flex-none overflow-hidden ${className}`;

  if (photoUrl && !broken) {
    return (
      <span className={`relative inline-block align-middle ${base}`} style={{ width: size, height: size, background }}>
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setBroken(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-grid place-items-center align-middle font-heading font-bold ${base}`}
      style={{ width: size, height: size, background, color: foreground ?? 'var(--text-primary)', fontSize: Math.round(size * 0.34) }}
    >
      {initials}
    </span>
  );
}
