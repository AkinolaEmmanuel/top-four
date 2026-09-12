import { pluralise } from '@/lib/format';

/**
 * The "More" menu's entries, decided once on the server.
 *
 * What a member sees here depends on what they can do — an owner gets the
 * ending actions, an admin gets the running-it group, a participant gets
 * neither. That decision belongs here rather than in the markup, which is where
 * both twins used to make it separately.
 */

export type LeagueRole = 'owner' | 'admin' | 'participant';

export interface MoreEntry {
  /** A figure where there is one to give; the glyph is the fallback. */
  glyph: string;
  title: string;
  note: string;
  badge: string;
  /** `danger` is destructive, `quiet` is available but not encouraged. */
  tone: 'normal' | 'danger' | 'quiet' | 'live';
  href: string | null;
  /** Set instead of `href` for the one action that runs in the browser. */
  action: 'leave' | null;
}

export interface MoreSection {
  label: string;
  tone: 'normal' | 'danger';
  entries: MoreEntry[];
}

export function toMoreSections({
  leagueId, role, isComplete, memberCount, openQuestions, pendingRequests,
  questionCount = 0, marketCount = 0,
}: {
  leagueId: string;
  role: LeagueRole;
  isComplete: boolean;
  memberCount: number;
  openQuestions: number;
  pendingRequests: number;
  /** Every question written, not only the open ones. */
  questionCount?: number;
  /** Enabled markets, which is what the rules screen is mostly about. */
  marketCount?: number;
}): MoreSection[] {
  const owner = role === 'owner';
  const runsIt = owner || role === 'admin';
  const at = (path: string) => `/leagues/${leagueId}/${path}`;

  const sections: MoreSection[] = [{
    label: 'This league',
    tone: 'normal',
    entries: [
      {
        glyph: questionCount > 0 ? String(questionCount) : '?', title: 'Questions',
        note: isComplete ? 'Season questions, all resolved' : 'Season-long questions, scored separately from fixtures',
        badge: isComplete || openQuestions === 0 ? '' : `${openQuestions} OPEN`,
        tone: isComplete || openQuestions === 0 ? 'normal' : 'live',
        href: at('questions'), action: null,
      },
      {
        glyph: marketCount > 0 ? String(marketCount) : '§', title: 'Rules',
        note: 'Markets, points, tiebreakers and deadlines — frozen at publication',
        badge: '', tone: 'normal', href: at('rules'), action: null,
      },
      {
        glyph: memberCount > 0 ? String(memberCount) : '◍', title: 'Members',
        note: `${pluralise(memberCount, 'member')} · ${isComplete ? 'final roster' : 'admin settings'}`,
        badge: '', tone: 'normal', href: at('admin'), action: null,
      },
    ],
  }];

  if (runsIt) {
    sections.push({
      label: 'Running it',
      tone: 'normal',
      entries: [
        {
          glyph: '↗', title: 'Invitation links',
          note: 'Share, or revoke a link you have shared',
          badge: 'LIVE', tone: 'live', href: at('admin'), action: null,
        },
        {
          glyph: '✓', title: 'Join requests',
          note: 'People waiting for you or an admin to approve',
          badge: pendingRequests > 0 ? `${pendingRequests} WAITING` : '',
          tone: pendingRequests > 0 ? 'live' : 'normal',
          href: at('admin'), action: null,
        },
        {
          glyph: '⚙', title: 'League settings',
          note: 'Name, description and whether new members need approval',
          badge: '', tone: 'normal', href: at('rules'), action: null,
        },
      ],
    });
  }

  sections.push(owner ? {
    label: 'Ending it',
    tone: 'danger',
    entries: [
      {
        glyph: '◆', title: isComplete ? 'Archive this league' : 'Complete this league',
        note: isComplete
          ? 'Tidy it out of active lists. Nothing is deleted and the table stays readable.'
          : 'Available once every fixture and question has settled',
        badge: '', tone: 'quiet', href: at('admin'), action: null,
      },
      {
        glyph: '✕', title: 'Cancel this league',
        note: `Voids every prediction and every point, for all ${pluralise(memberCount, 'member')}`,
        badge: '', tone: 'danger', href: at('admin'), action: null,
      },
    ],
  } : {
    label: 'Leaving',
    tone: 'danger',
    entries: [
      {
        glyph: '→', title: 'Leave this league',
        note: 'Your points and answers stay in the table. You would need a fresh invitation to return.',
        badge: '', tone: 'danger', href: null, action: 'leave',
      },
    ],
  });

  return sections;
}
