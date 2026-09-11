import type { CSSProperties, ReactNode } from 'react';

/**
 * The contract between the player picker and its two twins.
 *
 * The page builds one bag and hands each twin its own `groups`, so the shared
 * interface carries everything else and each extension carries the chrome that
 * twin draws.
 */

export interface PickerPlayer {
  id: string;
  name: string;
  meta?: string;
  initials?: string;
  [key: string]: unknown;
}

export interface PickerGroup {
  [key: string]: unknown;
}

export interface PickerChip {
  label: string;
  on?: boolean;
  pick?: () => void;
  [key: string]: unknown;
}

/** [name, points, scoring note] for the market being answered. */
export type PickerMarket = readonly [string, string, string];

export interface PlayerPickerSharedProps {
  theme: 'light' | 'dark';
  MARKET: PickerMarket;
  CLUB: Record<string, string>;
  searching: boolean;
  termIcon: ReactNode;
  /** [icon, colour, title, body, action label] for the empty/stale state. */
  TERM: readonly [string, string, string, string, string];
  isTerminal: boolean;
  isReady: boolean;
  isLoading: boolean;
  chips: PickerChip[];
  groups: PickerGroup[];
  pickedPlayer: PickerPlayer | null;
  onRetry: () => void;
  searchIcon: ReactNode;
  backHref: string;
  searchQuery: string;
  onSearchChange: (next: string) => void;
  primaryLabel: string;
  primaryStyle: CSSProperties;
  /** Undefined until a player is picked, which is what disables the button. */
  primaryAction: (() => void) | undefined;
}

export interface PlayerPickerMobileProps extends PlayerPickerSharedProps {
  homeCode: string;
  awayCode: string;
  homeName: string;
  awayName: string;
}

export interface PlayerPickerDesktopProps extends PlayerPickerSharedProps {
  contextTabs: Array<{ label: string; style: CSSProperties }>;
  rootNav: Array<{ label: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  ghostRows: Array<{ label: string; value: string }>;
  sheetTitle: string;
  sheetSub: string;
  modalWidth: string;
  columnTemplate: string;
  sideChips: PickerChip[];
  posChips: PickerChip[];
  skeletonCols: Array<{ rows: Array<{ w: string }> }>;
  storedStyle: CSSProperties;
  storedDotStyle: CSSProperties;
  /** Confirms the stored pick, or names why a save failed. */
  storedLabel: string;
  cancelStyle: CSSProperties;
  footNote: string;
  leagueName: string;
  competitionLabel: string;
}
