'use client';

import { useState, useEffect } from 'react';
import { LeagueAdminMobile } from '../../../components/leagues/LeagueAdminMobile';
import { LeagueAdminDesktop } from '../../../components/leagues/LeagueAdminDesktop';
import { useLeagueMembers, useJoinRequests, useUpdateMemberRole, useRemoveMember, useProcessJoinRequest } from '@/hooks/api/useLeagues';
import { useParams } from 'next/navigation';

const BRAND = "var(--color-brand)";

const MEMBERS = [
  { name: "Kolade", role: "Owner", initials: "KA", points: 846, rank: "24th", you: true, joined: "Owner since 2 Aug" },
  { name: "Marcus Bell", role: "Admin", initials: "MB", points: 1042, rank: "1st", joined: "Joined 3 Aug" },
  { name: "Priya Raman", role: "Admin", initials: "PR", points: 998, rank: "2nd", joined: "Joined 3 Aug" },
  { name: "Tomás Oliveira", role: "Participant", initials: "TO", points: 961, rank: "3rd", joined: "Joined 4 Aug" },
  { name: "Hannah Whitfield", role: "Participant", initials: "HW", points: 40, rank: "126th", joined: "Joined 6 days ago" },
  { name: "Dan Kowalski", role: "Participant", initials: "DK", points: 0, rank: "128th", joined: "Joined yesterday" },
  { name: "Ruth Adeyemi", role: "Former", initials: "RA", points: 512, rank: "—", left: true, joined: "Left 9 Aug · history kept" }
];

const INVITES = [
  { label: "Work group", meta: "Created 3 Aug · 14 of 25 used", state: "active" },
  { label: "Five-a-side lads", meta: "Created 4 Aug · 6 used · no limit", state: "active" },
  { label: "Twitter thread", meta: "Revoked 6 Aug · 2 had already joined", state: "revoked" },
  { label: "Family", meta: "Expired 8 Aug · never used", state: "expired" }
];

const REQUESTS = [
  { name: "Sofia Marchetti", initials: "SM", meta: "Requested 20 minutes ago · via link", state: "pending" },
  { name: "Ade Balogun", initials: "AB", meta: "Requested yesterday · via short code", state: "pending" },
  { name: "Elliot Shaw", initials: "ES", meta: "Requested 2 days ago · already a member", state: "already" },
  { name: "Nina Petrova", initials: "NP", meta: "Approved this morning by Marcus", state: "approved" }
];

const LIFECYCLE = [
  { label: "Draft", note: "Created 2 Aug", done: true },
  { label: "Published", note: "3 Aug · rules frozen", done: true },
  { label: "In progress", note: "First deadline passed 9 Aug", current: true },
  { label: "Completed", note: "When every fixture and question settles", future: true },
  { label: "Archived", note: "Optional, after completion", future: true }
];

export default function LeagueAdminPage() {
  const params = useParams() as { id: string };
  const { data: membersData, isLoading: loadingMembers } = useLeagueMembers(params.id);
  const { data: requestsData, isLoading: loadingRequests } = useJoinRequests(params.id);
  
  const updateRoleMutation = useUpdateMemberRole(params.id);
  const removeMemberMutation = useRemoveMember(params.id);
  const processRequestMutation = useProcessJoinRequest(params.id);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [tab, setTab] = useState<'members' | 'invites' | 'requests' | 'lifecycle'>('members');
  const [dataState, setDataState] = useState<'ready' | 'loading' | 'empty'>('ready');
  const [sheet, setSheet] = useState<string | null>(null);
  const [who, setWho] = useState<string>("");
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const [role, setRole] = useState("Admin");
  const [filter, setFilter] = useState("All");
  const [fresh, setFresh] = useState(false);
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

  const dynamicMembers = (membersData?.data || []).map((m: any) => ({
    id: m.id,
    name: m.user?.displayName || "Unknown",
    role: m.role === 'OWNER' ? 'Owner' : m.role === 'ADMIN' ? 'Admin' : 'Participant',
    initials: (m.user?.displayName || "U").substring(0, 2).toUpperCase(),
    points: 0, // In MVP, assume 0 or fetch from standings
    rank: "—",
    you: false, // Could check if m.userId === currentUser.id
    left: m.state === 'LEFT',
    joined: `Joined recently`
  }));
  const displayMembers = dynamicMembers.length > 0 ? dynamicMembers : MEMBERS;

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

  const invites = INVITES.map((iv: any, i, arr) => {
    const active = iv.state === "active";
    return {
      label: iv.label, meta: iv.meta, active,
      rowStyle: `flex items-start gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${active ? '' : 'opacity-[0.55]'}`,
      chip: active ? "ACTIVE" : iv.state === "revoked" ? "REVOKED" : "EXPIRED",
      chipStyle: active ? "bg-[var(--color-success)] text-[var(--tf-white)]" : "border border-[var(--surface-border-strong)] text-[var(--text-muted)]",
      action: active ? "REVOKE" : "",
      actionStyle: `font-heading font-bold text-[10px] tracking-[0.05em] text-[var(--danger-text)] cursor-pointer mt-[7px] ${active ? '' : 'hidden'}`
    };
  });

  const dynamicRequests = (requestsData?.data || []).map((r: any) => ({
    id: r.id,
    name: r.user?.displayName || "Unknown",
    initials: (r.user?.displayName || "U").substring(0, 2).toUpperCase(),
    meta: "Requested recently",
    state: r.state === 'PENDING' ? 'pending' : r.state === 'APPROVED' ? 'approved' : 'rejected'
  }));
  const displayRequests = dynamicRequests.length > 0 ? dynamicRequests : REQUESTS;

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

  const lifecycle = LIFECYCLE.map((l: any, i) => ({
    label: l.label, note: l.note,
    dotStyle: `w-[11px] h-[11px] rounded-full flex-none mt-[4px] ${l.current ? `bg-[${BRAND}] shadow-[0_0_0_4px_var(--accent-surface)]` : l.done ? "bg-[var(--color-success)]" : "border-[1.5px] border-[var(--surface-border-strong)]"}`,
    lineStyle: `flex-1 w-[1.5px] bg-[var(--surface-border)] ${i === LIFECYCLE.length - 1 ? 'hidden' : ''}`,
    textWrapStyle: `flex-1 ${i === LIFECYCLE.length - 1 ? 'pb-0' : 'pb-[18px]'}`,
    labelStyle: `font-heading font-[650] text-[13.5px] tracking-[-0.2px] ${l.future ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`
  }));

  const actions = [
    { id: "clone", title: "Clone into a new league", note: "Same competitions and points, back in draft. The original keeps running." },
    { id: "archive", title: "Archive", note: "Only once every fixture and question is final. History stays readable.", muted: true },
    { id: "cancel", title: "Cancel this league", note: "Ends it permanently. Anything due after the cutoff is voided.", danger: true }
  ].map((a: any, i, arr) => ({
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
          updateRoleMutation.mutate({ membershipId: targetMemberId, role: role.toUpperCase() }, {
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
    self: { title: "You own this league", body: "An owner has to hand the league over before leaving it. Everything else here needs somebody else selected first.", primary: "Transfer ownership", secondary: "Leave league" },
    former: { title: targetWho + " has left", body: "Their history is kept and their predictions stay hidden. Rejoining restores the same points — leaving cannot reset a score.", primary: "Invite them back" },
    clone: { title: "Clone Premier Predictors?", body: "You get a fresh draft with the same competitions, markets and points. Members, invitations and predictions do not come with it.", primary: "Create the draft" },
    archive: { title: "Not finished yet", body: "Archiving waits until every fixture and custom question is final or void. 146 fixtures and 2 questions are still open.", primary: "Got it" },
    cancel: { title: "Cancel Premier Predictors?", body: "This cannot be undone and the league cannot resume.", list: ["Fixtures and questions due before now still settle normally.", "Everything due later is voided — no points either way.", "New predictions, answers and questions are refused from the moment you confirm."], primary: "Cancel the league", danger: true }
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

  const HERO: any = {
    members: ["128", "of 10,000 members", "1 owner · 2 admins · 125 playing", "var(--nav-text)"],
    invites: ["2", "invitations active", "20 of 25 places used across them", "var(--nav-text)"],
    requests: ["2", "waiting on you", "Oldest asked yesterday", "var(--nav-warning)"],
    lifecycle: ["7", "days in progress", "Published 3 Aug · rules frozen since", "var(--nav-text)"]
  }[tab];

  const headSub: any = { members: "128 members · 2 admins", invites: "Link and code invitations", requests: "2 waiting on you", lifecycle: "In progress since 9 Aug" }[tab];
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

  const sharedProps = {
    theme, tab, setTab, setSheet, setWho, setRole,
    headSub, HERO, loading, onMembers, onInvites, onRequests, onLifecycle,
    members, memberFilters, invites, requests, lifecycle, actions,
    fresh, setFresh, empty, invitesOpen, setInvitesOpen,
    sheetSpec, roles, toast
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
          avatarInitials="KA"
          avatarName="Kolade"
          contextTabs={[tabItem("Overview",false,""),tabItem("Fixtures",false,"6"),tabItem("Table",false,""),tabItem("Questions",false,"2"),tabItem("More",true,"")]}
          heroStyle={heroStyle}
          heroBig={HERO[0]}
          heroTone={HERO[3]}
          heroLabel={HERO[1]}
          heroSub={HERO[2]}
          heroRole="OWNER"
          {...sharedProps}
        />
      </div>
    </div>
  );
}
