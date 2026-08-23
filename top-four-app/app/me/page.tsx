'use client';

import { useState } from 'react';
import { MeMobile } from '../components/me/MeMobile';
import { MeDesktop } from '../components/me/MeDesktop';
import { useAuth } from '@/context/auth-context';
import { useMyLeagues } from '@/hooks/api/useLeagues';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/api/useNotifications';

const CLUB: Record<string, string> = { PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f", SS: "#1746a2", FC: "#b7152b", UN: "#0e7a5f", NB: "#7f56d9", WW: "#c8182f" };

// Chart history will come from API in future
const HISTORY: { label: string; v: number; corrected?: boolean }[] = [];

export default function MePage() {
  const { user, signOut } = useAuth();
  const { data: leaguesData } = useMyLeagues();
  const { data: prefData } = useNotificationPreferences();
  const { mutate: updatePref } = useUpdateNotificationPreferences();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [state, setState] = useState<'live' | 'pendingemail' | 'nogoogle' | 'loading'>('live');

  const prefs = {
    reminders: prefData?.roundReminder ?? true,
    questions: prefData?.customQuestionAdmin ?? true,
  };

  const setPrefs = (update: any) => {
    let newPrefs;
    if (typeof update === 'function') {
      newPrefs = update(prefs);
    } else {
      newPrefs = { ...prefs, ...update };
    }
    updatePref({
      roundReminder: newPrefs.reminders,
      customQuestionAdmin: newPrefs.questions,
    });
  };

  const pendingEmail = state === "pendingemail";
  const noGoogle = state === "nogoogle";

  const max = HISTORY.length > 0 ? Math.max(...HISTORY.map(h => h.v)) : 1;
  // Mobile chart (70px max height)
  const chartMobile = HISTORY.map(h => ({
    label: h.label, corrected: h.corrected,
    barStyle: `w-full rounded-t-[4px] bg-[${h.corrected ? 'var(--state-provisional)' : 'var(--color-brand)'}]`,
    height: Math.round(h.v / max * 70)
  }));
  // Desktop chart (150px max height, show values)
  const chartDesktop = HISTORY.map(h => ({
    label: h.label, corrected: h.corrected, value: String(h.v),
    barStyle: `w-full rounded-t-[5px] ${h.corrected ? 'bg-[var(--state-provisional)]' : 'bg-[var(--color-brand)]'}`,
    barHeight: Math.round(h.v / max * 110)
  }));

  const liveLeagues = leaguesData?.items.map((l, i, a) => ({
    crest: l.name.substring(0, 2).toUpperCase(),
    bg: CLUB[l.name.substring(0, 2).toUpperCase()] || CLUB.PP,
    name: l.name,
    meta: `${l.ownStanding?.position || '-'} of ${l.competitions?.length ? l.competitions[0].displayName : '?' }`, // Mocking member count
    points: String(l.ownStanding?.totalPoints || '-'),
    isLast: i === a.length - 1
  }));

  const leagues = liveLeagues || [];

  const emailDisplay = user?.email || "";
  const nameDisplay = user?.displayName || "";

  const ACCOUNT = [
    { title: "Display name", note: `${nameDisplay} · shown on every leaderboard`, href: "/me/name" },
    { title: "Change password", note: "Needs your current one. This session stays open, others do not.", href: "/me/password" },
    { title: "Email address", note: pendingEmail ? `${emailDisplay} not yet confirmed` : `${emailDisplay} · verified`, badge: pendingEmail ? "PENDING" : "", tone: pendingEmail ? "warn" : "", href: "/me/email" },
    { title: "Google", note: noGoogle ? "Not linked · sign in with your password only" : `Linked to ${emailDisplay}` }
  ];

  const EMAILS = [
    { title: "Account security", note: "Sign-ins, password and email changes. Always sent.", locked: true }
  ];

  const DANGER = [
    { title: "Sign out", note: "This device only. Your other sessions stay signed in.", action: signOut },
    { title: "Delete account", note: "Leagues you own need a new owner first. Your predictions stay, without your name.", tone: "danger" }
  ];

  const mkRow = (r: any, i: number, a: any[]) => {
    const hasSwitch = !!r.toggle || r.locked;
    const on = r.locked ? true : !!prefs[r.toggle as keyof typeof prefs];
    return {
      title: r.title, note: r.note, badge: r.badge || "",
      titleColor: r.tone === "danger" ? "var(--danger-text)" : r.locked ? "var(--text-muted)" : "var(--text-primary)",
      hasSwitch, on, toggleId: r.toggle, locked: r.locked,
      action: r.action, href: r.href,
      isLast: i === a.length - 1
    };
  };

  const groups = [
    { label: "ACCOUNT", labelColor: "var(--text-muted)", rows: ACCOUNT.map(mkRow) },
    { label: "SIGNING OUT AND LEAVING", labelColor: "var(--danger-text)", rows: DANGER.map(mkRow) }
  ];

  // Desktop-specific row formatters
  const accountRows = ACCOUNT.map((r: any) => ({
    title: r.title, note: r.note, badge: r.badge || "",
    titleColor: r.tone === "danger" ? "var(--danger-text)" : "var(--text-primary)", href: r.href
  }));

  const emailPrefs = EMAILS.map((r: any) => {
    const on = r.locked ? true : !!prefs[r.toggle as keyof typeof prefs];
    return {
      label: r.title, note: r.note, on, locked: r.locked, toggleId: r.toggle,
      color: r.locked ? "var(--text-muted)" : "var(--text-primary)"
    };
  });

  const IconMap: Record<string, any> = {
    home: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" /><path d="M9.5 20v-6h5v6" /></svg>,
    ball: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="8" /><path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" /></svg>,
    leagues: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 3 21 8.5v7L12 21l-9-5.5v-7L12 3Z" /></svg>,
    me: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
  };

  const tabs = [
    { label: "HOME", ic: "home", on: false, badge: "" },
    { label: "PREDICT", ic: "ball", on: false, badge: "" },
    { label: "LEAGUES", ic: "leagues", on: false, badge: "" },
    { label: "ME", ic: "me", on: true, badge: "" }
  ];

  const rootNav = [["Home","home",""],["Predict","predict",""],["Leagues","leagues",""]].map(it => {
    const [label, id, badge] = it;
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft:'7px', minWidth:'16px', height:'16px', padding:'0 4px', borderRadius:'8px', background:'var(--nav-accent)', color:'var(--nav-on-accent)', display:'inline-grid', placeItems:'center', font:"700 9px 'DM Sans',sans-serif" } : { display:'none' },
      style: { display:'flex', alignItems:'center', padding:'7px 13px', borderRadius:'9px', font:"600 12.5px 'DM Sans',sans-serif", cursor:'pointer', background: id==="me"?'var(--nav-fill)':'transparent', opacity: id==="me"?1:0.66 }
    };
  });

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">

      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <MeMobile
          user={user}
          theme={theme}
          state={state}
          prefs={prefs}
          setPrefs={setPrefs}
          chart={chartMobile}
          leagues={leagues}
          groups={groups}
          IconMap={IconMap}
          tabs={tabs}
          signOut={signOut}
        />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <MeDesktop
          user={user}
          theme={theme}
          state={state}
          prefs={prefs}
          setPrefs={setPrefs}
          chart={chartDesktop}
          leagues={leagues}
          rootNav={rootNav}
          accountRows={accountRows}
          emailPrefs={emailPrefs}
          pendingEmail={pendingEmail}
          noGoogle={noGoogle}
          signOut={signOut}
        />
      </div>
    </div>
  );
}
