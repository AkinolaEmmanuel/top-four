'use client';

import { useState, useMemo } from 'react';
import { LeaguesScreen } from '../components/leagues/LeaguesScreen';
import { useMyLeagues } from '@/hooks/api/useLeagues';

const CLUB: Record<string, string> = {
  PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f", E28: "#667085",
  SF: "#b45309", A24: "#0e7a5f", O24: "#7f56d9", SS: "#1746a2",
  FC: "#b7152b", UN: "#0e7a5f", NB: "#7f56d9", WW: "#c8182f"
};

export default function LeaguesPage() {
  const { data: leaguesData, isLoading: leaguesLoading } = useMyLeagues();

  const [state, setState] = useState<'live' | 'capacity' | 'loading' | 'empty'>('live');
  // The app is dark-only (see app/layout.tsx); this was dead state with no
  // real toggle anywhere.
  const theme = 'dark';
  const setTheme = () => {};
  const [filter, setFilter] = useState('All');

  const isLoading = leaguesLoading || state === "loading";
  const isEmpty = (leaguesData && leaguesData.items.length === 0) || state === "empty";
  const isReady = !isLoading && !isEmpty;
  const hasFilters = isReady;

  const SECTIONS = [["Playing", "playing"], ["Draft", "draft"], ["Waiting on approval", "pending"], ["Past", "past"]];
  const visible = SECTIONS.filter(([label]) => filter === "All" || filter === label || (filter === "Pending" && label === "Waiting on approval"));

  const rowMap = (r: any, i: number, a: any[]) => ({
    id: r.id, crest: r.crest, crestBg: r.bg, name: r.name, meta: r.meta,
    role: r.role || "", value: r.value, sub: r.sub || "", action: r.action, muted: r.muted,
    isLast: i === a.length - 1
  });

  const leagues = useMemo(() => {
    const cats: Record<string, any[]> = { playing: [], draft: [], pending: [], past: [] };
    if (!leaguesData) return cats;
    
    leaguesData.items.forEach(league => {
      const item = {
        id: league.id,
        crest: league.name.substring(0, 2).toUpperCase(),
        bg: CLUB[league.name.substring(0, 2).toUpperCase()] || "#0879bf",
        name: league.name,
        meta: league.competitions?.map(c => c.displayName).join(', ') || '',
        role: (league.membership?.role === 'admin' || league.membership?.role === 'owner') ? 'Admin' : '',
        value: league.ownStanding ? league.ownStanding.position : "-",
        // Was a hardcoded "pts" label with no actual number attached to it --
        // every league's Points column read the literal word "pts" instead
        // of a real total. ownStanding carries `totalPoints`, not `points`.
        sub: league.ownStanding ? `${league.ownStanding.totalPoints} pts` : "",
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
    return cats;
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

  const used = leaguesData?.unfinishedLeagueCount ?? (n.playing + n.draft);
  const limit = leaguesData?.unfinishedLeagueLimit ?? 20;
  const filters = ["All", "Playing", "Draft", "Pending", "Past"].map(f => {
    const on = filter === f;
    return { label: f, count: counts[f], pick: () => setFilter(f), on };
  });

  const atCapacity = used >= limit;
  const capacityLabel = used === 0 ? "No leagues joined" : `${used} of ${limit} places used`;
  const skeletons = [{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }];

  const sharedProps = {
    theme, filter, filters, groups, isLoading, isEmpty, isReady,
    atCapacity, capacityLabel, skeletons
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <LeaguesScreen {...sharedProps} />
    </div>
  );
}
