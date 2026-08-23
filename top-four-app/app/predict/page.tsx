'use client';

import { useState, useMemo } from 'react';
import { PredictMobile } from '../components/predict/PredictMobile';
import { PredictDesktop } from '../components/predict/PredictDesktop';
import { usePredictionTasks } from '@/hooks/api/usePredictions';
import { useMyLeagues } from '@/hooks/api/useLeagues';

const CLUB: Record<string, string> = { ARS: "#c8182f", CHE: "#1746a2", LIV: "#b7152b", TOT: "#17233d", MCI: "#559ac7", EVE: "#153c85", MUN: "#d1262f", NEW: "#20242a", RMA: "#e6e6e6", MIL: "#c8182f" };

const GROUPS = [
  ["today", "LOCKING TODAY", "act on these first"],
  ["week", "THIS WEEK", "nothing locks before Thursday"],
  ["later", "LATER", "open, but no rush"]
];

export default function PredictPage() {
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError } = usePredictionTasks();
  const { data: leaguesData, isLoading: leaguesLoading } = useMyLeagues();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [state, setState] = useState<'live' | 'empty' | 'loading' | 'error'>('live');
  const [filter, setFilter] = useState("All");

  const isLoading = tasksLoading || leaguesLoading || state === "loading";
  const isError = tasksError || state === "error";
  const isClear = (tasksData && tasksData.items.length === 0) || state === "empty";
  const isReady = !isLoading && !isClear && !isError;
  const noLeagues = leaguesData && leaguesData.items.length === 0;

  const liveTasks = useMemo(() => {
    if (!tasksData) return null;
    return tasksData.items.map(t => {
      const isQuestion = t.kind === 'custom_question';
      const deadline = new Date(isQuestion ? (t as any).question.deadlineAt : (t as any).nextDeadlineAt);
      const isToday = new Date().toDateString() === deadline.toDateString();

      const homeCode = isQuestion ? "" : (t as any).homeTeam?.displayName.substring(0,3).toUpperCase() || "TBA";
      const awayCode = isQuestion ? "" : (t as any).awayTeam?.displayName.substring(0,3).toUpperCase() || "TBA";
      const title = isQuestion ? (t as any).question.questionText : `${(t as any).homeTeam?.displayName} vs ${(t as any).awayTeam?.displayName}`;
      const missingCount = isQuestion ? 1 : (t as any).missingPredictions?.length || 0;

      return {
        when: isToday ? "today" : "week", // simplified logic
        group: isToday ? "Locking today" : "This week",
        time: `${deadline.getHours()}:${deadline.getMinutes().toString().padStart(2, '0')}`,
        id: isQuestion ? (t as any).question.id : (t as any).fixtureId,
        kind: isQuestion ? "question" : "match",
        home: homeCode,
        away: awayCode,
        title,
        league: t.league.name,
        urgent: isToday,
        missing: `${missingCount} missing`,
        done: 0, // Need prediction progress from API
        total: missingCount
      };
    });
  }, [tasksData]);

  const tasksToUse = liveTasks || [];

  // Mobile Groups
  const mobileGroups = GROUPS.map(([key, label, note]) => {
    const rows = tasksToUse.filter(t => t.when === key).map((t, i, a) => {
      const q = t.kind === "question";
      return {
        title: t.title, meta: t.league, time: t.time, missing: t.missing, urgent: t.urgent,
        homeCode: q ? "" : t.home, awayCode: q ? "" : t.away,
        markWrapStyle: `flex flex-col gap-[3px] flex-none w-[26px]`,
        homeStyle: q ? 'hidden' : `w-[26px] h-[28px]`,
        homeBg: q ? '' : CLUB[t.home as string],
        awayStyle: q ? 'hidden' : `w-[26px] h-[28px]`,
        awayBg: q ? '' : CLUB[t.away as string],
        questionStyle: q ? `w-[26px] h-[59px] rounded-[7px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[14px] text-[var(--text-muted)]` : 'hidden',
        timeStyle: `font-heading font-bold text-[13px] ${t.urgent ? 'text-[var(--danger-text)]' : 'text-[var(--text-primary)]'}`,
        rowStyle: `flex items-center gap-[13px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${i === a.length - 1 ? 'border-b' : ''} ${t.urgent ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`
      };
    });
    return { label, note, labelColor: key === "today" ? "var(--danger-text)" : "var(--text-muted)", rows };
  }).filter(g => g.rows.length > 0);

  // Desktop Groups
  const desktopGroupsRaw = [
    { group: "Locking today", note: "act on these first", key: "today" },
    { group: "This week", note: "nothing locks before Thursday", key: "week" },
    { group: "Later", note: "open, but no rush", key: "later" }
  ];

  const desktopGroups = desktopGroupsRaw.map(g => {
    const items = tasksToUse.filter(t => t.when === g.key && (filter === "All" || t.league.startsWith(filter))).map(i => {
      const q = i.kind === "question";
      const pct = Math.round(i.done / i.total * 100);
      return {
        fixture: i.title, league: i.league, homeCode: q ? "" : i.home, awayCode: q ? "" : i.away,
        markWrapStyle: { width: '52px', height: '44px', flex: 'none', position: 'relative' as any },
        homeStyle: q ? { display: 'none' } : { position: 'absolute' as any, left: 0, top: 0, width: '30px', height: '32px', background: CLUB[i.home as string] },
        awayStyle: q ? { display: 'none' } : { position: 'absolute' as any, right: 0, bottom: 0, width: '30px', height: '32px', background: CLUB[i.away as string] },
        questionMarkStyle: q
          ? { position: 'absolute' as any, left: '9px', top: '4px', width: '34px', height: '36px', borderRadius: '9px', background: 'var(--surface-subtle)', display: 'grid', placeItems: 'center', font: "700 15px 'DM Sans', sans-serif", color: 'var(--text-muted)' }
          : { display: 'none' },
        showBar: !q,
        missingStyle: q ? { fontSize: '11px', color: 'var(--text-muted)' } : { display: 'none' },
        progress: q ? "" : `${i.done} of ${i.total}`,
        missing: q ? "Not answered" : "",
        barStyle: { height: '100%', borderRadius: '999px', background: pct === 0 ? 'var(--surface-border-strong)' : 'var(--color-brand)', width: `${pct}%` },
        deadline: i.time,
        deadlineStyle: { width: '96px', flex: 'none', textAlign: 'right' as any, font: "600 12.5px 'DM Sans', sans-serif", fontVariantNumeric: 'tabular-nums', color: i.urgent ? 'var(--danger-text)' : 'var(--text-primary)' },
        cta: q ? "Answer" : "Predict",
        ctaStyle: { flex: 'none', padding: '8px 15px', borderRadius: '10px', font: "600 11.5px 'DM Sans', sans-serif", cursor: 'pointer', background: i.urgent ? 'var(--brand-fill)' : 'transparent', color: i.urgent ? 'var(--color-on-brand)' : 'var(--text-primary)', border: i.urgent ? 'none' : '1px solid var(--surface-border-strong)' },
        rowStyle: { padding: '15px 18px', borderTop: '1px solid var(--surface-border)', background: i.urgent ? 'var(--accent-surface)' : 'transparent', boxShadow: i.urgent ? 'inset 3px 0 0 0 var(--color-brand)' : 'none' }
      };
    });
    return { label: g.group, note: g.note, labelStyle: { font: "700 17px 'DM Sans', sans-serif", letterSpacing: '-.3px' }, items };
  }).filter(g => g.items.length > 0);

  const openCount = tasksToUse.reduce((a, t) => a + (t.total - t.done), 0);
  const markets = tasksToUse.reduce((a, t) => a + (t.kind === "question" ? 1 : parseInt(t.missing as string, 10) || 1), 0);

  const total = isReady ? String(markets) : "0";
  const totalColor = isReady ? "var(--nav-text)" : "var(--nav-text-faint)";
  const totalLabel = isReady ? "markets open" : "no predictions to make";
  const totalSub = isReady ? "across 3 leagues · next locks in 2h 15m" : "";

  const uniqueLeagues = useMemo(() => {
    if (!leaguesData) return [];
    return Array.from(new Set(leaguesData.items.map(l => l.name)));
  }, [leaguesData]);

  const leagueFilters = (uniqueLeagues.length > 0 ? ["All", ...uniqueLeagues] : []).map(f => ({
    label: f, pick: () => setFilter(f),
    style: { padding: '8px 13px', borderRadius: '999px', cursor: 'pointer', font: "600 11.5px 'DM Sans', sans-serif", whiteSpace: 'nowrap' as any, background: filter === f ? 'var(--color-brand)' : 'transparent', color: filter === f ? 'var(--color-on-brand)' : 'var(--text-secondary)', border: filter === f ? '1px solid transparent' : '1px solid var(--surface-border-strong)' }
  }));

  const TERM = {
    noLeagues: [
      <svg key="0" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 3 21 8.5v7L12 21l-9-5.5v-7L12 3Z" /></svg>,
      "var(--text-primary)", "No predictions to make", "Join a league first to start predicting.", "JOIN A LEAGUE"
    ],
    empty: [
      <svg key="1" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="8.5" /><path d="m8.4 12.3 2.6 2.6 4.6-5.2" /></svg>,
      "var(--success-text)", "Nothing needs you", "Every market in every league is answered. We'll badge this tab the moment something opens.", "VIEW YOUR LEAGUES"
    ],
    error: [
      <svg key="2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4.5M12 17h.01" /></svg>,
      "var(--warn-text)", "Your to-do list didn't load", "Check your connection and try again. Deadlines run on our clock — nothing locked while you couldn't see it.", "RETRY"
    ]
  }[isError ? "error" : noLeagues ? "noLeagues" : "empty"];

  const computedState = isLoading ? "loading" : isError ? "error" : noLeagues ? "noLeagues" : isClear ? "empty" : "live";

  const props = {
    state: computedState, setState, theme,

    // Mobile specific
    total, totalColor, totalLabel, totalSub, groups: mobileGroups,

    // Desktop specific
    headTitle: "Your to-do list", headSub: "Ordered by deadline, not by league",
    heroStyle: { padding: '26px 0 28px', background: 'var(--nav-surface)', color: 'var(--nav-text)' },
    heroDotStyle: { width: '8px', height: '8px', borderRadius: '999px', flex: 'none', background: 'var(--nav-warning)', animation: 'tfpulse 1.4s ease-in-out infinite' },
    heroTone: 'var(--nav-warning)',
    heroKicker: "OPEN ACROSS EVERY LEAGUE",
    heroNum: String(openCount),
    heroSub: "markets still unanswered",
    heroCtaStyle: { flex: 'none', height: '42px', padding: '0 20px', borderRadius: '11px', display: 'grid', placeItems: 'center', cursor: 'pointer', font: "700 12.5px 'DM Sans', sans-serif", background: 'var(--nav-accent)', color: 'var(--nav-on-accent)' },
    urgentText: "",
    urgentSub: "",

    todoSub: `${openCount} markets open`,
    desktopGroups, leagueFilters,
    skeletons: [{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }, { w: "44%" }],

    termIcon: TERM[0], termIconColor: TERM[1], termTitle: TERM[2], termBody: TERM[3], termAction: TERM[4],
    termActionStyle: { marginTop: '24px', padding: '0 22px', height: '48px', borderRadius: '13px', border: '1px solid var(--surface-border-strong)', background: 'var(--surface-card)', display: 'grid', placeItems: 'center', font: "700 12.5px 'DM Sans', sans-serif", cursor: 'pointer' },
    retry: () => setState('live')
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">

      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <PredictMobile {...props} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <PredictDesktop {...props} />
      </div>
    </div>
  );
}
