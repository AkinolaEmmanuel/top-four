'use client';

import { useEffect, useState } from 'react';
import { teamColour } from '@/lib/crest-colour';
import { tintFor } from '@/lib/crest';

/**
 * The two teams' colours for a hero gradient.
 *
 * Starts on the code table so the first paint is never colourless, then
 * replaces it once the badges have been read. A cached pair resolves in the
 * same tick, so only a team's first appearance ever transitions.
 */
export function useTeamColours(
  home: { code: string; logoUrl: string | null },
  away: { code: string; logoUrl: string | null },
): [string, string] {
  const [colours, setColours] = useState<[string, string]>(
    () => [tintFor(home.code), tintFor(away.code)],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      teamColour(home.logoUrl, home.code),
      teamColour(away.logoUrl, away.code),
    ]).then(pair => { if (!cancelled) setColours(pair); });
    return () => { cancelled = true; };
  }, [home.logoUrl, home.code, away.logoUrl, away.code]);

  return colours;
}
