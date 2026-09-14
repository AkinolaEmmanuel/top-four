/**
 * How a league's lifecycle state reads in the chrome.
 *
 * The design badges only three of the six — the rest of the vocabulary exists
 * for the backend's own future and has no distinct treatment yet, so it falls
 * through to the neutral pill rather than inventing one.
 */
export interface LifecycleBadge {
  label: string;
  surface: string;
  text: string;
}

const BADGES: Record<string, LifecycleBadge> = {
  draft: { label: 'Draft', surface: 'var(--warn-surface)', text: 'var(--warn-text)' },
  published: { label: 'Published', surface: 'var(--accent-surface)', text: 'var(--accent-text)' },
  in_progress: { label: 'In progress', surface: 'var(--accent-surface)', text: 'var(--accent-text)' },
  completed: { label: 'Completed', surface: 'var(--success-surface)', text: 'var(--success-text)' },
  archived: { label: 'Archived', surface: 'var(--surface-subtle)', text: 'var(--text-muted)' },
  cancelled: { label: 'Cancelled', surface: 'var(--danger-surface)', text: 'var(--danger-text)' },
};

export function lifecycleBadge(state: string): LifecycleBadge {
  return BADGES[state] ?? {
    label: state.replace(/_/g, ' '),
    surface: 'var(--surface-subtle)',
    text: 'var(--text-muted)',
  };
}

/**
 * The two letters on a league's crest tile.
 *
 * The one rule, used everywhere a league is drawn — the chrome, the list, Home,
 * Me and a pending request. Initials beat the first two characters: "Kolade &
 * Friends League" is KF, not KO, and a member should not meet both.
 */
export function leagueInitials(name: string): string {
  const words = name.split(/\s+/).filter(w => /[a-z0-9]/i.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '··';
}
