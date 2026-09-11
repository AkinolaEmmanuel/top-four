import type { CSSProperties } from 'react';

/**
 * The contract between the league "More" page and its two twins.
 *
 * As elsewhere in this app the twins take different bags — mobile groups the
 * links by section and carries its own tab bar, desktop draws the shared nav
 * chrome — so each gets its own interface over a small shared core.
 */

/**
 * One row in a section. The style fields are strings on mobile (Tailwind
 * classes) and objects on desktop (inline styles), which is the twin split
 * this whole app is built on.
 */
export interface MoreLink {
  title: string;
  note: string;
  glyph: string;
  badge: string;
  href: string | null;
  onClick: (() => void) | undefined;
  titleColor: string;
  iconStyle: string | CSSProperties;
  badgeStyle: string | CSSProperties;
  rowStyle: string | CSSProperties;
}

export interface MoreGroup {
  label: string;
  labelColor?: string;
  rows: MoreLink[];
}

export interface LeagueMoreSharedProps {
  theme: 'light' | 'dark';
  params: { id: string };
  leagueName: string | undefined;
  roleLabel: string;
  lifecycleLabel: string;
  footNote: string;
}

export interface LeagueMoreMobileProps extends LeagueMoreSharedProps {
  owner: boolean;
  admin: boolean;
  /** Whether the league is currently running, and whether it has finished. */
  runs: boolean;
  done: boolean;
  groups: MoreGroup[];
}

export interface LeagueMoreDesktopProps extends LeagueMoreSharedProps {
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  avatarInitials: string;
  avatarName: string;
  showContext: boolean;
  contextTabs: Array<{ label: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  headSub: string;
  roleChipStyle: CSSProperties;
  lifecycleStyle: CSSProperties;
  mainGroups: MoreGroup[];
  endLabel: string;
  endRows: MoreLink[];
  memberCount: number | undefined;
}
