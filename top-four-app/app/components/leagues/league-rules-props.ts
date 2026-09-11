import type { CSSProperties, ReactElement } from 'react';

/**
 * The contract between the league rules page and its two twins.
 *
 * The rules freeze at publication, so nearly everything here is read-only text
 * derived from the league's frozen ruleset. Mobile collapses it into sections;
 * desktop lays the same facts out as separate tables.
 */

/** A frozen fact: a label, its value, and an optional explanatory line. */
export interface RuleLine {
  [key: string]: unknown;
}

export interface RuleSection {
  label: string;
  lines: RuleLine[];
  [key: string]: unknown;
}

export interface LeagueRulesSharedProps {
  theme: 'light' | 'dark';
  params: { id: string };
  isLoading: boolean;
  isTerminal: boolean;
  isReady: boolean;
  showMaxPoints: boolean;
  showDanger: boolean;
  frozenText: string;
  footNote: string;
  maxPoints: string;
  maxNote: string;
  dangerLines: RuleLine[];
  retry: () => void;
}

export interface LeagueRulesMobileProps extends LeagueRulesSharedProps {
  isRules: boolean;
  isOwner: boolean;
  /** The screen's data phase, used to pick which block is drawn. */
  ds: 'error' | 'loading' | 'live';
  dataState: string;
  IconMap: Record<string, (size?: number) => ReactElement>;
  /** [icon, colour, title, body, action label] for the terminal state. */
  TERM: string[];
  headTitle: string;
  headSub: string;
  sections: RuleSection[];
  leagueName: string | undefined;
}

export interface LeagueRulesDesktopProps extends LeagueRulesSharedProps {
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  avatarInitials: string;
  avatarName: string;
  showContext: boolean;
  roleLine: string;
  contextTabs: Array<{ label: string; style: CSSProperties }>;
  skeletons: Array<{ w: string }>;
  termIcon: ReactElement;
  termIconColor: string;
  termTitle: string;
  termBody: string;
  termAction: string;
  termActionStyle: CSSProperties;
  heroStyle: CSSProperties;
  showFrozenBanner: boolean;
  lockIcon: ReactElement;
  markets: RuleLine[];
  tiebreakers: RuleLine[];
  comps: Array<{ abbr: string; name: string; scope: string; abbrStyle: CSSProperties }>;
  deadlines: RuleLine[];
  showEditable: boolean;
  editable: RuleLine[];
  showLeave: boolean;
  leagueName: string | undefined;
}
