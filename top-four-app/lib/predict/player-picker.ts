import type { SelectablePlayer } from '@/lib/api/predictions-fixture';

/**
 * The player picker's squad lists, shaped once on the server.
 *
 * Filtering and searching stay on the client — they are what the screen is for —
 * but the shaping happens once here so both the filter and the render agree on
 * what a player is.
 */

export type PickerMarket = 'scorer' | 'card';

export interface PickerPlayer {
  id: string;
  name: string;
  /** Null when the provider gave no shirt number, which happens often. */
  shirt: number | null;
  position: string | null;
  initials: string;
  side: 'home' | 'away';
}

export interface PickerSquad {
  side: 'home' | 'away';
  code: string;
  name: string;
  players: PickerPlayer[];
}

export const MARKET_TYPE: Record<PickerMarket, 'anytime_goalscorer' | 'player_card'> = {
  scorer: 'anytime_goalscorer',
  card: 'player_card',
};

export const MARKET_COPY: Record<PickerMarket, { title: string; rule: string }> = {
  scorer: {
    title: 'Anytime goalscorer',
    rule: 'Extra time counts. A penalty shootout does not, and an own goal is not a goalscorer. A player who never gets on the pitch is simply wrong.',
  },
  card: {
    title: 'Player to be carded',
    rule: 'A yellow, a second yellow and a straight red all count, including in extra time. A card shown to an unused substitute does not.',
  },
};

function initialsOf(name: string): string {
  return name.split(' ').map(part => part[0] ?? '').join('').substring(0, 2).toUpperCase();
}

export function toPickerPlayer(player: SelectablePlayer): PickerPlayer {
  return {
    id: player.playerId,
    name: player.displayName,
    shirt: player.shirtNumber,
    position: player.position,
    initials: initialsOf(player.displayName),
    side: player.side === 'away' ? 'away' : 'home',
  };
}

export function toSquads(
  players: SelectablePlayer[],
  home: { code: string; name: string },
  away: { code: string; name: string },
): PickerSquad[] {
  const all = players.map(toPickerPlayer);
  return [
    { side: 'home', code: home.code, name: home.name, players: all.filter(p => p.side === 'home') },
    { side: 'away', code: away.code, name: away.name, players: all.filter(p => p.side === 'away') },
  ];
}

/** The positions actually present, so the chips never offer an empty filter. */
export function positionsIn(squads: PickerSquad[]): string[] {
  const present = new Set<string>();
  let hasUnlisted = false;
  for (const squad of squads) {
    for (const player of squad.players) {
      if (player.position) present.add(player.position); else hasUnlisted = true;
    }
  }
  const order = ['GK', 'DEF', 'MID', 'FWD'];
  const known = order.filter(p => present.has(p));
  const others = Array.from(present).filter(p => !order.includes(p)).sort();
  return [...known, ...others, ...(hasUnlisted ? ['Unlisted'] : [])];
}

export function matches(player: PickerPlayer, search: string, position: string): boolean {
  if (search && !player.name.toLowerCase().includes(search.toLowerCase())) return false;
  if (position === 'All') return true;
  if (position === 'Unlisted') return player.position === null;
  return player.position === position;
}

/** A player's subtitle: their shirt number when the provider gave one. */
export function playerMeta(player: PickerPlayer): string {
  if (player.position && player.shirt !== null) return `${player.position} · ${player.shirt}`;
  if (player.position) return player.position;
  if (player.shirt !== null) return `Number ${player.shirt}`;
  return 'Position not listed';
}
