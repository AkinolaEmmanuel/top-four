import type { CSSProperties, ReactElement } from 'react';

/**
 * The contract between the league overview page and its two twins.
 *
 * The two diverge sharply: mobile draws the hero, rivalry and last result as
 * stacked sections with Tailwind classes, desktop as a wide grid with inline
 * styles. Only the facts are shared, so the common interface is small.
 */

export type LeagueOverviewState = 'urgent' | 'caughtup' | 'live';

/**
 * A rivalry row, already styled. The `you` flag is consumed while building
 * these, so it is not carried through; the remaining fields differ per twin
 * (mobile carries a tint, desktop a delta), hence the open tail.
 */
export interface RivalRow {
  pos: string;
  name: string;
  initials: string;
  points: string;
  [key: string]: unknown;
}

export interface BreakdownChip {
  label: string;
  style: string | CSSProperties;
}

/**
 * The last settled fixture. `hasResult` is false when the league has none, and
 * it gates the whole block — without it the screen drew an invented scoreline.
 */
export interface LeagueOverviewResult {
  hasResult: boolean;
  kicker: string;
  badge: string;
  pts: string;
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  score: string;
  summary: string;
  breakdown: Array<[string, string, boolean]>;
}

export interface LeagueOverviewSharedProps {
  theme: 'light' | 'dark';
  params: { id: string };
  isLoading: boolean;
  isTerminal: boolean;
  isReady: boolean;
  leagueName: string | undefined;
  memberCount: number | null | undefined;
  heroCtaHref: string;
  homeCode: string;
  homeName: string;
  homeColor: string;
  awayCode: string;
  awayName: string;
  awayColor: string;
  kickoff: string;
  rivalKicker: string;
  gapNumber: string;
  gapLabel: string;
  gapNote: string;
}

export interface LeagueOverviewMobileProps extends LeagueOverviewSharedProps {
  CLUB: Record<string, string>;
  st: LeagueOverviewState;
  urgent: boolean;
  caught: boolean;
  heroTone: string;
  /** [kicker, clock, clock caption, progress, cta, footnote] for the phase. */
  heroData: string[];
  pct: number;
  rivals: RivalRow[];
  RESULT: LeagueOverviewResult;
  nailed: boolean;
  rBreakdown: BreakdownChip[];
  /** The unanswered-markets badge, capped for width. Empty when there are none. */
  unanswered: string;
  IconMap: Record<string, () => ReactElement>;
  tabs: Array<{ label: string; ic: string; on: boolean }>;
  heroBg: string;
  resultBg: string;
  lifecycleLabel: string | undefined;
}

export interface LeagueOverviewDesktopProps extends LeagueOverviewSharedProps {
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  contextTabs: Array<Record<string, unknown>>;
  heroStyle: CSSProperties;
  heroDotStyle: CSSProperties;
  heroKicker: string;
  heroKickerColor: string;
  heroClock: string;
  heroClockSub: string;
  heroClockColor: string;
  heroBarStyle: CSSProperties;
  heroProgress: string;
  heroCtaStyle: CSSProperties;
  heroCta: string;
  heroFoot: string;
  rivals: RivalRow[];
  gapColor: string;
  resultStyle: CSSProperties;
  resultKicker: string;
  resultKickerColor: string;
  resultBadgeStyle: CSSProperties;
  resultBadge: string;
  rHomeCode: string;
  rHomeColor: string;
  rAwayCode: string;
  rAwayColor: string;
  rScore: string;
  rPointsStyle: CSSProperties;
  rPoints: string;
  rPointsSub: string;
  rSummary: string;
  rBreakdown: BreakdownChip[];
  qTitle: string;
  qSub: string;
  skeletonRows: Array<{ w: string }>;
}
