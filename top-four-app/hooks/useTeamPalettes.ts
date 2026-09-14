'use client';

import { useEffect, useState } from 'react';
import { teamPalette, type TeamPalette } from '@/lib/crest-colour';
import { tintFor } from '@/lib/crest';

/**
 * The two teams' palettes for a hero gradient.
 *
 * Starts on the code table so the first paint is never colourless, then
 * replaces it once the badges have been read. A cached pair resolves in the
 * same tick, so only a team's first appearance ever transitions.
 */
export function useTeamPalettes(
  home: { code: string; logoUrl: string | null },
  away: { code: string; logoUrl: string | null },
): [TeamPalette, TeamPalette] {
  const [palettes, setPalettes] = useState<[TeamPalette, TeamPalette]>(
    () => [
      { primary: tintFor(home.code), secondary: null },
      { primary: tintFor(away.code), secondary: null },
    ],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      teamPalette(home.logoUrl, home.code),
      teamPalette(away.logoUrl, away.code),
    ]).then(pair => { if (!cancelled) setPalettes(pair); });
    return () => { cancelled = true; };
  }, [home.logoUrl, home.code, away.logoUrl, away.code]);

  return palettes;
}
