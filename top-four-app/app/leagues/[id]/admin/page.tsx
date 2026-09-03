'use client';

import { useState, useEffect } from 'react';
import { LeagueAdminMobile } from '../../../components/leagues/LeagueAdminMobile';
import { LeagueAdminDesktop } from '../../../components/leagues/LeagueAdminDesktop';
import {
  useLeague, useLeagueMembers, useJoinRequests, useUpdateMemberRole, useRemoveMember,
  useProcessJoinRequest, useLeagueInvitations, useCreateInvitation, useRevokeInvitation,
  useCloneLeague, useArchiveLeague, useCancelLeague, useLeaveLeague, usePublishLeague, useDeleteLeague
} from '@/hooks/api/useLeagues';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const BRAND = "var(--color-brand)";

export default function LeagueAdminPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const { data: league } = useLeague(params.id);
  const { data: membersData, isLoading: loadingMembers } = useLeagueMembers(params.id);
  const { data: requestsData, isLoading: loadingRequests } = useJoinRequests(params.id);
  const { data: invitationsData } = useLeagueInvitations(params.id);

  const updateRoleMutation = useUpdateMemberRole(params.id);
  const removeMemberMutation = useRemoveMember(params.id);
  const processRequestMutation = useProcessJoinRequest(params.id);
  const createInviteMutation = useCreateInvitation(params.id);
  const revokeInviteMutation = useRevokeInvitation(params.id);
  const cloneMutation = useCloneLeague(params.id);
  const archiveMutation = useArchiveLeague(params.id);
  const cancelMutation = useCancelLeague(params.id);
  const leaveMutation = useLeaveLeague(params.id);
  const publishMutation = usePublishLeague();
  const deleteMutation = useDeleteLeague();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [tab, setTab] = useState<'members' | 'invites' | 'requests' | 'lifecycle'>('members');
  const [dataState, setDataState] = useState<'ready' | 'loading' | 'empty'>('ready');
  const [sheet, setSheet] = useState<string | null>(null);
  const [who, setWho] = useState<string>("");
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const [role, setRole] = useState("Admin");
  const [filter, setFilter] = useState("All");
  const [fresh, setFresh] = useState(false);
  const [latestInviteCode, setLatestInviteCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [invitesOpen, setInvitesOpen] = useState(true);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (toast) t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const loading = loadingMembers || loadingRequests || dataState === "loading";
  const empty = dataState === "empty";
  const flash = (msg: string) => setToast(msg);

  const roleColor = (r: string) => r === "Owner" ? "var(--role-owner)" : r === "Admin" ? "var(--role-admin)" : r === "Former" ? "var(--surface-border-strong)" : "var(--role-participant)";

  // Derived data
  const leagueName = league?.name || '';
  const leagueAbbr = leagueName ? leagueName.substring(0, 2).toUpperCase() : 'LG';

  const dynamicMembers = (membersData?.data || []).map((m: any) => ({
    id: m.id,
    name: m.displayName || "Unknown",
    role: m.role === 'owner' ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Participant',
    initials: (m.displayName || "U").substring(0, 2).toUpperCase(),
    points: 0,
    rank: "—",
    you: !!user && m.userId === user.id,
    left: m.state === 'former',
    joined: `Joined recently`
  }));
  const displayMembers = dynamicMembers;

  const members = displayMembers.filter((m: any) => {
    if (loading) return false;
    if (filter === "Admins") return m.role === "Owner" || m.role === "Admin";
    if (filter === "Newest") return !m.left;
    if (filter === "Former") return m.left;
    return true;
  }).map((m: any, i: number, arr: any[]) => ({
    name: m.name, initials: m.initials, you: m.you, left: m.left,
    role: m.role, points: m.left ? "—" : String(m.points),
    rank: m.left ? "not ranked" : m.rank,
    meta: m.role + " · " + m.joined,
    rowStyle: `flex items-center gap-[11px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${i === arr.length - 1 ? 'border-b' : ''} ${m.you ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''} ${m.left ? 'opacity-[0.55]' : ''}`,
    nameStyle: `font-heading ${m.you ? 'font-bold' : 'font-semibold'} text-[13.5px] tracking-[-0.2px] whitespace-nowrap overflow-hidden text-ellipsis ${m.you ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-primary)]'}`,
    avatarStyle: "w-[34px] h-[34px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    dotStyle: `w-[6px] h-[6px] rounded-full flex-none`,
    dotColor: roleColor(m.role),
    youStyle: `font-heading font-bold text-[8.5px] tracking-[0.08em] p-[2px_5px] rounded-[4px] bg-[var(--color-brand)] text-[var(--color-on-brand)] flex-none ${m.you ? '' : 'hidden'}`,
    open: () => { setSheet(m.left ? "former" : m.you ? "self" : "member"); setWho(m.name); setRole(m.role); setTargetMemberId(m.id); }
  }));

  const memberFilters = ["All", "Admins", "Newest", "Former"].map(f => ({
    label: f,
    style: `h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${filter === f ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`,
    pick: () => setFilter(f)
  }));

  // Real invitations from API. The backend does not carry a custom label per
  // link, so the created date stands in for one.
  const dynamicInvites = (invitationsData?.data || []).map((iv: any) => ({
    id: iv.id,
    label: iv.createdAt ? `Invite · ${new Date(iv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Invite',
    meta: [
      iv.createdAt ? `Created ${new Date(iv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : null,
      iv.usesConsumed != null ? `${iv.usesConsumed} used` : null,
      iv.useLimit != null ? `limit ${iv.useLimit}` : 'no limit'
    ].filter(Boolean).join(' · '),
    state: iv.state === 'revoked' ? 'revoked' : iv.state === 'expired' || iv.state === 'exhausted' ? 'expired' : 'active'
  }));
  const invites = dynamicInvites.map((iv: any, i: number, arr: any[]) => {
    const active = iv.state === "active";
    return {
      label: iv.label, meta: iv.meta, active,
      rowStyle: `flex items-start gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${active ? '' : 'opacity-[0.55]'}`,
      chip: active ? "ACTIVE" : iv.state === "revoked" ? "REVOKED" : "EXPIRED",
      chipStyle: active ? "bg-[var(--color-success)] text-[var(--tf-white)]" : "border border-[var(--surface-border-strong)] text-[var(--text-muted)]",
      action: active ? "REVOKE" : "",
      actionStyle: `font-heading font-bold text-[10px] tracking-[0.05em] text-[var(--danger-text)] cursor-pointer mt-[7px] ${active ? '' : 'hidden'}`,
      revoke: () => {
        if (!iv.id) return;
        revokeInviteMutation.mutate(iv.id, {
          onSuccess: () => flash("Invitation revoked"),
          onError: () => flash("Couldn't revoke that invitation")
        });
      }
    };
  });

  // Real requests. The join-requests API identifies the requester only by
  // userId — it carries no display name, so the row shows a neutral label
  // rather than a fabricated one.
  const dynamicRequests = (requestsData?.data || []).map((r: any) => ({
    id: r.id,
    name: 'A member',
    initials: '??',
    meta: r.createdAt ? `Requested ${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Requested recently',
    state: r.state === 'pending' ? 'pending' : r.state === 'approved' ? 'approved' : 'rejected'
  }));
  const displayRequests = dynamicRequests;

  const requests = displayRequests.filter(() => !loading).map((r: any, i: number, arr: any[]) => ({
    name: r.name, initials: r.initials, meta: r.meta, pending: r.state === "pending",
    blockStyle: `p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${r.state === "pending" ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
    avatarStyle: "w-[34px] h-[34px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    stateChip: r.state === "approved" ? "IN" : r.state === "already" ? "ALREADY A MEMBER" : "",
    stateChipStyle: `flex-none ${r.state === "approved" ? "bg-[var(--color-success)] text-[var(--tf-white)]" : r.state === "already" ? "bg-[var(--surface-subtle)] text-[var(--text-secondary)]" : "hidden"}`,
    approve: () => {
      if (r.id) {
        processRequestMutation.mutate({ requestId: r.id, action: 'approve' }, {
          onSuccess: () => flash(r.name + " is in · they start on zero")
        });
      } else {
        flash(r.name + " is in · they start on zero");
      }
    },
    reject: () => {
      if (r.id) {
        processRequestMutation.mutate({ requestId: r.id, action: 'reject' }, {
          onSuccess: () => flash("Declined · they can ask again")
        });
      } else {
        flash("Declined · they can ask again");
      }
    }
  }));

  // Derive lifecycle from real league data
  const lifecycleState = league?.lifecycleState || 'draft';
  const createdDate = league?.createdAt ? new Date(league.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'recently';
  const LIFECYCLE_STEPS = [
    { key: 'draft', label: 'Draft', note: `Created ${createdDate}` },
    { key: 'published', label: 'Published', note: 'Rules frozen' },
    { key: 'in_progress', label: 'In progress', note: 'First deadline passed' },
    { key: 'completed', label: 'Completed', note: 'When every fixture and question settles' },
    { key: 'archived', label: 'Archived', note: 'Optional, after completion' }
  ];
  const lifecycleOrder = ['draft', 'published', 'in_progress', 'completed', 'archived'];
  const currentLifecycleIdx = lifecycleOrder.indexOf(lifecycleState);
  const lifecycle = LIFECYCLE_STEPS.map((l, i) => ({
    label: l.label, note: l.note,
    done: i < currentLifecycleIdx,
    current: i === currentLifecycleIdx,
    future: i > currentLifecycleIdx,
    dotStyle: `w-[11px] h-[11px] rounded-full flex-none mt-[4px] ${i === currentLifecycleIdx ? `bg-[${BRAND}] shadow-[0_0_0_4px_var(--accent-surface)]` : i < currentLifecycleIdx ? "bg-[var(--color-success)]" : "border-[1.5px] border-[var(--surface-border-strong)]"}`,
    lineStyle: `flex-1 w-[1.5px] bg-[var(--surface-border)] ${i === LIFECYCLE_STEPS.length - 1 ? 'hidden' : ''}`,
    textWrapStyle: `flex-1 ${i === LIFECYCLE_STEPS.length - 1 ? 'pb-0' : 'pb-[18px]'}`,
    labelStyle: `font-heading font-[650] text-[13.5px] tracking-[-0.2px] ${i > currentLifecycleIdx ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`
  }));

  const isDraft = lifecycleState === 'draft';

  const actions = (isDraft
    ? [
        { id: "publish", title: "Publish this league", note: "Freezes the rules, materializes fixtures and opens invitations." },
        { id: "delete-draft", title: "Delete this draft", note: "Permanent. Nothing has been played yet, so there is nothing else to lose.", danger: true }
      ]
    : [
        { id: "clone", title: "Clone into a new league", note: "Same competitions and points, back in draft. The original keeps running." },
        { id: "archive", title: "Archive", note: "Only once every fixture and question is final. History stays readable.", muted: lifecycleState !== 'completed' },
        { id: "cancel", title: "Cancel this league", note: "Ends it permanently. Anything due after the cutoff is voided.", danger: true }
      ]
  ).map((a: any, i, arr) => ({
    title: a.title, note: a.note,
    rowStyle: `flex items-center gap-[12px] p-[16px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${i === arr.length - 1 ? 'border-b' : ''} ${a.danger ? 'shadow-[inset_3px_0_0_0_var(--color-danger)]' : ''} ${a.muted ? 'opacity-[0.55]' : ''}`,
    titleStyle: `font-heading font-[650] text-[13.5px] tracking-[-0.2px] ${a.danger ? 'text-[var(--danger-text)]' : 'text-[var(--text-primary)]'}`,
    arrowStyle: `text-[16px] flex-none ${a.danger ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`,
    open: () => setSheet(a.id)
  }));

  const targetWho = who || "this member";
  const sheetSpec: any = {
    member: { 
      title: targetWho, body: "Change what they can do, or take them out. Their predictions and points stay either way.", roles: true, 
      primary: "Save role", secondary: "Remove from league",
      primaryAction: () => {
        if (targetMemberId) {
          updateRoleMutation.mutate({ membershipId: targetMemberId, role: role.toLowerCase() }, {
            onSuccess: () => { setSheet(null); flash("Role updated"); }
          });
        }
      },
      secondaryAction: () => {
        if (targetMemberId) {
          removeMemberMutation.mutate(targetMemberId, {
            onSuccess: () => { setSheet(null); flash("Member removed"); }
          });
        }
      }
    },
    self: role === "Owner"
      ? { title: "You own this league", body: "An owner has to hand the league over before leaving it. Open another member's row to transfer ownership to them first.", primary: "Got it" }
      : { title: "Leave this league?", body: "Your predictions and points stay, without your name attached. Rejoining later starts you back on zero.", primary: "Leave league", danger: true,
          primaryAction: () => {
            leaveMutation.mutate(undefined, {
              onSuccess: () => { setSheet(null); router.push('/leagues'); },
              onError: () => flash("Couldn't leave the league")
            });
          }
        },
    former: { title: targetWho + " has left", body: "Their history is kept and their predictions stay hidden. Rejoining restores the same points — leaving cannot reset a score.", primary: "Invite them back" },
    publish: { title: `Publish ${leagueName}?`, body: "This cannot be undone. Competitions, markets, points and tiebreakers freeze the moment you confirm, and fixtures are materialized with their deadlines.", primary: "Publish",
      primaryAction: () => {
        if (league?.version == null) return;
        publishMutation.mutate({ leagueId: params.id, idempotencyKey: crypto.randomUUID(), expectedVersion: league.version }, {
          onSuccess: () => { setSheet(null); flash("League published"); },
          onError: () => flash("Couldn't publish this league")
        });
      }
    },
    'delete-draft': { title: `Delete ${leagueName}?`, body: "This cannot be undone. The draft and its setup are gone — nothing has been played yet, so there are no predictions or points to lose.", primary: "Delete draft", danger: true,
      primaryAction: () => {
        if (league?.version == null) return;
        deleteMutation.mutate({ leagueId: params.id, idempotencyKey: crypto.randomUUID(), expectedVersion: league.version }, {
          onSuccess: () => { setSheet(null); router.push('/leagues'); },
          onError: () => flash("Couldn't delete this draft")
        });
      }
    },
    clone: { title: `Clone ${leagueName}?`, body: "You get a fresh draft with the same competitions, markets and points. Members, invitations and predictions do not come with it.", primary: "Create the draft",
      primaryAction: () => {
        cloneMutation.mutate({ idempotencyKey: crypto.randomUUID(), payload: { name: `${leagueName} (copy)` } }, {
          onSuccess: (data: any) => { setSheet(null); router.push(`/leagues/${data.id}`); },
          onError: () => flash("Couldn't clone this league")
        });
      }
    },
    archive: league?.lifecycleState === 'completed'
      ? { title: `Archive ${leagueName}?`, body: "History stays readable. This only hides it from your active leagues.", primary: "Archive",
          primaryAction: () => {
            if (league?.version == null) return;
            archiveMutation.mutate({ idempotencyKey: crypto.randomUUID(), expectedVersion: league.version }, {
              onSuccess: () => { setSheet(null); flash("League archived"); },
              onError: () => flash("Couldn't archive this league")
            });
          }
        }
      : { title: "Not finished yet", body: "Archiving waits until every fixture and custom question is final or void. Some fixtures and questions are still open.", primary: "Got it" },
    cancel: { title: `Cancel ${leagueName}?`, body: "This cannot be undone and the league cannot resume.", list: ["Fixtures and questions due before now still settle normally.", "Everything due later is voided — no points either way.", "New predictions, answers and questions are refused from the moment you confirm."], primary: "Cancel the league", danger: true,
      primaryAction: () => {
        if (league?.version == null) return;
        cancelMutation.mutate({ idempotencyKey: crypto.randomUUID(), expectedVersion: league.version }, {
          onSuccess: () => { setSheet(null); flash("League cancelled"); },
          onError: () => flash("Couldn't cancel this league")
        });
      }
    }
  }[sheet || ""];

  const roles = [
    { id: "Admin", label: "Admin", note: "Invitations, approvals, participants and custom questions" },
    { id: "Participant", label: "Participant", note: "Predicts, reads results and standings" }
  ].map(r => {
    const on = role === r.id;
    return {
      label: r.label, note: r.note,
      rowStyle: `flex gap-[11px] items-start p-[12px_13px] rounded-[12px] cursor-pointer border ${on ? `border-[var(--color-brand)] bg-[var(--accent-surface)]` : 'border-[var(--surface-border)]'}`,
      radioStyle: `w-[19px] h-[19px] rounded-full flex-none mt-[1px] grid place-items-center border-[1.5px] ${on ? `border-[var(--color-brand)]` : 'border-[var(--surface-border-strong)]'}`,
      dotStyle: `w-[9px] h-[9px] rounded-full ${on ? `bg-[var(--color-brand)]` : 'bg-transparent'}`,
      pick: () => setRole(r.id)
    };
  });

  const memberCount = membersData?.data?.length || membersData?.total || displayMembers.filter((m: any) => !m.left).length;
  const pendingCount = displayRequests.filter((r: any) => r.state === 'pending').length;
  const inviteCount = dynamicInvites.filter((iv: any) => iv.state === 'active').length;

  const HERO: any = {
    members: [String(memberCount), "members", "in this league", "var(--nav-text)"],
    invites: [String(inviteCount), "invitations active", "", "var(--nav-text)"],
    requests: [String(pendingCount), "waiting on you", pendingCount > 0 ? "Oldest asked recently" : "All clear", pendingCount > 0 ? "var(--nav-warning)" : "var(--nav-text)"],
    lifecycle: [lifecycleState === 'in_progress' ? '▶' : lifecycleState === 'completed' ? '✓' : '○', lifecycleState.replace('_', ' '), `Created ${createdDate}`, "var(--nav-text)"]
  }[tab];

  const headSub: any = {
    members: `${memberCount} members`,
    invites: "Link and code invitations",
    requests: `${pendingCount} waiting on you`,
    lifecycle: `${lifecycleState.replace('_', ' ')} · Created ${createdDate}`
  }[tab];
  const onMembers = tab === "members" && !loading;
  const onInvites = tab === "invites" && !loading;
  const onRequests = tab === "requests" && !loading;
  const onLifecycle = tab === "lifecycle" && !loading;

  const rootNav = [["Home","home",""],["Predict","predict","25"],["Leagues","leagues",""]].map(it => {
    const [label, id, badge] = it;
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft:'7px', minWidth:'16px', height:'16px', padding:'0 4px', borderRadius:'8px', background:'var(--nav-accent)', color:'var(--nav-on-accent)', display:'inline-grid', placeItems:'center', font:"700 9px 'DM Sans',sans-serif" } : { display:'none' },
      style: { display:'flex', alignItems:'center', padding:'7px 13px', borderRadius:'9px', font:"600 12.5px 'DM Sans',sans-serif", cursor:'pointer', background: id==="leagues"?'var(--nav-fill)':'transparent', opacity: id==="leagues"?1:0.66 }
    };
  });

  const tabItem = (label: string, on: boolean, badge: string) => ({
    label, badge: badge||"",
    style: { display:'flex', alignItems:'center', padding:'0 13px', height:'43px', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:'12.5px', cursor:'pointer', borderBottom:`2px solid ${on?'var(--color-brand)':'transparent'}`, color: on?'var(--text-primary)':'var(--text-muted)' },
    badgeStyle: badge ? { marginLeft:'7px', minWidth:'16px', height:'16px', padding:'0 4px', borderRadius:'8px', background:'var(--color-danger)', color:'var(--color-on-brand)', display:'inline-grid', placeItems:'center', font:"700 9px 'DM Sans',sans-serif" } : { display:'none' }
  });

  const heroStyle = { padding: '20px 0 22px', background: 'var(--nav-surface)', color: 'var(--nav-text)', borderBottom: '1px solid rgba(255,255,255,.1)' };

  const handleCreateInvite = () => {
    createInviteMutation.mutate(100, {
      onSuccess: (response: any) => {
        const code = response?.data?.joinCode || null;
        setLatestInviteCode(code);
        setFresh(true);
        flash("Invitation created");
      },
      onError: () => {
        flash("Failed to create invitation");
      }
    });
  };

  const handleCopyInvite = () => {
    if (!latestInviteCode) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`https://topfour.app/j/${latestInviteCode}`);
    }
    flash("Copied invitation link to clipboard");
  };

  const sharedProps = {
    theme, tab, setTab, setSheet, setWho, setRole,
    headSub, HERO, loading, onMembers, onInvites, onRequests, onLifecycle,
    members, memberFilters, invites, requests, lifecycle, actions,
    fresh, setFresh, empty, invitesOpen, setInvitesOpen,
    sheetSpec, roles, toast,
    leagueName, leagueAbbr,
    memberCount, inviteCount, pendingCount,
    heroRole: (league?.membership?.role || 'owner').toUpperCase(),
    inviteCode: latestInviteCode,
    createInviteAction: handleCreateInvite,
    copyInviteAction: handleCopyInvite
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">


      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueAdminMobile params={params} {...sharedProps} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeagueAdminDesktop
          params={params}
          rootNav={rootNav}
          avatarInitials={(user?.displayName || '??').substring(0, 2).toUpperCase()}
          avatarName={user?.displayName || ''}
          contextTabs={[tabItem("Overview",false,""),tabItem("Fixtures",false,"6"),tabItem("Table",false,""),tabItem("Questions",false,"2"),tabItem("More",true,"")]}
          heroStyle={heroStyle}
          heroBig={HERO[0]}
          heroTone={HERO[3]}
          heroLabel={HERO[1]}
          heroSub={HERO[2]}
          {...sharedProps}
        />
      </div>
    </div>
  );
}
