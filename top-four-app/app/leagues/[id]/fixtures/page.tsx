'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LeagueFixturesScreen } from '../../../components/leagues/LeagueFixturesScreen';
import { useLeagueFixturesInfinite, useLeague } from '@/hooks/api/useLeagues';

const CLUB: Record<string, string> = { ARS: "#c8182f", CHE: "#1746a2", LIV: "#b7152b", TOT: "#17233d", MCI: "#559ac7", EVE: "#153c85", MUN: "#d1262f", NEW: "#20242a" };



export default function LeagueFixturesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const {
    data: fixturesData, isLoading: fixturesLoading,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useLeagueFixturesInfinite(params.id);
  const { data: league } = useLeague(params.id);
  // The app is dark-only (see app/layout.tsx); this was dead state with no
  // real toggle anywhere.
  const theme = 'dark';
  const setTheme = () => {};
  const [state, setState] = useState<'upcoming' | 'results' | 'empty' | 'loading'>('upcoming');
  const [filter, setFilter] = useState("All");

  const st = state;
  const isLoading = st === "loading" || fixturesLoading, isEmpty = st === "empty";
  const results = st === "results";
  const showList = !isLoading && !isEmpty;

  const STATE_DEF: Record<string, string[]> = {
    open: ["OPEN", "bg-[var(--accent-surface)] text-[var(--accent-text)]", "background:var(--accent-surface);color:var(--accent-text)"],
    ready: ["READY", "bg-[var(--success-surface)] text-[var(--success-text)]", "background:var(--success-surface);color:var(--success-text)"],
    syncing: ["SYNCING", "bg-[var(--surface-subtle)] text-[var(--text-muted)]", "background:var(--surface-subtle);color:var(--text-muted)"],
    won: ["EXACT SCORE", "bg-[var(--tf-green-800)] text-[var(--tf-white)]", "background:var(--tf-green-800);color:var(--tf-white)"],
    part: ["PARTIAL", "bg-[var(--surface-subtle)] text-[var(--text-secondary)]", "background:var(--surface-subtle);color:var(--text-secondary)"],
    lost: ["NO POINTS", "bg-[var(--surface-subtle)] text-[var(--text-muted)]", "background:var(--surface-subtle);color:var(--text-muted)"],
    void: ["VOID", "border border-dashed border-[var(--surface-border-strong)] text-[var(--text-muted)]", "border:1px dashed var(--surface-border-strong);color:var(--text-muted)"]
  };

  const apiFixtures = fixturesData?.pages.flatMap((p) => p.items) || [];
  const upcomingFixtures = apiFixtures.filter(f => f.status === 'upcoming' || f.status === 'live');
  const pastFixtures = apiFixtures.filter(f => f.status === 'finished' || f.status === 'voided');

  const UPCOMING = upcomingFixtures.length > 0 ? [{
    group: "Upcoming Fixtures",
    note: "",
    rows: upcomingFixtures.map(f => ({
      id: f.id,
      home: f.homeTeam, hc: f.homeTeamCode, hLogo: f.homeTeamLogoUrl, away: f.awayTeam, ac: f.awayTeamCode, aLogo: f.awayTeamLogoUrl,
      mid: f.kickoffAt ? new Date(f.kickoffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD",
      state: f.predictionState || "open",
      note: f.predictionNote || "", action: "Predict", right: "—", urgent: false
    }))
  }] : [];

  const RESULTS = pastFixtures.length > 0 ? [{
    group: "Past Fixtures",
    note: "",
    rows: pastFixtures.map(f => ({
      id: f.id,
      home: f.homeTeam, hc: f.homeTeamCode, hLogo: f.homeTeamLogoUrl, away: f.awayTeam, ac: f.awayTeamCode, aLogo: f.awayTeamLogoUrl,
      mid: f.score ? `${f.score.home} — ${f.score.away}` : "—",
      state: f.predictionState || "lost",
      note: f.predictionNote || "", action: "See result", points: f.pointsAwarded ? `+${f.pointsAwarded}` : "0", right: f.pointsAwarded ? `+${f.pointsAwarded}` : "0"
    }))
  }] : [];

  const src = results ? RESULTS : UPCOMING;
  
  // Mobile filtering logic
  const groupsMobile = src.map(g => ({
    label: g.group, note: g.note,
    rows: g.rows.filter(r => {
      if (results || filter === "All") return true;
      if (filter === "Unanswered") return r.state === "open";
      if (filter === "Open") return r.state === "open" || r.state === "ready";
      if (filter === "Locked") return r.state === "syncing";
      return true;
    }).map((r: any, i, a) => {
      const s = STATE_DEF[r.state];
      return {
        home: r.home, away: r.away, homeCode: r.hc, awayCode: r.ac,
        homeColor: CLUB[r.hc], awayColor: CLUB[r.ac],
        homeLogo: r.hLogo, awayLogo: r.aLogo,
        mid: r.mid,
        midStyle: results ? "font-heading font-bold text-[15px] tracking-[-0.4px]" : "font-heading font-semibold text-[12px] text-[var(--text-muted)]",
        teamStyle: "font-heading font-semibold text-[13.5px] tracking-[-0.1px] whitespace-nowrap overflow-hidden text-ellipsis min-w-0",
        state: s[0],
        stateStyle: `inline-flex items-center h-[19px] px-[7px] rounded-[4px] font-heading font-bold text-[8.5px] tracking-[0.06em] flex-none ${s[1]}`,
        note: results ? `${r.note} · ${r.points}` : r.note,
        action: r.action,
        actionStyle: "font-heading font-bold text-[10px] text-[var(--text-link)] flex-none",
        rowStyle: `p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${i === a.length - 1 ? 'border-b' : ''} ${r.urgent ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
        onClick: () => router.push(`/predict/fixture/${r.id}?leagueId=${params.id}`)
      };
    })
  })).filter(g => g.rows.length > 0);

  // Desktop filtering logic
  const desktopRowGridStyle = { display: 'grid' as const, gridTemplateColumns: results ? '104px minmax(0,1fr) 78px minmax(0,330px) 68px 84px' : '104px minmax(0,1fr) 78px minmax(0,330px) 88px 84px', gap: '16px', alignItems: 'center' as const };
  const groupsDesktop = src.map(g => ({
    label: g.group, note: g.note,
    rows: g.rows.filter(r => {
      if (results || filter === "All") return true;
      if (filter === "Unanswered") return r.state === "open";
      if (filter === "Open") return r.state === "open" || r.state === "ready";
      if (filter === "Locked") return r.state === "syncing";
      return true;
    }).map((r: any, i, a) => {
      const s = STATE_DEF[r.state];
      return {
        home: r.home, away: r.away, homeCode: r.hc, awayCode: r.ac,
        homeColor: CLUB[r.hc], awayColor: CLUB[r.ac],
        homeLogo: r.hLogo, awayLogo: r.aLogo,
        mid: r.mid,
        midStyle: results ? { textAlign: 'center', font: "700 15px 'DM Sans',sans-serif", letterSpacing: '-.4px' } : { textAlign: 'center', font: "600 12px 'DM Sans',sans-serif", color: 'var(--text-muted)' },
        teamStyle: { font: "600 13px 'DM Sans',sans-serif", letterSpacing: '-.1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 },
        state: s[0],
        stateStyle: { display: 'inline-flex', alignItems: 'center', justifySelf: 'start', height: '19px', padding: '0 7px', borderRadius: '4px', font: "700 8.5px 'DM Sans',sans-serif", letterSpacing: '.06em', flex: 'none', ...Object.fromEntries(s[2].split(';').map(x => x.split(':')).filter(x => x.length === 2).map(([k,v]) => [k.replace(/-([a-z])/g, g => g[1].toUpperCase()), v])) },
        note: r.note,
        right: r.right,
        rightStyle: { textAlign: 'right', font: results ? "700 14px 'DM Sans',sans-serif" : "600 12px 'DM Sans',sans-serif", color: results ? (r.right === "0" || r.right === "—" ? "var(--text-muted)" : "var(--success-text)") : (r.urgent ? "var(--accent-text-strong)" : "var(--text-secondary)") },
        action: r.action,
        actionStyle: { textAlign: 'right', font: "700 10px 'DM Sans',sans-serif", letterSpacing: '.05em', color: 'var(--text-link)', cursor: 'pointer' },
        rowStyle: { ...desktopRowGridStyle, padding: '14px 4px', borderBottom: '1px solid var(--surface-border)', background: r.urgent ? 'var(--accent-surface)' : 'transparent', boxShadow: r.urgent ? 'inset 3px 0 0 0 var(--color-brand)' : 'none', cursor: 'pointer' },
        onClick: () => router.push(`/predict/fixture/${r.id}?leagueId=${params.id}`)
      };
    })
  })).filter(g => g.rows.length > 0);


  const segStyleMobile = (on: boolean) => `box-border flex-1 flex items-center justify-center gap-[7px] h-[38px] rounded-t-[9px] cursor-pointer font-heading font-bold text-[11.5px] ${on ? 'bg-[var(--surface-canvas)] text-[var(--text-primary)] border border-b-0 border-[var(--surface-border-strong)] pb-[1px]' : 'text-[var(--nav-text-faint)]'}`;
  const segStyleDesktop = (on: boolean) => ({ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 20px', borderRadius: '10px', cursor: 'pointer', font: "700 13px 'DM Sans',sans-serif", background: on ? 'var(--surface-card)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: on ? 'var(--elev-1)' : 'none' });
  
  const segmentsMobile = [
    { id: "upcoming", label: "Upcoming", count: String(upcomingFixtures.length) },
    { id: "results", label: "Results", count: String(pastFixtures.length) }
  ].map(s => ({
    label: s.label, count: s.count,
    pick: () => { setState(s.id as any); setFilter("All"); },
    style: segStyleMobile(results ? s.id === "results" : s.id === "upcoming"),
    countStyle: "font-[tabular-nums] opacity-55 font-semibold"
  }));

  const segmentsDesktop = [
    { id: "upcoming", label: "Upcoming", count: String(upcomingFixtures.length) },
    { id: "results", label: "Results", count: String(pastFixtures.length) }
  ].map(s => ({
    label: s.label, count: s.count,
    pick: () => { setState(s.id as any); setFilter("All"); },
    style: segStyleDesktop(results ? s.id === "results" : s.id === "upcoming"),
    countStyle: { fontVariantNumeric: 'tabular-nums', opacity: 0.55, fontWeight: 600 }
  }));

  // The context-tab badge (not the in-page filter counts below, which are
  // scoped to whichever of Upcoming/Results is active) always reflects
  // unanswered upcoming fixtures -- the same "needs your attention" signal
  // the Overview screen's own Fixtures tab badge already uses correctly.
  const unansweredUpcomingCount = upcomingFixtures.filter(f => f.predictionState === 'open' || !f.predictionState).length;

  const dynamicCounts = useMemo(() => {
    const all = results ? pastFixtures : upcomingFixtures;
    return {
      All: String(all.length),
      Unanswered: String(all.filter(f => f.predictionState === 'open' || !f.predictionState).length),
      Open: String(all.filter(f => f.predictionState === 'open' || f.predictionState === 'ready' || !f.predictionState).length),
      Locked: String(all.filter(f => f.status === 'live').length)
    };
  }, [upcomingFixtures, pastFixtures, results]);
  const counts: Record<string, string> = dynamicCounts;
  const filtersMobile = ["All", "Unanswered", "Open", "Locked"].map(f => {
    const on = filter === f;
    return {
      label: f, count: counts[f], pick: () => setFilter(f),
      style: `flex items-center h-[32px] px-[12px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px] ${on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`,
      countStyle: `ml-[6px] font-[tabular-nums] opacity-${on ? '70' : '55'}`
    };
  });

  const filtersDesktop = ["All", "Unanswered", "Open", "Locked"].map(f => {
    const on = filter === f;
    return {
      label: f, count: counts[f], pick: () => setFilter(f),
      style: { display: 'flex', alignItems: 'center', height: '32px', padding: '0 13px', borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none', font: "600 11.5px 'DM Sans',sans-serif", background: on ? 'var(--text-primary)' : 'transparent', color: on ? 'var(--surface-canvas)' : 'var(--text-secondary)', border: on ? 'none' : '1px solid var(--surface-border-strong)' },
      countStyle: { marginLeft: '6px', fontVariantNumeric: 'tabular-nums', opacity: on ? 0.7 : 0.55 }
    };
  });

  const leagueName = league?.name || '';
  const competitionName = league?.competitions?.[0]?.displayName || '';
  const headSub = results ? `${pastFixtures.length} settled${competitionName ? ' · ' + competitionName : ''}` : `${leagueName}${competitionName ? ' · ' + competitionName : ''}`;
  const emptyTitle = "No fixtures on this day";
  const emptyBody = "Nothing in this league's competitions is scheduled here. Try another day — the league itself is fine.";
  const loadMore = isFetchingNextPage ? "LOADING…" : results ? "LOAD EARLIER RESULTS" : "LOAD LATER FIXTURES";
  const showLoadMore = !!hasNextPage;
  const loadMoreAction = () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); };
  const footNote = results
    ? "A voided market scores nothing for everyone, not only for you. Provisional results become final once review closes."
    : "Lineups lock two hours before kick-off, everything else at the whistle. A fixture can be part-locked, which is why a row can be open and closed at once.";

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

  // Was hardcoded to a literal "2" regardless of how many fixtures actually
  // need an answer -- Desktop's equivalent context-tab badge already used
  // the real unansweredUpcomingCount, computed above.
  const tabs = [
    { label: "OVERVIEW", ic: "overview", on: false, b: "" },
    { label: "FIXTURES", ic: "ball", on: true, b: showList && !results && unansweredUpcomingCount > 0 ? String(unansweredUpcomingCount) : "" },
    { label: "TABLE", ic: "table", on: false, b: "" },
    { label: "MORE", ic: "more", on: false, b: "" }
  ];

  const tabItem = (label: string, on: boolean, badge: string) => ({
    label, badge: badge || "",
    style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' },
    badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--color-danger)', color: 'var(--color-on-brand)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' }
  });

  const props = {
    theme, params, st, isLoading, isEmpty, showList, results,
    headSub, emptyTitle, emptyBody, loadMore, showLoadMore, loadMoreAction, footNote,
    leagueName: league?.name, memberCount: league?.memberCount,

    // Mobile-specific
    segmentsMobile, filtersMobile, groupsMobile, IconMap, tabs,

    // Desktop-specific
    contextTabs: [tabItem("Overview", false, ""), tabItem("Fixtures", true, unansweredUpcomingCount > 0 ? String(unansweredUpcomingCount) : ""), tabItem("Table", false, ""), tabItem("Questions", false, ""), tabItem("More", false, "")],
    segmentsDesktop, showFilters: showList && !results, filtersDesktop,
    skeletons: [{ w: "260px" }, { w: "210px" }, { w: "280px" }, { w: "190px" }, { w: "250px" }, { w: "220px" }],
    chipSkeletons: ["58px", "96px", "72px", "78px"].map(w => ({ w })),
    skeletonRowStyle: { padding: '14px 4px', borderBottom: '1px solid var(--surface-border)', ...desktopRowGridStyle },
    headRowStyle: { ...desktopRowGridStyle, padding: '10px 4px', position: 'sticky' as const, top: 0, zIndex: 1, background: 'var(--surface-canvas)', borderBottom: '1px solid var(--surface-border-strong)' },
    groupsDesktop,
    footNoteStyle: { marginTop: '26px', paddingTop: '18px', borderTop: '1px solid var(--surface-border)', fontSize: '11.5px', lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '78ch' },
    colMid: results ? "Score" : "Kick-off", colNote: results ? "What landed" : "Your answers", colRight: results ? "Points" : "Locks in",
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <LeagueFixturesScreen {...props} />
    </div>
  );
}
