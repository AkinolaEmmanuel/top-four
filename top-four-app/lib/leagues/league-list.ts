import type { LeagueListItem } from '@/lib/api/leagues';
import { ordinal, pluralise } from '@/lib/format';

/**
 * Turns the leagues list into the shape the screen draws, with no presentation
 * in it — no class names, no colours chosen by the caller. The screen decides
 * how a draft league or an archived one should look; this decides only which
 * it is.
 *
 * It replaces a prop-bag factory with two defects: it labelled the member's
 * *position* as "pts", and it used a non-empty action label ("Manage"/"Leave")
 * as a boolean flag, so every row took a branch meant for a special case.
 */

export type LeagueSectionKey = 'playing' | 'draft' | 'past';

export interface LeagueListEntry {
  id: string;
  name: string;
  /** Two letters, the product's stand-in for a league crest. */
  crest: string;
  /** The competitions this league runs, already joined for one line. */
  competitions: string;
  /** Present only for an owner or admin. */
  roleLabel: string | null;
  section: LeagueSectionKey;
  /** Null until the member has a standing in this league. */
  position: number | null;
  points: number | null;
  /** An archived or cancelled league is still readable, drawn quieter. */
  isPast: boolean;
  memberCount: number;
}

export interface LeagueSection {
  key: LeagueSectionKey;
  label: string;
  entries: LeagueListEntry[];
}

const SECTION_LABELS: Record<LeagueSectionKey, string> = {
  playing: 'Playing',
  draft: 'Draft',
  past: 'Past',
};

/*
 * There is deliberately no "Waiting on approval" section. The screen used to
 * have one, populated by `membership.state === 'pending'` behind an `as any` —
 * but a membership is only ever 'active' or 'former', so the branch could never
 * run. A pending request is not a membership, and every join-request endpoint is
 * scoped to a league id the requester does not have yet. Listing them needs a
 * `GET /me/join-requests`; until that exists the section would be permanent
 * scaffolding, so it is gone rather than dead.
 */

/** Leagues still running count against the twenty-league limit; finished ones do not. */
const RUNNING: ReadonlySet<string> = new Set(['draft', 'published', 'in_progress']);

function sectionFor(league: LeagueListItem): LeagueSectionKey {
  if (league.lifecycleState === 'draft') return 'draft';
  if (league.lifecycleState === 'archived' || league.lifecycleState === 'cancelled') return 'past';
  return 'playing';
}

export function toLeagueEntry(league: LeagueListItem): LeagueListEntry {
  const section = sectionFor(league);
  const role = league.membership?.role;
  return {
    id: league.id,
    name: league.name,
    crest: league.name.substring(0, 2).toUpperCase(),
    competitions: league.competitions.map(c => c.displayName).join(', '),
    roleLabel: role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : null,
    section,
    position: league.ownStanding?.position ?? null,
    points: league.ownStanding?.totalPoints ?? null,
    isPast: section === 'past',
    memberCount: league.memberCount,
  };
}

/** Sections in the order the screen shows them, empty ones dropped. */
export function toLeagueSections(leagues: LeagueListItem[]): LeagueSection[] {
  const order: LeagueSectionKey[] = ['playing', 'draft', 'past'];
  const entries = leagues.map(toLeagueEntry);
  return order
    .map(key => ({ key, label: SECTION_LABELS[key], entries: entries.filter(e => e.section === key) }))
    .filter(section => section.entries.length > 0);
}

export function runningLeagueCount(leagues: LeagueListItem[]): number {
  return leagues.filter(l => RUNNING.has(l.lifecycleState)).length;
}

export function capacityLabel(used: number, limit: number): string {
  if (used >= limit) return `${limit} of ${limit} places used`;
  if (used === 0) return 'No leagues joined';
  return `${used} of ${limit} places used`;
}

/** The member's standing, or null when they have none yet. */
export function standingLabel(entry: LeagueListEntry): string | null {
  if (entry.position === null) return null;
  return ordinal(entry.position);
}

export function pointsLabel(entry: LeagueListEntry): string | null {
  if (entry.points === null) return null;
  return pluralise(entry.points, 'pt');
}
