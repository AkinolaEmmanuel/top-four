import type { CSSProperties, ReactElement } from 'react';
import type { UserProfile } from '@/lib/api/auth';

/**
 * The contract between the account page and its two twins.
 *
 * This page passes its props explicitly in JSX rather than spreading one bag,
 * so the two lists are genuinely different and each twin gets its own
 * interface over a shared core.
 */

export interface MePreferences {
  reminders: boolean;
  questions: boolean;
}

/** A bar in the points-per-round chart. Desktop also prints the value. */
export interface MeChartBarMobile {
  label: string;
  corrected: boolean;
  barStyle: string;
  height: number;
}

export interface MeChartBarDesktop {
  label: string;
  corrected: boolean;
  value: string;
  barStyle: string;
  barHeight: number;
}

export interface MeLeagueRow {
  crest: string;
  bg: string;
  name: string;
  meta: string;
  points: string;
  isLast: boolean;
}

export interface MeAccountRow {
  title: string;
  note: string;
  badge: string;
  titleColor: string;
  href?: string;
}

export interface MeSharedProps {
  theme: 'light' | 'dark';
  isLoading: boolean;
  user: UserProfile | null;
  prefs: MePreferences;
  /** Accepts a partial patch or an updater, like a React setter. */
  setPrefs: (update: Partial<MePreferences> | ((current: MePreferences) => MePreferences)) => void;
  leagues: MeLeagueRow[];
  totalPoints: number;
  leagueCount: number;
  signOut: () => void;
}

export interface MeMobileProps extends MeSharedProps {
  chart: MeChartBarMobile[];
  groups: Array<{ label: string; labelColor: string; rows: Array<Record<string, unknown>> }>;
  IconMap: Record<string, () => ReactElement>;
  tabs: Array<{ label: string; ic: string; on: boolean }>;
}

export interface MeDesktopProps extends MeSharedProps {
  chart: MeChartBarDesktop[];
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  accountRows: MeAccountRow[];
  emailPrefs: Array<Record<string, unknown>>;
  /** True only when the server says the address is not yet verified. */
  emailUnverified: boolean;
  noGoogle: boolean;
}
