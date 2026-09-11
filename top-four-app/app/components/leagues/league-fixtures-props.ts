import type { CSSProperties } from 'react';

/**
 * The contract between the league fixtures page and its two twins.
 *
 * The screen shows either upcoming fixtures or settled results, and `results`
 * flips several labels and the desktop grid between the two. Mobile groups by
 * date and carries its own tab bar; desktop draws a table with its own column
 * headings.
 */

export interface FixtureListRow {
  [key: string]: unknown;
}

export interface FixtureListGroup {
  label?: string;
  rows?: FixtureListRow[];
  [key: string]: unknown;
}

export interface FixturesSegment {
  label: string;
  count: string;
  pick: () => void;
  style: string | CSSProperties;
  countStyle: string | CSSProperties;
}

export interface FixturesFilter {
  label: string;
  on?: boolean;
  pick?: () => void;
  [key: string]: unknown;
}

export interface LeagueFixturesSharedProps {
  theme: 'light' | 'dark';
  params: { id: string };
  headSub: string;
  isLoading: boolean;
  isEmpty: boolean;
  showList: boolean;
  emptyTitle: string;
  emptyBody: string;
  loadMore: string;
  showLoadMore: boolean;
  loadMoreAction: () => void;
  footNote: string;
  segments: FixturesSegment[];
  filters: FixturesFilter[];
  groups: FixtureListGroup[];
}

export interface LeagueFixturesMobileProps extends LeagueFixturesSharedProps {
  st: string;
  /** True when the screen is showing settled results rather than upcoming. */
  results: boolean;
}

export interface LeagueFixturesDesktopProps extends LeagueFixturesSharedProps {
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  avatarInitials: string;
  avatarName: string;
  showContext: boolean;
  contextTabs: Array<{ label: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  showFilters: boolean;
  skeletons: Array<{ w: string }>;
  chipSkeletons: Array<{ w: string }>;
  skeletonRowStyle: CSSProperties;
  headRowStyle: CSSProperties;
  footNoteStyle: CSSProperties;
  /** Column headings, which differ between the fixtures and results views. */
  colMid: string;
  colNote: string;
  colRight: string;
  leagueName: string | undefined;
  memberCount: number | undefined;
}
