'use client';

import { useState } from 'react';
import { MeMobile } from '../components/me/MeMobile';
import { MeDesktop } from '../components/me/MeDesktop';
import { useAuth } from '@/context/auth-context';
import { useMyLeagues } from '@/hooks/api/useLeagues';
import { useOwnPointsHistory } from '@/hooks/api/usePoints';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/api/useNotifications';

const CLUB: Record<string, string> = { PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f", SS: "#1746a2", FC: "#b7152b", UN: "#0e7a5f", NB: "#7f56d9", WW: "#c8182f" };

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export default function MePage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: leaguesData } = useMyLeagues();
  const { data: prefData } = useNotificationPreferences();
  const { mutate: updatePref } = useUpdateNotificationPreferences();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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

  const emailUnverified = user ? user.emailVerified === false : false;
  const noGoogle = !!user?.signInMethods && !user.signInMethods.includes('google');

  // The points-history endpoint is per-league, but this screen is
  // account-wide -- show the user's most recently active league's form
  // rather than nothing at all. Ledger entries carry no explicit "round"
  // number, so group by calendar day as a reasonable stand-in (fixtures in
  // the same round cluster on the same day or weekend).
  const primaryLeague = leaguesData?.items.find(l => l.lifecycleState === 'in_progress' || l.lifecycleState === 'published')
    || leaguesData?.items[0];
  const { data: historyPage } = useOwnPointsHistory(primaryLeague?.id || '');

  const HISTORY = (() => {
    if (!historyPage?.data?.length) return [] as { label: string; v: number; corrected?: boolean }[];
    const byDay = new Map<string, { v: number; corrected: boolean }>();
    for (const entry of historyPage.data) {
      const day = new Date(entry.occurredAt).toISOString().slice(0, 10);
      const existing = byDay.get(day) || { v: 0, corrected: false };
      existing.v += entry.delta;
      if (entry.kind === 'correction') existing.corrected = true;
      byDay.set(day, existing);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([day, { v, corrected }]) => ({
        label: new Date(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        v: Math.max(v, 0), corrected
      }));
  })();

  const max = HISTORY.length > 0 ? Math.max(...HISTORY.map(h => h.v)) : 1;
  // Mobile chart (70px max height)
  const chartMobile = HISTORY.map(h => ({
    label: h.label, corrected: h.corrected,
    barStyle: `w-full rounded-t-[4px] ${h.corrected ? 'bg-[var(--state-provisional)]' : 'bg-[var(--color-brand)]'}`,
    height: Math.round(h.v / max * 70)
  }));
  // Desktop chart (150px max height, show values)
  const chartDesktop = HISTORY.map(h => ({
    label: h.label, corrected: h.corrected, value: String(h.v),
    barStyle: `w-full rounded-t-[5px] ${h.corrected ? 'bg-[var(--state-provisional)]' : 'bg-[var(--color-brand)]'}`,
    barHeight: Math.round(h.v / max * 110)
  }));

  const liveLeagues = leaguesData?.items.map((l, i, a) => ({
    id: l.id,
    crest: l.name.substring(0, 2).toUpperCase(),
    bg: CLUB[l.name.substring(0, 2).toUpperCase()] || CLUB.PP,
    name: l.name,
    // The league-list endpoint's ownStanding carries position/points only --
    // no member count, and fetching each league's dashboard just for this
    // subtitle would be an N-request cost for a cosmetic line. Show the real
    // position on its own rather than pairing it with a fake or expensive
    // denominator.
    meta: l.ownStanding?.position ? ordinal(l.ownStanding.position) : (l.competitions?.length ? l.competitions[0].displayName : ''),
    points: String(l.ownStanding?.totalPoints || '-'),
    isLast: i === a.length - 1
  }));

  const leagues = liveLeagues || [];
  const totalPoints = (leaguesData?.items || []).reduce((sum, l) => sum + (l.ownStanding?.totalPoints || 0), 0);
  const leagueCount = leaguesData?.items.length || 0;

  const emailDisplay = user?.email || "";
  const nameDisplay = user?.displayName || "";

  const ACCOUNT = [
    { title: "Display name", note: `${nameDisplay} · shown on every leaderboard`, href: "/me/name" },
    { title: "Change password", note: "Needs your current one. This session stays open, others do not.", href: "/me/password" },
    { title: "Email address", note: emailUnverified ? `${emailDisplay} · not yet verified` : `${emailDisplay} · verified`, badge: emailUnverified ? "UNVERIFIED" : "", tone: emailUnverified ? "warn" : "", href: "/me/email" },
    { title: "Google", note: noGoogle ? "Not linked · sign in with your password only" : `Linked to ${emailDisplay}` }
  ];

  const EMAILS = [
    { title: "Account security", note: "Sign-ins, password and email changes. Always sent.", locked: true }
  ];

  const DANGER = [
    { title: "Sign out", note: "This device only. Your other sessions stay signed in.", action: signOut }
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
    { label: "SIGNING OUT", labelColor: "var(--text-muted)", rows: DANGER.map(mkRow) }
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
          isLoading={authLoading}
          prefs={prefs}
          setPrefs={setPrefs}
          chart={chartMobile}
          leagues={leagues}
          totalPoints={totalPoints}
          leagueCount={leagueCount}
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
          isLoading={authLoading}
          prefs={prefs}
          setPrefs={setPrefs}
          chart={chartDesktop}
          leagues={leagues}
          totalPoints={totalPoints}
          leagueCount={leagueCount}
          rootNav={rootNav}
          accountRows={accountRows}
          emailPrefs={emailPrefs}
          emailUnverified={emailUnverified}
          noGoogle={noGoogle}
          signOut={signOut}
        />
      </div>
    </div>
  );
}
