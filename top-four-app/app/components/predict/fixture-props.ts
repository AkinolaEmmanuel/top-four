import type { CSSProperties } from 'react';

/**
 * The contract between the fixture page and its two twins.
 *
 * Both twins receive the same object, each destructuring the part it draws, so
 * one interface covers both. It exists because these were `any` on both sides:
 * the page could rename a field and the twin would silently read `undefined` —
 * which is how the mobile tiles stopped rendering (`showTiles` vs
 * `showChoices`) and how the copy button came to call nothing at all.
 */

/** A market row. Styles arrive pre-computed because the twins differ in kind. */
export interface FixtureMarketRow {
  key: string;
  name: string;
  pts: string;
  kind: 'tiles' | 'score' | 'players' | 'lineup';
  right: string;
  rightStyle: string;
  rightColor?: string;
  ptsStyle: string;
  blockStyle: string;
  cardStyle: string;
  historyLink: string;
  historyStyle: string;
  historyLinkStyle: string;
  toggleHistory: () => void;
  showHistory: boolean;
  histories: Array<{ value: string; when: string; dotStyle: string; valueStyle: string }>;
  history: Array<{ value: string; when: string; dotStyle: CSSProperties; valueStyle: CSSProperties }>;
  savedStyle: string;
  failureMessage: string;
  failureStyle: string;
  footStyle: string;
  /** Whether the answer tiles are drawn; false once the market is locked. */
  showChoices: boolean;
  tiles?: Array<{ label: string; sub: string; subStyle: string; style: string; styleDesktop?: CSSProperties; pick: () => void }>;
  answer?: string;
  answerStyle?: string;
  chip?: string;
  chipStyle?: string;
  outcomeWrapStyle?: string;
  lockLine?: string;
  historyNote?: string;
  players?: unknown[];
  search?: string;
  searchStyle?: string;
  searchLabel?: string;
  /** Absent when the market is closed, which is what hides the link. */
  searchHref?: string;
  side?: 'home' | 'away';
}

export interface FixtureLineupRow {
  code: string;
  color: string;
  name: string;
  sub: string;
  crest: string;
  points: string;
  subStyle: string;
  right: string;
  rightStyle: string;
  rightColor?: string;
  rowStyle: string;
  answer: string;
  answerStyle: string;
  chip: string;
  chipStyle: string;
  pick: () => void;
}

export interface FixtureCopyTarget {
  league: string;
  note: string;
  cardStyle: string;
  boxStyle: string;
  check: string;
  hasFlag: boolean;
  flag: string;
  flagStyle: string;
  toggle: () => void;
}

export interface FixtureCopyOutcome {
  league: string;
  note: string;
  icon: string;
  rowStyle: string;
  iconStyle: string;
}

export interface FixtureProps {
  theme: 'light' | 'dark';
  isLoading: boolean;
  isReady: boolean;
  settled: boolean;
  locked: boolean;
  urgent: boolean;
  clock: string;
  /** [kicker, clock caption, explanatory line] for the current phase. */
  HERO: string[];
  heroTone: string;

  answeredTotal: number;
  totalSlots: number;
  pct: number;
  a: Record<string, unknown>;
  setAnswers: (next: Record<string, unknown>) => void;
  markets: FixtureMarketRow[];
  lineups: FixtureLineupRow[];

  carryLabels: Array<string | null>;
  copy: 'idle' | 'done' | null;
  setCopy: (next: 'idle' | 'done' | null) => void;
  targets: FixtureCopyTarget[];
  carrying: Array<{ label: string; style: string }>;
  chosen: number;
  outcomes: FixtureCopyOutcome[];
  /** Performs the copy. The twins must call this, not jump straight to 'done'. */
  onCopyExecute: () => void;
  canCopy: boolean;
  copySub: string;
  copyExplainer: string;
  copyPrimary: string;
  copyPrimaryStyle: string;

  CLUB: Record<string, string>;
  leagueName: string;
  competitionLabel: string;
  fixtureId: string;
  leagueId: string;

  hName: string;
  aName: string;
  hCode: string;
  aCode: string;
  hLogo: string | null;
  aLogo: string | null;

  kickoffLabel: string;
  lineupDeadlineLabel: string;
  stakeLabel: string;

  // Drawn by the desktop twin only.
  contextTabs: Array<{ label: string; style: CSSProperties }>;
  heroStyle: CSSProperties;
  homeColor: string;
  awayColor: string;
  heroKicker: string;
  heroDotStyle: CSSProperties;
  scoreline: string;
  scoreSize: string;
  kickoffLine: string;
  bannerLabel: string;
  bannerText: string;
  bannerRight: string;
  marketsDone: string;
  lineupsDone: string;
  pointsLabel: string;
  pointsValue: string;
  pointsHeroColor: string;
  marketsHint: string;
  footNote: string;
}
