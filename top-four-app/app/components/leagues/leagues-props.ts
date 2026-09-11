import type { CSSProperties, ReactElement } from 'react';
import type { UserProfile } from '@/lib/api/auth';

/**
 * The contract between the leagues list page and its two twins.
 *
 * This screen is the one place the two share nearly everything: the page builds
 * a single bag and hands each twin only its own chrome, so the shared interface
 * carries the real content and each extension carries one or two props.
 */

export type LeaguesState = 'live' | 'capacity' | 'loading' | 'empty';

export interface LeagueListRow {
  id: string;
  crest: string;
  crestBg: string;
  name: string;
  /** The competitions this league covers, already joined into one line. */
  meta: string;
  role: string;
  value: string;
  sub: string;
  action: boolean | undefined;
  muted: boolean | undefined;
  isLast: boolean;
}

export interface LeagueListGroup {
  label: string;
  count: string;
  rows: LeagueListRow[];
}

export interface LeaguesFilter {
  label: string;
  count: string;
  on: boolean;
  pick: () => void;
}

export interface LeaguesSharedProps {
  user: UserProfile | null;
  theme: 'light' | 'dark';
  state: LeaguesState;
  filter: string;
  filters: LeaguesFilter[];
  groups: LeagueListGroup[];
  isLoading: boolean;
  isEmpty: boolean;
  isReady: boolean;
  /** True at the twenty-league limit, which closes the "create" routes. */
  atCapacity: boolean;
  capacityLabel: string;
  skeletons: Array<{ w: string }>;
}

export interface LeaguesMobileProps extends LeaguesSharedProps {
  IconMap: Record<string, () => ReactElement>;
  tabs: Array<{ label: string; ic: string; on: boolean; badge: string }>;
}

export interface LeaguesDesktopProps extends LeaguesSharedProps {
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
}
