import type { CSSProperties } from 'react';

/**
 * The contract between the league admin page and its two twins.
 *
 * Unlike the fixture screen, the page builds one shared bag and gives the
 * desktop twin extra chrome on top, so the shape is split the same way. Both
 * sides were `any`, which is how `hasMoreMembers` came to be read by the twin
 * and passed by nobody — leaving the "LOAD 25 MORE" row permanently hidden.
 */

export interface AdminMemberRow {
  name: string;
  initials: string;
  you: boolean;
  left: boolean;
  role: string;
  points: string;
  rank: string;
  meta: string;
  rowStyle: string;
  nameStyle: string;
  avatarStyle: string;
  dotStyle: string;
  dotColor: string;
  youStyle: string;
  open: () => void;
}

export interface AdminFilterChip {
  label: string;
  style: string;
  pick: () => void;
}

/** Invite and request rows carry presentational fields that differ per twin. */
export interface AdminInviteRow {
  [key: string]: unknown;
}

export interface AdminRequestRow {
  [key: string]: unknown;
}

export interface AdminLifecycleStep {
  label: string;
  note: string;
  done: boolean;
  current: boolean;
  future: boolean;
  dotStyle: string;
  lineStyle: string;
  textWrapStyle: string;
  labelStyle: string;
}

export interface AdminAction {
  title: string;
  note: string;
  rowStyle: string;
  titleStyle: string;
  arrowStyle: string;
  open: () => void;
}

export interface AdminRoleOption {
  label: string;
  note: string;
  rowStyle: string;
  radioStyle: string;
  dotStyle: string;
  pick: () => void;
}

/**
 * One bottom sheet. Which fields are present depends on which sheet is open,
 * so everything past the title is optional — the twins already guard each one.
 */
export interface AdminSheetSpec {
  title: string;
  body: string;
  roles?: boolean;
  list?: string[];
  danger?: boolean;
  primary?: string;
  primaryAction?: () => void;
  secondary?: string;
  secondaryAction?: () => void;
  tertiary?: string;
  tertiaryAction?: () => void;
}

export interface LeagueAdminSharedProps {
  theme: 'light' | 'dark';
  tab: 'members' | 'invites' | 'requests' | 'lifecycle';
  setTab: (next: 'members' | 'invites' | 'requests' | 'lifecycle') => void;
  setSheet: (next: string | null) => void;
  setWho: (next: string) => void;
  setRole: (next: string) => void;

  headSub: string;
  /** [big, label, sub, tone] for the hero block. */
  HERO: string[];
  loading: boolean;
  onMembers: boolean;
  onInvites: boolean;
  onRequests: boolean;
  onLifecycle: boolean;

  members: AdminMemberRow[];
  memberFilters: AdminFilterChip[];
  invites: AdminInviteRow[];
  requests: AdminRequestRow[];
  lifecycle: AdminLifecycleStep[];
  actions: AdminAction[];

  fresh: boolean;
  setFresh: (next: boolean) => void;
  empty: boolean;
  invitesOpen: boolean;
  setInvitesOpen: (next: boolean) => void;

  sheetSpec: AdminSheetSpec | null;
  roles: AdminRoleOption[];
  toast: string | null;

  leagueName: string;
  leagueAbbr: string;
  memberCount: number;
  inviteCount: number;
  pendingCount: number;
  /** Gates the "LOAD 25 MORE" row — false when there is no further page. */
  hasMoreMembers: boolean;
  heroRole: string;

  inviteCode: string | null;
  createInviteAction: () => void;
  copyInviteAction: () => void;
  exportMembersAction: () => void;
}

export interface LeagueAdminMobileProps extends LeagueAdminSharedProps {
  params: { id: string };
}

export interface LeagueAdminDesktopProps extends LeagueAdminSharedProps {
  params: { id: string };
  rootNav: Array<{ label: string; id: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  avatarInitials: string;
  avatarName: string;
  contextTabs: Array<{ label: string; badge: string; badgeStyle: CSSProperties; style: CSSProperties }>;
  heroStyle: CSSProperties;
  heroBig: string;
  heroTone: string;
  heroLabel: string;
  heroSub: string;
}
