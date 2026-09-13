'use client';

import { useState } from 'react';
import { LeagueColumn } from './LeagueColumn';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useUpdateMemberRole, useRemoveMember, useTransferOwnership, useProcessJoinRequest,
  useCreateInvitation, useRevokeInvitation, usePublishLeague, useDeleteLeague,
  useCloneLeague, useArchiveLeague, useCancelLeague,
} from '@/hooks/api/useLeagues';
import type { AdminAction, AdminInvite, AdminMember, AdminRequest, AdminTab, LifecycleStep, MemberRole } from '@/lib/leagues/league-admin';
import { toAdminInvites } from '@/lib/leagues/league-admin';
import type { Api } from '@/lib/api/types';


/**
 * League admin — one component for both platforms.
 *
 * Every write on this screen reports failure. The version it replaces attached
 * only `onSuccess` to the role change and the member removal, so a rejected one
 * closed the sheet and looked as though it had worked.
 *
 * Destructive actions — delete a draft, cancel a league — ask twice: once to
 * open the confirmation, and again by typing the league's name.
 */

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: 'members', label: 'Members' },
  { id: 'invites', label: 'Invites' },
  { id: 'requests', label: 'Requests' },
  { id: 'lifecycle', label: 'Lifecycle' },
];

function Toast({ message }: { message: string }) {
  return (
    <div role="status" className="fixed bottom-[86px] md:bottom-[24px] left-1/2 -translate-x-1/2 z-50 bg-[var(--nav-surface)] text-[var(--nav-text)] px-[18px] h-[42px] rounded-[21px] flex items-center font-heading font-bold text-[12.5px] shadow-[0_12px_24px_rgba(0,0,0,.2)]">
      {message}
    </div>
  );
}

export function LeagueAdminScreen({
  leagueId, leagueName, lifecycleState, version, isOwner, canManage,
  members, invites, requests, lifecycle, actions, memberCount,
}: {
  leagueId: string;
  leagueName: string;
  lifecycleState: string;
  version: number;
  isOwner: boolean;
  canManage: boolean;
  members: AdminMember[];
  invites: AdminInvite[];
  requests: AdminRequest[];
  lifecycle: LifecycleStep[];
  actions: AdminAction[];
  memberCount: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('members');
  const [openMember, setOpenMember] = useState<AdminMember | null>(null);
  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  /*
   * The invitation just made, held here rather than refetched.
   *
   * `router.refresh()` on success re-suspended this screen's Suspense boundary,
   * so the panel unmounted and took the shown-once code with it — which read as
   * the page reloading and losing the link. The created invitation is already
   * in the response, so it is kept and prepended to the list instead.
   */
  const [created, setCreated] = useState<Api<'InvitationCreatedResponseDto'> | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  /* The server list is a page behind until the next navigation, so the new one
     is prepended here rather than refetched. */
  const shownInvites = created && !invites.some(i => i.id === created.id)
    ? [...toAdminInvites([created]), ...invites]
    : invites;

  const updateRole = useUpdateMemberRole(leagueId);
  const removeMember = useRemoveMember(leagueId);
  const transfer = useTransferOwnership(leagueId);
  const processRequest = useProcessJoinRequest(leagueId);
  const createInvite = useCreateInvitation(leagueId);
  const revokeInvite = useRevokeInvitation(leagueId);
  const publish = usePublishLeague();
  const remove = useDeleteLeague();
  const clone = useCloneLeague(leagueId);
  const archive = useArchiveLeague(leagueId);
  const cancel = useCancelLeague(leagueId);

  const say = (message: string) => { setFailed(null); setToast(message); setTimeout(() => setToast(null), 2600); };
  const blame = (what: string) => setFailed(`${what} did not go through — nothing changed.`);
  const done = (message: string) => { setOpenMember(null); setPendingAction(null); setConfirmText(''); say(message); router.refresh(); };

  const idempotencyKey = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

  const runAction = (action: AdminAction) => {
    setFailed(null);
    const key = idempotencyKey();
    switch (action.id) {
      case 'publish':
        return publish.mutate({ leagueId, idempotencyKey: key, expectedVersion: version },
          { onSuccess: () => done('League published'), onError: () => blame('Publishing') });
      case 'delete-draft':
        return remove.mutate({ leagueId, idempotencyKey: key, expectedVersion: version },
          { onSuccess: () => router.push('/leagues'), onError: () => blame('Deleting the draft') });
      case 'clone':
        return clone.mutate({ idempotencyKey: key, payload: { name: `${leagueName} (copy)` } },
          { onSuccess: created => router.push(`/leagues/${created.id}`), onError: () => blame('Cloning') });
      case 'archive':
        return archive.mutate({ idempotencyKey: key, expectedVersion: version },
          { onSuccess: () => done('League archived'), onError: () => blame('Archiving') });
      case 'cancel':
        return cancel.mutate({ idempotencyKey: key, expectedVersion: version },
          { onSuccess: () => done('League cancelled'), onError: () => blame('Cancelling') });
    }
  };

  const tabCount = (id: AdminTab) =>
    id === 'members' ? memberCount
      : id === 'invites' ? invites.filter(i => i.isActive).length
        : id === 'requests' ? requests.filter(r => r.isPending).length : 0;

  const adminCount = members.filter(m => !m.hasLeft && ['owner', 'admin'].includes(m.roleLabel.toLowerCase())).length;

  return (
    <LeagueColumn className="md:pt-[20px]">
      {/* The design leads with the size of the thing being administered. This
          went straight to the tabs, so the screen opened without saying how
          many people it was about. */}
      <section className="flex items-end gap-[12px] p-[16px_var(--gutter)_18px] md:px-0 md:pt-[4px]">
        <span className="tf-num font-heading font-bold text-[40px] md:text-[46px] leading-[0.88] tracking-[-1.8px]">
          {memberCount}
        </span>
        <div className="pb-[5px]">
          <div className="font-heading font-semibold text-[12.5px]">{memberCount === 1 ? 'member' : 'members'}</div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">
            {adminCount === 1 ? '1 of them runs it' : `${adminCount} of them run it`}
            {requests.length > 0 ? ` · ${requests.length} waiting to join` : ''}
          </div>
        </div>
      </section>



      <div className="tf-scroll flex-none flex gap-[2px] px-[var(--gutter)] md:px-0 overflow-x-auto border-b border-[var(--surface-border)]">
        {TABS.map(t => {
          const on = tab === t.id;
          const count = tabCount(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-current={on ? 'true' : undefined}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-[6px] h-[42px] px-[14px] font-heading font-bold text-[12px] border-b-2 whitespace-nowrap ${on ? 'border-[var(--color-brand)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
            >
              {t.label}
              {count > 0 && <span className={`tf-num text-[11px] ${t.id === 'requests' && !on ? 'text-[var(--danger-text)]' : 'opacity-55'}`}>{count}</span>}
            </button>
          );
        })}
      </div>


          {tab === 'members' && members.map(member => (
            <button
              key={member.membershipId}
              type="button"
              onClick={() => canManage && setOpenMember(member)}
              disabled={!canManage}
              className={`w-full text-left flex md:grid md:grid-cols-[38px_minmax(0,1fr)_120px_96px_170px] items-center gap-[11px] md:gap-[14px] p-[12px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)] ${member.isYou ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''} ${member.hasLeft ? 'opacity-55' : ''}`}
            >
              <span className="w-[34px] h-[34px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] text-[var(--text-primary)]" style={{ background: `var(--ident-${member.tint})` }}>{member.initials}</span>
              <div className="flex-1 md:flex-none min-w-0">
                <div className="flex items-center gap-[7px]">
                  <span className="font-heading font-semibold text-[13.5px] truncate">{member.name}</span>
                  {member.isYou && <span className="font-heading font-bold text-[8.5px] tracking-[0.08em] px-[5px] py-[2px] rounded-[4px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] flex-none">YOU</span>}
                </div>
                {/* The phone stacks role and joined date under the name because
                    it has nowhere else; at width each is its own column. */}
                <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px] md:hidden">
                  {member.hasLeft ? 'Former member' : `${member.roleLabel} · ${member.joined}`}
                </div>
              </div>

              <span className="hidden md:block">
                {member.hasLeft ? (
                  <span className="text-[11px] text-[var(--text-muted)]">Former member</span>
                ) : (
                  <span className={`inline-flex items-center h-[20px] px-[8px] rounded-[5px] font-heading font-bold text-[9px] tracking-[0.06em] uppercase ${member.roleLabel.toLowerCase() === 'owner' ? 'bg-[var(--accent-surface)] text-[var(--accent-text)]' : member.roleLabel.toLowerCase() === 'admin' ? 'bg-[var(--warn-surface)] text-[var(--warn-text)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
                    {member.roleLabel}
                  </span>
                )}
              </span>

              <span className="hidden md:block text-[11px] text-[var(--text-muted)] text-right">
                {member.hasLeft ? '—' : member.joined}
              </span>

              <div className="text-right flex-none md:flex md:items-baseline md:justify-end md:gap-[10px]">
                <div className="tf-num font-heading font-bold text-[13px]">{member.hasLeft ? '—' : member.points}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-[3px] md:mt-0">{member.hasLeft ? 'not ranked' : member.standing}</div>
              </div>
            </button>
          ))}

          {tab === 'invites' && (
            <div>
              {canManage && (
                <div className="p-[14px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)]">
                  <button
                    type="button"
                    disabled={createInvite.isPending}
                    onClick={() => {
                      setFailed(null);
                      createInvite.mutate(100, {
                        onSuccess: result => {
                          setCreated(result.data);
                          setInviteCopied(false);
                          say('Invite created');
                        },
                        onError: () => blame('Creating an invite'),
                      });
                    }}
                    className="h-[42px] px-[18px] rounded-[11px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12.5px]"
                  >
                    {createInvite.isPending ? 'Creating…' : 'Create an invite link'}
                  </button>
                  {created && (
                    <div className="mt-[12px] p-[12px_14px] rounded-[11px] bg-[var(--tf-navy-800)] text-[var(--tf-white)]">
                      <div className="tf-kicker opacity-70">Shown once — copy it now</div>

                      {/* The server's own link, not one built here. It carries the
                          real domain and the token the join screen expects; the
                          code below it is for somebody typing it in by hand. */}
                      <div className="flex items-center gap-[10px] mt-[10px] p-[10px_12px] rounded-[9px] bg-[rgba(255,255,255,0.10)]">
                        <span className="flex-1 min-w-0 text-[12px] opacity-90 truncate">{created.joinUrl}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(created.joinUrl);
                              setInviteCopied(true);
                              setTimeout(() => setInviteCopied(false), 2000);
                            } catch {
                              // A blocked clipboard leaves the link on screen to
                              // select by hand, which is why it is shown in full.
                            }
                          }}
                          className="tf-hit font-heading font-bold text-[10.5px] tracking-[0.05em] flex-none"
                        >
                          {inviteCopied ? 'COPIED ✓' : 'COPY LINK'}
                        </button>
                      </div>

                      <div className="tf-kicker opacity-60 mt-[12px]">Or this code</div>
                      <div className="font-heading font-bold text-[22px] tracking-[2px] mt-[4px] break-all">{created.joinCode}</div>

                      <div className="text-[11px] opacity-75 mt-[10px]">TopFour will not show this link again. Later lists carry the label and its status, never the code.</div>
                    </div>
                  )}
                </div>
              )}
              {shownInvites.length === 0
                ? <p className="p-[40px_30px] text-center text-[12.5px] text-[var(--text-secondary)]">No invite links yet.</p>
                : shownInvites.map(invite => (
                  <div key={invite.id} className="flex items-center gap-[12px] p-[13px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)]">
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13px] truncate">{invite.label}</div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{invite.meta}</div>
                    </div>
                    {invite.isActive && canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setFailed(null);
                          revokeInvite.mutate(invite.id, {
                            onSuccess: () => { say('Invite revoked'); router.refresh(); },
                            onError: () => blame('Revoking that invite'),
                          });
                        }}
                        className="font-heading font-bold text-[10.5px] text-[var(--danger-text)] flex-none"
                      >
                        REVOKE
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}

          {tab === 'requests' && (
            requests.filter(r => r.isPending).length === 0
              ? <p className="p-[40px_30px] text-center text-[12.5px] text-[var(--text-secondary)]">Nobody is waiting to join.</p>
              : requests.filter(r => r.isPending).map(request => (
                <div key={request.id} className="flex items-center gap-[11px] p-[13px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)]">
                  <span className="w-[34px] h-[34px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{request.initials}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-[13px] truncate">{request.name}</div>
                    <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{request.meta}</div>
                  </div>
                  <div className="flex gap-[8px] flex-none">
                    {(['approve', 'reject'] as const).map(decision => (
                      <button
                        key={decision}
                        type="button"
                        disabled={processRequest.isPending}
                        onClick={() => {
                          setFailed(null);
                          processRequest.mutate({ requestId: request.id, action: decision }, {
                            onSuccess: () => { say(decision === 'approve' ? 'Request approved' : 'Request rejected'); router.refresh(); },
                            onError: () => blame(decision === 'approve' ? 'Approving' : 'Rejecting'),
                          });
                        }}
                        className={`h-[34px] px-[12px] rounded-[9px] font-heading font-bold text-[11px] ${decision === 'approve' ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                      >
                        {decision === 'approve' ? 'Approve' : 'Reject'}
                      </button>
                    ))}
                  </div>
                </div>
              ))
          )}

          {tab === 'lifecycle' && (
            <div>
              <ol className="p-[18px_var(--gutter)] md:px-[6px]">
                {lifecycle.map(step => (
                  <li key={step.key} className="flex gap-[12px] pb-[18px] last:pb-0">
                    <span
                      className={`w-[11px] h-[11px] rounded-full flex-none mt-[4px] ${step.state === 'current' ? 'bg-[var(--color-brand)] shadow-[0_0_0_4px_var(--accent-surface)]' : step.state === 'done' ? 'bg-[var(--color-success)]' : 'border-[1.5px] border-[var(--surface-border-strong)]'}`}
                    />
                    <div className="flex-1">
                      <div className={`font-heading font-[650] text-[13.5px] ${step.state === 'future' ? 'text-[var(--text-muted)]' : ''}`}>{step.label}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">{step.note}</div>
                    </div>
                  </li>
                ))}
              </ol>

              {actions.map(action => (
                <div key={action.id} className={`p-[15px_var(--gutter)] md:px-[6px] border-t border-[var(--surface-border)] ${action.destructive ? 'shadow-[inset_3px_0_0_0_var(--color-danger)]' : ''} ${action.available ? '' : 'opacity-60'}`}>
                  <div className="flex items-center gap-[12px]">
                    <div className="flex-1 min-w-0">
                      <div className={`font-heading font-[650] text-[13.5px] ${action.destructive ? 'text-[var(--danger-text)]' : ''}`}>{action.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-[3px]">
                        {action.available ? action.note : action.unavailableReason}
                      </div>
                    </div>
                    {action.available && (
                      <button
                        type="button"
                        onClick={() => { setPendingAction(action); setConfirmText(''); }}
                        className="font-heading font-bold text-[10.5px] flex-none text-[var(--text-link)]"
                      >
                        OPEN
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {failed && <p role="alert" className="p-[14px_var(--gutter)] md:px-[6px] text-[11.5px] text-[var(--danger-text)]">{failed}</p>}

      {/* A member's row, opened for a role change, a removal, or a handover. */}
      {openMember && (
        <div
          // Dismisses on its own surface only, so the panel below needs no
          // click handler of its own to stop the event travelling.
          role="presentation"
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,.45)] flex items-end md:items-center justify-center"
          onClick={event => { if (event.target === event.currentTarget) setOpenMember(null); }}
        >
          <div role="dialog" aria-modal="true" className="w-full md:w-[420px] bg-[var(--surface-card)] rounded-t-[18px] md:rounded-[16px] p-[20px_var(--gutter)_calc(20px+env(safe-area-inset-bottom))] md:p-[22px]">
            <div className="font-heading font-bold text-[18px] tracking-[-0.4px]">{openMember.name}</div>
            <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[8px]">
              Change what they can do, or take them out. Their predictions and points stay either way.
            </p>

            {!openMember.hasLeft && openMember.role !== 'owner' && (
              <div className="flex flex-col gap-[8px] mt-[16px]">
                {(['admin', 'participant'] as MemberRole[]).map(role => (
                  <button
                    key={role}
                    type="button"
                    disabled={updateRole.isPending || role === openMember.role}
                    onClick={() => {
                      setFailed(null);
                      updateRole.mutate({ membershipId: openMember.membershipId, role }, {
                        onSuccess: () => done(`${openMember.name} is now ${role === 'admin' ? 'an admin' : 'a participant'}`),
                        onError: () => blame('Changing that role'),
                      });
                    }}
                    className={`p-[12px_13px] rounded-[12px] border text-left ${role === openMember.role ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border-[var(--surface-border)]'}`}
                  >
                    <div className="font-heading font-semibold text-[13px] capitalize">{role}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-[2px]">
                      {role === 'admin' ? 'Invitations, approvals, participants and custom questions' : 'Predicts, reads results and standings'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-[8px] mt-[16px]">
              {isOwner && !openMember.isYou && !openMember.hasLeft && openMember.role !== 'owner' && (
                <button
                  type="button"
                  disabled={transfer.isPending}
                  onClick={() => {
                    setFailed(null);
                    transfer.mutate(openMember.membershipId, {
                      onSuccess: () => done(`${openMember.name} is now the owner`),
                      onError: () => blame('Transferring ownership'),
                    });
                  }}
                  className="h-[44px] rounded-[11px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px]"
                >
                  Transfer ownership to {openMember.name}
                </button>
              )}

              {!openMember.isYou && !openMember.hasLeft && (
                <button
                  type="button"
                  disabled={removeMember.isPending}
                  onClick={() => {
                    setFailed(null);
                    removeMember.mutate(openMember.membershipId, {
                      onSuccess: () => done(`${openMember.name} removed`),
                      onError: () => blame('Removing that member'),
                    });
                  }}
                  className="h-[44px] rounded-[11px] border border-[var(--color-danger)] text-[var(--danger-text)] font-heading font-bold text-[12.5px]"
                >
                  Remove from league
                </button>
              )}

              <button type="button" onClick={() => setOpenMember(null)} className="h-[44px] rounded-[11px] font-heading font-semibold text-[12.5px] text-[var(--text-secondary)]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle confirmation. A destructive one also asks for the league's name. */}
      {pendingAction && (
        <div
          // Dismisses on its own surface only, so the panel below needs no
          // click handler of its own to stop the event travelling.
          role="presentation"
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,.45)] flex items-end md:items-center justify-center"
          onClick={event => { if (event.target === event.currentTarget) setPendingAction(null); }}
        >
          <div role="dialog" aria-modal="true" className="w-full md:w-[440px] bg-[var(--surface-card)] rounded-t-[18px] md:rounded-[16px] p-[20px_var(--gutter)_calc(20px+env(safe-area-inset-bottom))] md:p-[22px]">
            <div className="font-heading font-bold text-[18px] tracking-[-0.4px]">{pendingAction.title}?</div>
            <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[8px]">{pendingAction.note}</p>

            {pendingAction.destructive && (
              <label className="block mt-[16px]">
                <span className="text-[11.5px] text-[var(--text-secondary)]">Type <strong>{leagueName}</strong> to confirm.</span>
                <input
                  autoFocus
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="w-full h-[42px] px-[12px] mt-[8px] rounded-[10px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]"
                />
              </label>
            )}

            <div className="flex gap-[9px] mt-[18px]">
              <button
                type="button"
                disabled={pendingAction.destructive && confirmText.trim() !== leagueName}
                onClick={() => runAction(pendingAction)}
                className={`flex-1 h-[46px] rounded-[12px] font-heading font-bold text-[12.5px] ${pendingAction.destructive ? 'bg-[var(--color-danger)] text-[var(--tf-white)]' : 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]'} disabled:opacity-40`}
              >
                {pendingAction.title}
              </button>
              <button type="button" onClick={() => setPendingAction(null)} className="h-[46px] px-[18px] rounded-[12px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </LeagueColumn>
  );
}
