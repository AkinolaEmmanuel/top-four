import type { Api } from '@/lib/api/types';
import { identityTint } from './league-overview';
import { ordinal } from '@/lib/format';

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
      initials: name.substring(0, 2).toUpperCase(),
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

export function toAdminInvites(invites: Api<'InvitationMetadataResponseDto'>[]): AdminInvite[] {
  return invites.map(invite => ({
    id: invite.id,
    // The API carries a label per link now; the date is the fallback for the
    // links created before it did.
    label: invite.label
      || (invite.createdAt
        ? `Invite · ${new Date(invite.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        : 'Invite'),
    meta: [
      invite.usesConsumed != null ? `${invite.usesConsumed} used` : null,
      invite.state,
    ].filter(Boolean).join(' · '),
    isActive: invite.state === 'active',
  }));
}

export function toAdminRequests(requests: Api<'JoinRequestResponseDto'>[]): AdminRequest[] {
  return requests.map(request => ({
    id: request.id,
    name: request.userId.substring(0, 8),
    initials: request.userId.substring(0, 2).toUpperCase(),
    meta: request.createdAt
      ? `Asked ${new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
      : 'Waiting',
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
