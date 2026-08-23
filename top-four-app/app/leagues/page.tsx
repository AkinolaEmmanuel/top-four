'use client';

import { useState, useMemo } from 'react';
import { LeaguesMobile } from '../components/leagues/LeaguesMobile';
import { LeaguesDesktop } from '../components/leagues/LeaguesDesktop';
import { useMyLeagues } from '@/hooks/api/useLeagues';
import { useAuth } from '@/context/auth-context';

const CLUB: Record<string, string> = {
  PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f", E28: "#667085",
  SF: "#b45309", A24: "#0e7a5f", O24: "#7f56d9", SS: "#1746a2",
  FC: "#b7152b", UN: "#0e7a5f", NB: "#7f56d9", WW: "#c8182f"
};

export default function LeaguesPage() {
  const { user } = useAuth();
  const { data: leaguesData, isLoading: leaguesLoading } = useMyLeagues();

  const [state, setState] = useState<'live' | 'capacity' | 'loading' | 'empty'>('live');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [filter, setFilter] = useState('All');

  const isLoading = leaguesLoading || state === "loading";
  const isEmpty = (leaguesData && leaguesData.items.length === 0) || state === "empty";
  const isReady = !isLoading && !isEmpty;
  const atCapacity = state === "capacity";
  const hasFilters = isReady;

  const SECTIONS = [["Playing", "playing"], ["Draft", "draft"], ["Waiting on approval", "pending"], ["Past", "past"]];
  const visible = SECTIONS.filter(([label]) => filter === "All" || filter === label || (filter === "Pending" && label === "Waiting on approval"));

  const rowMap = (r: any, i: number, a: any[]) => ({
    crest: r.crest, crestBg: r.bg, name: r.name, meta: r.meta,
    role: r.role || "", value: r.value, sub: r.sub || "", action: r.action, muted: r.muted,
    isLast: i === a.length - 1
  });

  const leagues = useMemo(() => {
    const cats: Record<string, any[]> = { playing: [], draft: [], pending: [], past: [] };
    if (!leaguesData) return cats;
    
    leaguesData.items.forEach(league => {
      const item = {
        crest: league.name.substring(0, 2).toUpperCase(),
        bg: CLUB[league.name.substring(0, 2).toUpperCase()] || "#0879bf",
        name: league.name,
        meta: league.competitions?.map(c => c.displayName).join(', ') || '',
        role: (league.membership?.role === 'admin' || league.membership?.role === 'owner') ? 'Admin' : '',
        value: league.ownStanding ? league.ownStanding.position : "-",
        sub: "pts",
        action: (league.membership?.role === 'admin' || league.membership?.role === 'owner') ? "Manage" : "Leave",
        muted: league.lifecycleState === 'archived' || league.lifecycleState === 'cancelled'
      };

      if (league.lifecycleState === 'draft') {
        cats.draft.push(item);
      } else if (league.lifecycleState === 'published' || league.lifecycleState === 'in_progress' || league.lifecycleState === 'completed') {
        cats.playing.push(item);
      } else if (league.lifecycleState === 'archived' || league.lifecycleState === 'cancelled') {
        cats.past.push(item);
      } else if (league.membership?.state === 'pending' as any) {
        cats.pending.push({...item, action: true, meta: 'Pending approval', value: 'Withdraw', sub: ''});
      } else {
        cats.playing.push(item);
      }
    });
    return Object.fromEntries(
        Object.entries(cats).map(([k, v]) => [k, v.map(rowMap)])
    );
  }, [leaguesData]);

  const groups = visible.map(([label, key]) => ({
    label, count: String(leagues[key].length),
    rows: leagues[key].map(rowMap)
  })).filter(g => g.rows.length > 0);

  const n = { playing: leagues.playing.length, draft: leagues.draft.length, pending: leagues.pending.length, past: leagues.past.length };
  const counts: Record<string, string> = {
    All: String(n.playing + n.draft + n.pending + n.past),
    Playing: String(n.playing),
    Draft: String(n.draft),
    Pending: String(n.pending),
    Past: String(n.past)
  };

  const used = n.playing + n.draft;
  const filters = ["All", "Playing", "Draft", "Pending", "Past"].map(f => {
    const on = filter === f;
    return { label: f, count: counts[f], pick: () => setFilter(f), on };
  });

  const capacityLabel = atCapacity ? "20 of 20 places used" : used === 0 ? "No leagues joined" : `${used} of 20 places used`;
  const skeletons = [{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }];

  const IconMap: Record<string, any> = {
    home: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" /><path d="M9.5 20v-6h5v6" /></svg>,
    ball: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="8" /><path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" /></svg>,
    leagues: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 3 21 8.5v7L12 21l-9-5.5v-7L12 3Z" /></svg>,
    me: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
  };

  const tabs = [
    { label: "HOME", ic: "home", on: false, badge: "" },
    { label: "PREDICT", ic: "ball", on: false, badge: "" },
    { label: "LEAGUES", ic: "leagues", on: true, badge: "" },
    { label: "ME", ic: "me", on: false, badge: "" }
  ];

  const rootNav = [["Home","home",""],["Predict","predict",""],["Leagues","leagues",""]].map(it => {
    const [label, id, badge] = it;
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft:'7px', minWidth:'16px', height:'16px', padding:'0 4px', borderRadius:'8px', background:'var(--nav-accent)', color:'var(--nav-on-accent)', display:'inline-grid', placeItems:'center', font:"700 9px 'DM Sans',sans-serif" } : { display:'none' },
      style: { display:'flex', alignItems:'center', padding:'7px 13px', borderRadius:'9px', font:"600 12.5px 'DM Sans',sans-serif", cursor:'pointer', background: id==="leagues"?'var(--nav-fill)':'transparent', opacity: id==="leagues"?1:0.66 }
    };
  });

  const sharedProps = {
    user,
    theme, state, filter, filters, groups, isLoading, isEmpty, isReady,
    atCapacity, capacityLabel, skeletons
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">

      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeaguesMobile {...sharedProps} IconMap={IconMap} tabs={tabs} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeaguesDesktop {...sharedProps} rootNav={rootNav} />
      </div>
    </div>
  );
}
