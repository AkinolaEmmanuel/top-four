import type { CSSProperties, RefObject } from 'react';
import type { StandingCompetitionPoints } from '@/lib/api/points';

/**
 * The contract between the league table page and its two twins.
 *
 * The twins diverge more here than anywhere else — mobile paginates and expands
 * a member's breakdown in place, desktop draws a wide column per competition —
 * so each gets its own interface over a small shared core.
 */

export type TableState = 'loading' | 'empty' | 'final' | 'live';

export interface TableBreakdownRow {
  label: string;
  value: string;
  rowStyle: string;
  rowColor?: CSSProperties;
  labelStyle: string;
  labelColor: CSSProperties;
  valueStyle: string;
  valueColor: CSSProperties;
  total: boolean;
}

export interface TableRowMobile {
  ref: RefObject<HTMLDivElement> | null;
  pos: number;
  name: string;
  initials: string;
  points: string;
  posStyle: string;
  tieStyle: string;
  avatarStyle: string;
  avatarBg: string;
  nameStyle: string;
  roleDot: string;
  sub: string;
  subStyle: string;
  pointsStyle: string;
  caretStyle: string;
  wrapStyle: string;
  open: boolean;
  breakLabel: string;
  breakdown: TableBreakdownRow[];
  toggle: () => void;
}

export interface TableRowDesktop {
  ref: RefObject<HTMLDivElement> | null;
  pos: number;
  name: string;
  initials: string;
  points: string;
  cells: Array<{ value: string; style: CSSProperties }>;
  tieStyle: CSSProperties;
  avatarStyle: CSSProperties;
  roleDotStyle: CSSProperties;
  caption: string;
  captionStyle: CSSProperties;
  caretStyle: CSSProperties;
  wrapStyle: CSSProperties;
  open: boolean;
  roleLine: string;
  note: string;
  barStyle: CSSProperties;
  toggle: () => void;
}

export interface Tiebreaker {
  n: string;
  label: string;
  style?: CSSProperties;
}

export interface LeagueTableSharedProps {
  theme: 'light' | 'dark';
  params: { id: string };
  st: TableState;
  isLoading: boolean;
  isEmpty: boolean;
  isFinal: boolean;
  showRows: boolean;
  hasStanding: boolean;
  refreshing: boolean;
  listRef: RefObject<HTMLDivElement>;
  jumpToMe: () => void;
  prevPage: () => void;
  nextPage: () => void;
  myPos: string;
  myPosLabel: string;
  myName: string;
  myInitials: string;
  leagueName: string | undefined;
  totalMembers: number;
  winnerName: string;
  winnerLine: string;
  tiebreakers: Tiebreaker[];
}

export interface LeagueTableMobileProps extends LeagueTableSharedProps {
  prevStyle: string;
  nextStyle: string;
  headSub: string;
  myGap: string;
  myPoints: string;
  rows: TableRowMobile[];
  TINTS: string[];
  /** Builds a member's points breakdown; `accent` flips it for the dark self-card. */
  breakdown: (
    competitionPoints: StandingCompetitionPoints[],
    customQuestionPoints: number,
    totalPoints: number,
    accent: boolean,
  ) => TableBreakdownRow[];
  selfBreakdown: TableBreakdownRow[];
  page: number;
  PAGES: number[][];
  range: number[];
  selfOpen: boolean;
  setSelfOpen: (next: boolean) => void;
  setRefreshing: (next: boolean) => void;
}

export interface LeagueTableDesktopProps extends LeagueTableSharedProps {
  prevStyle: CSSProperties;
  nextStyle: CSSProperties;
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  contextTabs: Array<{ label: string; style: CSSProperties }>;
  heroStyle: CSSProperties;
  myPoints: string;
  neighbours: Array<{ delta: string; deltaStyle: CSSProperties; text: string }>;
  pageLabel: string;
  refresh: () => void;
  nudge: () => void;
  isReady: boolean;
  cols: Array<{ label: string; style: CSSProperties }>;
  legend: Array<{ label: string; dotStyle: CSSProperties }>;
  skeletons: Array<{ nameStyle: CSSProperties; cells: CSSProperties[] }>;
  rows: TableRowDesktop[];
  showTies: boolean;
  selfPos: string;
  selfMove: string;
  selfPoints: string;
  selfCells: Array<{ value: string; style: CSSProperties }>;
  prevLabel: string;
  nextLabel: string;
  memberCount: number | undefined;
}
