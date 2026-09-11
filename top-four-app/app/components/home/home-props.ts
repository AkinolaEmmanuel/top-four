import type { CSSProperties } from 'react';
import type { UserProfile } from '@/lib/api/auth';

/**
 * The contract between the home page and its two twins.
 *
 * Both twins take the same bag and read it as `props.x` after pulling `state`
 * and `theme` out, so one interface covers both — and because they use the rest
 * object rather than destructuring, typing it also checks every `props.x` read
 * inside them, not just what the page sends.
 */

export type HomeState = 'loading' | 'newuser' | 'caughtup' | 'live';

/** One waiting task in the queue below the hero. */
export interface HomeQueueItem {
  match: string;
  competition: string;
  meta: string;
  time: string;
  missing: string;
  homeCode: string;
  homeColor: string;
  homeLogo: string | null;
  awayCode: string;
  awayColor: string;
  awayLogo: string | null;
  href: string;
}

/** One of the member's leagues, as the home list draws it. */
export interface HomeLeagueRow {
  id: string;
  crest: string;
  crestBg: string;
  name: string;
  meta: string;
  position: string;
  points: string;
}

export interface HomeProps {
  state: HomeState;
  theme: 'light' | 'dark';
  user: UserProfile | null;
  unreadCount: number;

  headSub: string;
  headRight: string;

  heroStyle: CSSProperties;
  heroDotStyle: CSSProperties;
  heroKicker: string;
  heroToneColor: string;
  heroLeague: string;
  heroClock: string;
  heroClockSub: string;
  heroClockColor: string;
  heroBarStyle: CSSProperties;
  heroProgress: string;
  heroCta: string;
  heroCtaStyle: CSSProperties;

  homeCode: string;
  homeName: string;
  homeColor: string;
  homeLogo: string | null;
  awayCode: string;
  awayName: string;
  awayColor: string;
  awayLogo: string | null;
  kickoff: string;

  queueKicker: string;
  queueLink: string;
  queue: HomeQueueItem[];
  queueClear: boolean;

  /**
   * The weekend summary card. It is still a placeholder: the points and rows
   * have no source yet, so the card is hidden unless the member has leagues and
   * shows a dash rather than an invented total.
   */
  weekendStyle: CSSProperties;
  weekendBadge: string;
  weekendPoints: string;
  weekendRows: Array<Record<string, unknown>>;

  leagues: HomeLeagueRow[];
  leagueCount: string;
}
