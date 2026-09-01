'use client';

import { useState, useMemo } from 'react';
import { LeagueMobile } from '../../components/leagues/LeagueMobile';
import { LeagueDesktop } from '../../components/leagues/LeagueDesktop';
import { useLeague } from '@/hooks/api/useLeagues';
import { useStandings } from '@/hooks/api/usePoints';
import { usePredictionTasks } from '@/hooks/api/usePredictions';
import { useAuth } from '@/context/auth-context';

const CLUB: Record<string, string> = { ARS: "#c8182f", CHE: "#1746a2", LIV: "#b7152b", TOT: "#17233d" };

export default function LeagueOverviewPage({ params }: { params: { id: string } }) {
  const { data: league, isLoading: leagueLoading, isError: leagueError } = useLeague(params.id);
  const { data: standingsData, isLoading: standingsLoading } = useStandings(params.id);
  const { data: tasksData } = usePredictionTasks();
  const { user } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [state, setState] = useState<'live' | 'urgent' | 'caughtup' | 'loading' | 'empty'>('live');

  const isLoading = leagueLoading || standingsLoading || state === "loading";
  const st = state;
  const isTerminal = st === "empty" || leagueError, isReady = !isLoading && !isTerminal;
  const urgent = st === "urgent", caught = st === "caughtup";

  const heroTone = urgent ? "var(--color-danger)" : caught ? "var(--nav-positive)" : "var(--nav-accent)";

  // Derive task data for this league from prediction tasks
  const leagueTasks = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.items.filter(t => t.league.id === params.id);
  }, [tasksData, params.id]);

  const totalMarkets = leagueTasks.reduce((acc, t) => {
    if (t.kind === 'fixture') return acc + (t.missingPredictions?.length || 0);
    return acc + 1;
  }, 0);
  const answeredMarkets = 0; // Will come from predictions data when available
  const heroProgress = totalMarkets > 0 ? `${answeredMarkets} of ${totalMarkets}` : caught ? "8 of 8" : "—";

  // Next fixture from tasks for hero section
  const nextFixtureTask: any = leagueTasks.find(t => t.kind === 'fixture');
  const nextDeadline = nextFixtureTask ? new Date(nextFixtureTask.nextDeadlineAt || nextFixtureTask.kickoffAt) : null;
  const timeUntil = nextDeadline ? (() => {
    const diff = nextDeadline.getTime() - Date.now();
    if (diff <= 0) return '0m';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
  })() : '—';
  const nextFixtureName = nextFixtureTask
    ? `${nextFixtureTask.homeTeam.displayName} v ${nextFixtureTask.awayTeam.displayName}`
    : league?.competitions?.[0]?.displayName || 'No fixtures';

  const HERO: Record<string, string[]> = {
    live: ["NEXT LOCK", timeUntil, `until ${nextFixtureName} closes`, heroProgress, "Finish predictions", totalMarkets > 0 ? `${totalMarkets} markets still unanswered.` : "All markets answered."],
    urgent: ["LOCKING NOW", timeUntil, `until ${nextFixtureName} closes`, heroProgress, "Finish predictions", "Markets still open. Anything unanswered at the whistle scores nothing."],
    caughtup: ["ALL ANSWERED", timeUntil, `until ${nextFixtureName} closes`, heroProgress, "Review your answers", "Every market is in. You can still change any of them until the lock."]
  };
  const heroData = HERO[isReady ? st : "live"];
  const pct = caught ? 100 : (totalMarkets > 0 ? Math.round((answeredMarkets / totalMarkets) * 100) : 0);

  // Derive leaderboard from API standings data — no static fallback
  const liveRows = standingsData?.items?.map((item, i) => ({
    pos: item.rank.toString(),
    name: item.member.displayName,
    initials: item.member.displayName.substring(0, 2).toUpperCase(),
    points: item.points,
    tint: `var(--ident-${(i % 7) + 1})`,
    you: user?.displayName === item.member.displayName
  })) || [];

  // Find the user's own points from standings
  const myRow = liveRows.find(r => r.you);
  const MINE = myRow?.points || 0;

  const desktopRivals = liveRows.map((r, i, a) => {
    const d = r.points - MINE;
    return {
      pos: r.pos, name: r.name, initials: r.initials, points: r.points.toLocaleString("en-GB"),
      delta: r.you ? "" : (d > 0 ? "+" + d : String(d)),
      deltaStyle: { width: "46px", flex: "none", textAlign: "right", font: "600 12.5px 'DM Sans',sans-serif", color: d > 0 ? "var(--danger-text)" : "var(--success-text)" },
      rowStyle: { display: "flex", alignItems: "center", gap: "13px", padding: "12px 10px", borderBottom: "1px solid var(--surface-border)", background: r.you ? "var(--accent-surface)" : "transparent", boxShadow: r.you ? "inset 3px 0 0 0 var(--color-brand)" : "none" },
      posStyle: { width: "24px", flex: "none", font: "700 12.5px 'DM Sans',sans-serif", color: r.you ? "var(--accent-text-strong)" : "var(--text-muted)" },
      avatarStyle: { width: "32px", height: "32px", borderRadius: "999px", flex: "none", display: "grid", placeItems: "center", font: "700 10.5px 'DM Sans',sans-serif", color: "var(--text-primary)", background: r.you ? "var(--color-brand)" : r.tint },
      nameStyle: { flex: 1, minWidth: 0, font: (r.you ? "700" : "600") + " 13.5px 'DM Sans',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: r.you ? "var(--accent-text-strong)" : "var(--text-primary)" },
      pointsStyle: { width: "60px", flex: "none", textAlign: "right", font: "700 14px 'DM Sans',sans-serif", color: r.you ? "var(--accent-text-strong)" : "var(--text-primary)" }
    };
  });

  const mobileRivals = liveRows.slice(0, 3).map((r, i, a) => ({
    pos: r.pos, name: r.name, initials: r.initials, points: r.points.toLocaleString("en-GB"),
    rowStyle: `flex items-center gap-[11px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] ${i === a.length - 1 ? 'border-b' : ''} ${r.you ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
    posStyle: `w-[22px] flex-none font-heading font-bold text-[12px] ${r.you ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-muted)]'}`,
    avatarStyle: `w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)] ${r.you ? 'bg-[var(--color-brand)]' : ''}`,
    tintBg: r.you ? '' : r.tint,
    nameStyle: `flex-1 min-w-0 font-heading ${r.you ? 'font-bold' : 'font-semibold'} text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis ${r.you ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-primary)]'}`,
    pointsStyle: `font-heading font-bold text-[14px] flex-none ${r.you ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-primary)]'}`
  }));

  const RESULT_DEF: Record<string, any> = {
    correct: {
      kicker: "YOU CALLED IT", badge: "EXACT SCORE", pts: "+18",
      summary: "You nailed the exact score. Your best return of the season so far.",
      breakdown: []
    },
    mixed: {
      kicker: "YOUR LAST RESULT", badge: "PARTIAL", pts: "+8",
      summary: "You got the result right but the scoreline went against you.",
      breakdown: []
    },
    none: {
      kicker: "NO RESULTS YET", badge: "—", pts: "—",
      summary: "No settled fixtures yet in this league.",
      breakdown: []
    }
  };
  // TODO: Source from a fixture-results API when available
  const RESULT = liveRows.length > 0 ? RESULT_DEF[caught ? "mixed" : "none"] : RESULT_DEF.none;
  const nailed = RESULT.badge === "EXACT SCORE";

  const mBreakdown = RESULT.breakdown.map(([label, pts, won]: any) => ({
    label: `${label} ${pts}`,
    style: `font-heading font-semibold text-[10.5px] p-[5px_10px] rounded-[6px] ${won ? 'bg-[rgba(255,255,255,0.16)] text-[var(--tf-white)]' : 'bg-transparent text-[rgba(255,255,255,0.45)] border border-dashed border-[rgba(255,255,255,0.28)]'}`
  }));

  const dBreakdown = RESULT.breakdown.map(([label, pts, won]: any) => ({
    label: `${label} ${pts}`,
    style: { font: "600 10.5px 'DM Sans',sans-serif", padding: "5px 10px", borderRadius: "6px", background: won ? "rgba(255,255,255,.16)" : "transparent", color: won ? "var(--tf-white)" : "rgba(255,255,255,.45)", border: won ? "none" : "1px dashed rgba(255,255,255,.28)" }
  }));

  const unanswered = (isReady && !caught) ? "6" : "";
  
  const IconMap: Record<string, any> = {
    overview: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" /><path d="M9.5 20v-6h5v6" /></svg>,
    ball: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="8" /><path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" /></svg>,
    table: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 19V11M12 19V5M19 19V8" /></svg>,
    more: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" style={{ display: 'block' }}><path d="M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
  };

  const tabs = [
    { label: "OVERVIEW", ic: "overview", on: true, b: "" },
    { label: "FIXTURES", ic: "ball", on: false, b: unanswered },
    { label: "TABLE", ic: "table", on: false, b: "" },
    { label: "MORE", ic: "more", on: false, b: "" }
  ];

  const NAV_ACTIVE = "leagues";
  const rootNav = [["Home","home",""],["Predict","predict","25"],["Leagues","leagues",""]].map((it) => {
    const label = it[0], id = it[1], badge = it[2];
    return { 
      label, id, badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', background: id === NAV_ACTIVE ? 'var(--nav-fill)' : 'transparent', opacity: id === NAV_ACTIVE ? 1 : 0.66 } 
    };
  });

  const tabItem = (label: string, on: boolean, badge?: string) => ({
    label, badge: badge || "",
    style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' },
    badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--color-danger)', color: 'var(--color-on-brand)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' }
  });

  const contextTabs = [tabItem("Overview", true), tabItem("Fixtures", false, unanswered), tabItem("Table", false), tabItem("Questions", false), tabItem("More", false)];

  const heroBg = 'var(--nav-surface)';
  
  const mResultBg = nailed ? "var(--tf-green-800)" : "var(--tf-navy-800)";
  const dResultStyle = { borderRadius: "16px", padding: "24px 26px", color: "var(--tf-white)", background: nailed ? "var(--tf-green-800)" : "var(--tf-navy-800)" };

  const propsMobile = {
    theme, CLUB, params, st, isLoading, isTerminal, isReady, urgent, caught,
    heroTone, heroData, pct, rivals: mobileRivals, RESULT, nailed, rBreakdown: mBreakdown, unanswered,
    IconMap, tabs, heroBg, resultBg: mResultBg, setState,
    leagueName: league?.name,
    memberCount: league?.memberCount,
    lifecycleLabel: league?.lifecycleState?.replace('_', ' ')
  };

  const propsDesktop = {
    theme, rootNav, contextTabs, isLoading, isTerminal, isReady, params,
    heroStyle: { position: 'relative', overflow: 'hidden', color: 'var(--nav-text)', padding: '24px 0 28px', borderBottom: '1px solid rgba(255,255,255,.1)', background: heroBg },
    heroDotStyle: { width: '7px', height: '7px', borderRadius: '999px', flex: 'none', background: heroTone, animation: urgent ? 'tfpulse 1.4s ease-in-out infinite' : 'none' },
    heroKicker: heroData[0], heroKickerColor: heroTone,
    heroClock: heroData[1], heroClockSub: heroData[2],
    heroClockColor: urgent ? "var(--color-danger)" : "var(--nav-text)",
    homeCode: nextFixtureTask ? nextFixtureTask.homeTeam.displayName.substring(0, 3).toUpperCase() : "—",
    homeName: nextFixtureTask ? nextFixtureTask.homeTeam.displayName : "—",
    homeColor: nextFixtureTask ? (CLUB[nextFixtureTask.homeTeam.displayName.substring(0, 3).toUpperCase()] || '#666') : '#666',
    awayCode: nextFixtureTask ? nextFixtureTask.awayTeam.displayName.substring(0, 3).toUpperCase() : "—",
    awayName: nextFixtureTask ? nextFixtureTask.awayTeam.displayName : "—",
    awayColor: nextFixtureTask ? (CLUB[nextFixtureTask.awayTeam.displayName.substring(0, 3).toUpperCase()] || '#666') : '#666',
    kickoff: nextDeadline ? nextDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
    heroBarStyle: { width: `${pct}%`, height: '100%', borderRadius: '999px', background: caught ? 'var(--nav-positive)' : 'var(--nav-accent)' },
    heroProgress: heroData[3],
    heroCtaStyle: { flex: 'none', height: '48px', minWidth: '186px', padding: '0 26px', borderRadius: '12px', display: 'grid', placeItems: 'center', cursor: 'pointer', font: "700 14px 'DM Sans',sans-serif", letterSpacing: '-.1px', background: caught ? 'transparent' : 'var(--nav-accent)', color: caught ? 'var(--nav-text)' : 'var(--nav-on-accent)', border: caught ? '1px solid var(--nav-border)' : 'none', boxShadow: caught ? 'none' : 'var(--elev-2)' },
    heroCta: heroData[4],
    heroFoot: heroData[5],
    rivalKicker: myRow ? `YOU ARE ${myRow.pos}${myRow.pos === '1' ? 'ST' : myRow.pos === '2' ? 'ND' : myRow.pos === '3' ? 'RD' : 'TH'} OF ${liveRows.length}`.toUpperCase() : "LOADING…",
    rivals: desktopRivals,
    gapNumber: (() => {
      if (!myRow || liveRows.length < 2) return "—";
      const above = liveRows.find(r => parseInt(r.pos) === parseInt(myRow.pos) - 1);
      return above ? String(above.points - myRow.points) : "—";
    })(),
    gapColor: "var(--text-primary)",
    gapLabel: (() => {
      if (!myRow || liveRows.length < 2) return "";
      const above = liveRows.find(r => parseInt(r.pos) === parseInt(myRow.pos) - 1);
      return above ? `points behind ${above.name}` : "";
    })(),
    gapNote: (() => {
      if (!myRow || liveRows.length < 2) return "";
      const below = liveRows.find(r => parseInt(r.pos) === parseInt(myRow.pos) + 1);
      return below ? `and ${myRow.points - below.points} clear of ${parseInt(myRow.pos) + 1}${parseInt(myRow.pos) + 1 === 2 ? 'nd' : parseInt(myRow.pos) + 1 === 3 ? 'rd' : 'th'}` : "";
    })(),
    resultStyle: dResultStyle, resultKicker: RESULT.kicker, resultKickerColor: "rgba(255,255,255,.62)",
    resultBadgeStyle: { font: "700 9.5px 'DM Sans',sans-serif", letterSpacing: ".09em", padding: "4px 9px", borderRadius: "6px", background: "var(--tf-white)", color: nailed ? "var(--tf-green-800)" : "var(--tf-navy-800)" },
    resultBadge: RESULT.badge,
    rHomeCode: "—", rHomeColor: '#666', rAwayCode: "—", rAwayColor: '#666',
    rScore: "—", rPointsStyle: { font: "700 28px 'DM Sans',sans-serif", letterSpacing: "-.9px", color: "var(--tf-white)" },
    rPoints: RESULT.pts, rPointsSub: "this fixture", rSummary: RESULT.summary, rBreakdown: dBreakdown,
    qTitle: "2 questions open", qSub: "Earliest closes Friday · 18 points between them",
    skeletonRows: ["58%", "44%", "66%", "50%", "61%"].map(w => ({ w })),
    leagueName: league?.name,
    memberCount: league?.memberCount
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      


      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueMobile {...propsMobile} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeagueDesktop {...propsDesktop} />
      </div>
    </div>
  );
}
