import type { Api } from '@/lib/api/types';
import { identityTint } from './league-overview';
import { ordinal, personInitials } from '@/lib/format';

/**
 * The league admin screen's facts, shaped once on the server.
 *
 * The destructive actions live in the component, because they write — but which
 * of them a league can currently take is decided here, so the screen cannot
 * offer "Publish" to a running league or "Archive" to an unfinished one.
 */

export type AdminTab = 'members' | 'invites' | 'requests' | 'lifecycle';
export type MemberRole = 'owner' | 'admin' | 'participant';

export interface AdminMember {
  membershipId: string;
  userId: string;
  name: string;
  initials: string;
  role: MemberRole;
  roleLabel: string;
  tint: number;
  hasLeft: boolean;
  isYou: boolean;
  points: string;
  standing: string;
  joined: string;
}

export interface AdminInvite {
  id: string;
  label: string;
  meta: string;
  isActive: boolean;
  /** The server's own link. Null for links made before the API stored them. */
  joinUrl: string | null;
  joinCode: string | null;
  /** Whether this link would admit somebody right now. Sharing hangs on it. */
  isJoinable: boolean;
}

export interface AdminRequest {
  id: string;
  name: string;
  initials: string;
  meta: string;
  isPending: boolean;
}

export interface LifecycleStep {
  key: string;
  label: string;
  note: string;
  state: 'done' | 'current' | 'future';
}

/** `destructive` actions are confirmed twice by the screen before they run. */
export interface AdminAction {
  id: 'publish' | 'delete-draft' | 'clone' | 'archive' | 'cancel';
  title: string;
  note: string;
  destructive: boolean;
  /** False when the league's state does not allow it — shown, but explained. */
  available: boolean;
  unavailableReason: string;
}

const LIFECYCLE_ORDER = ['draft', 'published', 'in_progress', 'completed', 'archived'];

const LIFECYCLE_NOTES: Record<string, { label: string; note: string }> = {
  draft: { label: 'Draft', note: 'Rules can still change. Nobody can predict yet.' },
  published: { label: 'Published', note: 'Rules are frozen and fixtures exist. Members can join and answer.' },
  in_progress: { label: 'In progress', note: 'Fixtures are being played and settled.' },
  completed: { label: 'Completed', note: 'Everything has settled. The table never moves again.' },
  archived: { label: 'Archived', note: 'Tidied out of active lists. Still readable forever.' },
};

export function toLifecycleSteps(current: string): LifecycleStep[] {
  const index = LIFECYCLE_ORDER.indexOf(current);
  return LIFECYCLE_ORDER.map((key, i) => ({
    key,
    label: LIFECYCLE_NOTES[key].label,
    note: LIFECYCLE_NOTES[key].note,
    state: i < index ? 'done' : i === index ? 'current' : 'future',
  }));
}

export function toAdminMembers(
  members: Api<'MembershipResponseDto'>[],
  standings: Api<'StandingEntryDto'>[],
  ownUserId: string | undefined,
): AdminMember[] {
  const byMembership = new Map(standings.map(s => [s.membershipId, s]));

  return members.map(member => {
    const standing = byMembership.get(member.id);
    const name = member.displayName || 'Unknown';
    return {
      membershipId: member.id,
      userId: member.userId,
      name,
      initials: personInitials(name),
      role: member.role,
      roleLabel: member.role.charAt(0).toUpperCase() + member.role.slice(1),
      tint: identityTint(member.id),
      hasLeft: member.state === 'former',
      isYou: !!ownUserId && member.userId === ownUserId,
      points: standing ? standing.totalPoints.toLocaleString('en-GB') : '—',
      standing: standing ? ordinal(standing.position) : 'Not ranked',
      joined: member.joinedAt
        ? `Joined ${new Date(member.joinedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        : 'Joined recently',
    };
  });
}

/**
 * Either shape the API returns an invitation in.
 *
 * The list and the detail now carry the credentials back, so a link is no
 * longer show-once; the create response is the same thing minus
 * `currentlyJoinable`, which a link made a moment ago always is.
 */
type InvitationLike =
  | Api<'InvitationReadableResponseDto'>
  | Api<'InvitationCreatedResponseDto'>;

export function toAdminInvites(invites: InvitationLike[]): AdminInvite[] {
  return invites.map(invite => ({
    id: invite.id,
    // The API carries a label per link now; the date is the fallback for the
    // links created before it did.
    label: invite.label
      || (invite.createdAt
        ? `Invite · ${new Date(invite.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        : 'Invite'),
    meta: [
      invite.useLimit != null
        ? `${invite.usesConsumed} of ${invite.useLimit} used`
        : `${invite.usesConsumed} used`,
      invite.state,
    ].join(' · '),
    isActive: invite.state === 'active',
    // Null on an older invitation, whose credentials were never stored. That is
    // an ordinary fact about it, not a failure to report.
    joinUrl: invite.joinUrl ?? null,
    joinCode: invite.joinCode ?? null,
    isJoinable: 'currentlyJoinable' in invite ? invite.currentlyJoinable : true,
  }));
}

/**
 * A join request, as an admin can see it.
 *
 * UNTYPED UPSTREAM is not the problem here — `JoinRequestResponseDto` is fully
 * described and simply carries no display name, only `userId`. So an admin
 * deciding whether to let somebody in cannot see who is asking. This used to
 * slice that UUID into a name and a pair of initials, which produced things
 * like "a9627e0b" over the letters "A9" and read as a real person.
 *
 * Until the API sends a name, the row says plainly that there isn't one and
 * shows the short id as an id. Raised on the backend ask.
 */
export function toAdminRequests(requests: Api<'JoinRequestResponseDto'>[]): AdminRequest[] {
  return requests.map(request => ({
    id: request.id,
    name: 'Someone with your link',
    initials: '?',
    meta: request.createdAt
      ? `Asked ${new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ref ${request.userId.substring(0, 8)}`
      : `Waiting · ref ${request.userId.substring(0, 8)}`,
    isPending: request.state === 'pending',
  }));
}

/**
 * Which lifecycle actions this league can take. An action the state forbids is
 * still listed, with the reason — hiding it leaves an owner wondering where it
 * went.
 */
export function toAdminActions(lifecycleState: string, isOwner: boolean): AdminAction[] {
  if (!isOwner) return [];

  if (lifecycleState === 'draft') {
    return [
      {
        id: 'publish', title: 'Publish this league',
        note: 'Freezes the rules, creates the fixtures and opens invitations. It cannot be undone.',
        destructive: false, available: true, unavailableReason: '',
      },
      {
        id: 'delete-draft', title: 'Delete this draft',
        note: 'Permanent. Nothing has been played, so there is nothing else to lose.',
        destructive: true, available: true, unavailableReason: '',
      },
    ];
  }

  return [
    {
      id: 'clone', title: 'Clone into a new league',
      note: 'Same competitions and points, back in draft. The original keeps running.',
      destructive: false,
      available: lifecycleState === 'published',
      unavailableReason: 'Only while a league is published and has not started.',
    },
    {
      id: 'archive', title: 'Archive this league',
      note: 'History stays readable. This only hides it from your active leagues.',
      destructive: false,
      available: lifecycleState === 'completed',
      unavailableReason: 'Archiving waits until every fixture and question is final or void.',
    },
    {
      id: 'cancel', title: 'Cancel this league',
      note: 'Ends it permanently. Anything due after the cutoff is voided.',
      destructive: true,
      available: lifecycleState !== 'cancelled' && lifecycleState !== 'archived',
      unavailableReason: 'This league has already ended.',
    },
  ];
}
