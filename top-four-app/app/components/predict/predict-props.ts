import type { CSSProperties, ReactNode } from 'react';

/**
 * The contract between the predict to-do page and its two twins.
 *
 * Both twins take the same bag and read it as `props.x` after pulling `state`
 * and `theme` out, so one interface covers both — and typing the rest object
 * also checks every `props.x` read inside them.
 */

export type PredictState = 'loading' | 'error' | 'noLeagues' | 'empty' | 'live';

/** One task waiting on the member, in either twin's list. */
export interface PredictTaskRow {
  [key: string]: unknown;
}

export interface PredictGroup {
  [key: string]: unknown;
}

export interface PredictProps {
  state: PredictState;
  theme: 'light' | 'dark';
  setState: (next: PredictState) => void;

  // The mobile summary.
  total: string;
  totalColor: string;
  totalLabel: string;
  totalSub: string;
  groups: PredictGroup[];

  // The desktop hero and table.
  headTitle: string;
  headSub: string;
  heroStyle: CSSProperties;
  heroDotStyle: CSSProperties;
  heroTone: string;
  heroKicker: string;
  heroNum: string;
  heroSub: string;
  heroCtaStyle: CSSProperties;
  heroCtaHref: string;
  /** Names the task the hero's call to action will open. */
  urgentText: string;
  urgentSub: string;
  todoSub: string;
  desktopGroups: PredictGroup[];
  leagueFilters: Array<Record<string, unknown>>;
  skeletons: Array<{ w: string }>;

  // The terminal states: empty, error, or no leagues yet.
  termIcon: ReactNode;
  termIconColor: string;
  termTitle: string;
  termBody: string;
  termAction: string;
  termActionStyle: CSSProperties;
  retry: () => void;
}
