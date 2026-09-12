/**
 * The fallback colour behind a team's three-letter code.
 *
 * Only used when the provider has no badge for a team. Five screens each kept
 * their own copy of this table and they had already drifted apart.
 */
const CLUB_TINTS: Record<string, string> = {
  ARS: '#c8182f', CHE: '#1746a2', LIV: '#b7152b', TOT: '#17233d',
  MCI: '#559ac7', EVE: '#153c85', MUN: '#d1262f', NEW: '#20242a',
  PP: '#0879bf', OL: '#7f56d9', AL: '#0e7a5f',
};

export const tintFor = (code: string): string => CLUB_TINTS[code] || '#4b5563';
