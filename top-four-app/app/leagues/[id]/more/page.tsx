'use client';

import { useState } from 'react';
import { LeagueMoreMobile } from '../../../components/leagues/LeagueMoreMobile';
import { LeagueMoreDesktop } from '../../../components/leagues/LeagueMoreDesktop';
import { useLeague, useJoinRequests } from '@/hooks/api/useLeagues';
import { useCustomQuestions } from '@/hooks/api/useCustomQuestions';
import { useAuth } from '@/context/auth-context';

export default function LeagueMorePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { data: league } = useLeague(params.id);
  const { data: requestsData } = useJoinRequests(params.id);
  const { data: questionsPage } = useCustomQuestions(params.id);

  const [theme] = useState<'light' | 'dark'>('dark');

  const role = league?.membership?.role || 'participant';
  const owner = role === "owner";
  const admin = role === "admin";
  const runs = owner || admin;
  const done = league?.lifecycleState === 'completed';

  const memberCount = league?.memberCount || 1;
  const leagueName = league?.name || 'League';

  const openQuestionsCount = questionsPage?.data?.filter(q => q.phase === 'open').length || 0;
  const pendingRequestsCount = Array.isArray(requestsData)
    ? requestsData.filter((r: any) => r.state === 'pending').length
    : Array.isArray(requestsData?.items)
    ? requestsData.items.filter((r: any) => r.state === 'pending').length
    : 0;

  const THIS_LEAGUE = [
    {
      glyph: "?",
      title: "Questions",
      note: done ? "Season questions, all resolved" : "Season-long questions, scored separately from fixtures",
      badge: done ? "" : openQuestionsCount > 0 ? `${openQuestionsCount} OPEN` : "",
      tone: done ? "" : "live",
      href: `/leagues/${params.id}/questions`
    },
    { glyph: "§", title: "Rules", note: "Markets, points, tiebreakers and deadlines — frozen at publication", href: `/leagues/${params.id}/rules` },
    { glyph: "◍", title: "Members", note: done ? `${memberCount} members · final roster` : `${memberCount} members · admin settings`, href: `/leagues/${params.id}/admin` }
  ];

  const RUNNING_IT = [
    { glyph: "↗", title: "Invitation links", note: "Share, or revoke a link you have shared", badge: "LIVE", href: `/leagues/${params.id}/admin` },
    {
      glyph: "✓",
      title: "Join requests",
      note: "People waiting for you or an admin to approve",
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} WAITING` : "",
      tone: pendingRequestsCount > 0 ? "live" : "",
      href: `/leagues/${params.id}/admin`
    },
    { glyph: "⚙", title: "League settings", note: "Name, description and whether new members need approval", href: `/leagues/${params.id}/rules` }
  ];

  const ENDING_OWNER = [
    { glyph: "◆", title: done ? "Archive this league" : "Complete this league", note: done ? "Tidy it out of active lists. Nothing is deleted and the table stays readable." : "Available once every fixture and question has settled", tone: "quiet", href: `/leagues/${params.id}/admin` },
    { glyph: "✕", title: "Cancel this league", note: `Voids every prediction and every point, for all ${memberCount} members`, tone: "danger", href: `/leagues/${params.id}/admin` }
  ];
  
  const ENDING_MEMBER = [
    { glyph: "→", title: "Leave this league", note: "Your points and answers stay in the table. You would need a fresh invitation to return.", tone: "danger" }
  ];

  // Mobile formatting logic
  const mkMobile = (r: any, i: number, a: any[]) => ({
    title: r.title, note: r.note, glyph: r.glyph, badge: r.badge || "",
    href: r.href,
    titleColor: r.tone === "danger" ? "var(--danger-text)" : "var(--text-primary)",
    iconStyle: `w-[32px] h-[32px] rounded-[9px] flex-none grid place-items-center font-heading font-bold text-[13px] ${r.tone === "danger" ? 'bg-[var(--surface-subtle)] text-[var(--danger-text)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]'}`,
    badgeStyle: r.badge ? `font-heading font-bold text-[8.5px] tracking-[0.07em] p-[2px_7px] rounded-[4px] flex-none ${r.tone === "live" ? 'bg-[var(--accent-surface)] text-[var(--accent-text)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}` : "hidden",
    rowStyle: `flex items-center gap-[13px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${i === a.length - 1 ? 'border-b' : ''}`
  });

  const groupsMobile = [];
  groupsMobile.push({ label: "THIS LEAGUE", labelColor: "var(--text-muted)", rows: THIS_LEAGUE.map(mkMobile) });
  if (runs) groupsMobile.push({ label: "RUNNING IT", labelColor: "var(--text-muted)", rows: RUNNING_IT.map(mkMobile) });
  groupsMobile.push({
    label: owner ? "ENDING IT" : "LEAVING",
    labelColor: "var(--danger-text)",
    rows: (owner ? ENDING_OWNER : ENDING_MEMBER).map(mkMobile)
  });

  // Desktop formatting logic
  const mkDesktop = (r: any, i: number, a: any[]) => ({
    title: r.title, note: r.note, glyph: r.glyph, badge: r.badge || "", href: r.href,
    titleColor: r.tone === "danger" ? "var(--danger-text)" : "var(--text-primary)",
    iconStyle: { width: '32px', height: '32px', borderRadius: '9px', flex: 'none', display: 'grid', placeItems: 'center', font: "700 13px 'DM Sans',sans-serif", background: 'var(--surface-subtle)', color: r.tone === "danger" ? "var(--danger-text)" : "var(--text-secondary)" },
    badgeStyle: r.badge ? { font: "700 8.5px 'DM Sans',sans-serif", letterSpacing: '.07em', padding: '2px 7px', borderRadius: '4px', flex: 'none', background: r.tone === "live" ? 'var(--accent-surface)' : 'var(--surface-subtle)', color: r.tone === "live" ? 'var(--accent-text)' : 'var(--text-muted)' } : { display: 'none' },
    chevronStyle: { font: "400 17px 'DM Sans',sans-serif", color: 'var(--text-muted)', flex: 'none' },
    rowStyle: { display: 'flex', alignItems: 'center', gap: '13px', padding: '15px 4px', cursor: 'pointer', borderBottom: '1px solid var(--surface-border)', boxShadow: r.tone === "danger" ? 'inset 3px 0 0 0 var(--color-danger)' : 'none' }
  });

  const groupsDesktop = [{ label: "THIS LEAGUE", rows: THIS_LEAGUE.map(mkDesktop), wrapStyle: { marginTop: '0px' } }];
  if (runs) groupsDesktop.push({ label: "RUNNING IT", rows: RUNNING_IT.map(mkDesktop), wrapStyle: { marginTop: '22px' } });

  const roleLabel = owner ? "OWNER" : admin ? "ADMIN" : "PARTICIPANT";
  const lifecycleLabel = done ? "COMPLETED" : "IN PROGRESS";
  const footNote = done
    ? "A completed league is read-only. Everything here stays readable, and the table never moves again."
    : "Rules froze when the league was published, because members answered under them. Only the name, invitations and the approval setting can still change.";

  const IconMap: Record<string, any> = {
    overview: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
        <path d="M9.5 20v-6h5v6" />
      </svg>
    ),
    ball: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="8" />
        <path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" />
      </svg>
    ),
    table: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M5 19V11M12 19V5M19 19V8" />
      </svg>
    ),
    more: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" style={{ display: 'block' }}>
        <path d="M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      </svg>
    )
  };

  const tabs = [
    { label: "OVERVIEW", ic: "overview", on: false, b: "" },
    { label: "FIXTURES", ic: "ball", on: false, b: done ? "" : "" },
    { label: "TABLE", ic: "table", on: false, b: "" },
    { label: "MORE", ic: "more", on: true, b: "" }
  ];

  const rootNav = [["Home","home",""],["Predict","predict",""],["Leagues","leagues",""]].map((it) => {
    const label = it[0], id = it[1], badge = it[2];
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', background: id === "leagues" ? 'var(--nav-fill)' : 'transparent', opacity: id === "leagues" ? 1 : 0.66 } 
    };
  });

  const tabItem = (label: string, on: boolean, badge: string) => ({
    label, badge: badge || "",
    style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' },
    badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--color-danger)', color: 'var(--color-on-brand)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' }
  });

  const propsMobile = {
    theme, params, owner, admin, runs, done,
    groups: groupsMobile, roleLabel, lifecycleLabel, footNote, IconMap, tabs,
    leagueName
  };

  const propsDesktop = {
    theme, rootNav, avatarInitials: (user?.displayName || "KA").substring(0, 2).toUpperCase(), avatarName: user?.displayName || "Kolade", showContext: true,
    contextTabs: [tabItem("Overview", false, ""), tabItem("Fixtures", false, ""), tabItem("Table", false, ""), tabItem("Questions", false, openQuestionsCount > 0 ? String(openQuestionsCount) : ""), tabItem("More", true, "")],
    headSub: runs ? "Everything the tabs do not carry, plus what you can change" : "Everything the tabs do not carry",
    roleLabel,
    roleChipStyle: { font: "700 9.5px 'DM Sans',sans-serif", letterSpacing: '.09em', padding: '5px 10px', borderRadius: '6px', flex: 'none', background: 'var(--surface-subtle)', color: 'var(--text-secondary)' },
    lifecycleLabel,
    lifecycleStyle: { font: "600 9.5px 'DM Sans',sans-serif", letterSpacing: '.07em', padding: '3px 9px', borderRadius: '999px', background: done ? 'var(--surface-subtle)' : 'var(--accent-surface)', color: done ? 'var(--text-muted)' : 'var(--accent-text-strong)' },
    mainGroups: groupsDesktop, endLabel: owner ? "ENDING IT" : "LEAVING", endRows: (owner ? ENDING_OWNER : ENDING_MEMBER).map(mkDesktop),
    footNote,
    leagueName,
    memberCount,
    params
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueMoreMobile {...propsMobile} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeagueMoreDesktop {...propsDesktop} />
      </div>
    </div>
  );
}
