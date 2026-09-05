'use client';

import { useState, useRef, useMemo } from 'react';
import { LeagueTableMobile } from '../../../components/leagues/LeagueTableMobile';
import { LeagueTableDesktop } from '../../../components/leagues/LeagueTableDesktop';
import { useLeague } from '@/hooks/api/useLeagues';
import { useStandings, useOwnStanding } from '@/hooks/api/usePoints';
import { useAuth } from '@/context/auth-context';
import { StandingCompetitionPoints, StandingEntry } from '@/lib/api/points';

const TINTS = ["var(--ident-2)", "var(--ident-3)", "var(--ident-1)", "var(--ident-5)", "var(--ident-4)", "var(--ident-7)", "var(--ident-6)"];

export default function LeagueTablePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { data: league, isLoading: leagueLoading } = useLeague(params.id);
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const { data: standingsData, isLoading: standingsLoading } = useStandings(params.id, page + 1, pageSize);
  const { data: ownStanding } = useOwnStanding(params.id);

  const [theme] = useState<'light' | 'dark'>('dark');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selfOpen, setSelfOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef<HTMLElement>(null);
  const meRef = useRef<HTMLDivElement>(null);

  const isLoading = leagueLoading || standingsLoading;
  const rawItems = standingsData?.entries || [];
  const isEmpty = !isLoading && rawItems.length === 0;
  const isFinal = league?.lifecycleState === 'completed';
  const showRows = !isLoading && !isEmpty;

  const fmt = (n: number) => n.toLocaleString("en-GB");

  // The columns are the league's own chosen competitions, not a fixed set — a
  // league running Premier League + La Liga has two columns, not four.
  const competitionColumns = (league?.competitions || []).map(c => ({ id: c.supportedCompetitionId, label: c.displayName }));

  const realBreakdown = (competitionPoints: StandingCompetitionPoints[], customQuestionPoints: number, totalPoints: number) => {
    const byId = new Map(competitionPoints.map(cp => [cp.supportedCompetitionId, cp.points]));
    return [
      ...competitionColumns.map(c => ({ label: c.label, value: byId.get(c.id) || 0, rule: false, total: false })),
      { label: "Custom questions", value: customQuestionPoints, rule: true, total: false },
      { label: "Total", value: totalPoints, rule: false, total: true }
    ];
  };

  const splitCells = (competitionPoints: StandingCompetitionPoints[], customQuestionPoints: number, accent: boolean) => {
    const byId = new Map(competitionPoints.map(cp => [cp.supportedCompetitionId, cp.points]));
    const style = { width: "92px", flexShrink: 0, textAlign: "right" as const, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "12.5px", fontVariantNumeric: "tabular-nums" as const, color: accent ? "var(--nav-text-faint)" : "var(--text-secondary)" };
    return [
      ...competitionColumns.map(c => ({ value: fmt(byId.get(c.id) || 0), style })),
      { value: fmt(customQuestionPoints), style }
    ];
  };

  const totalMembers = standingsData?.totalActiveMembers ?? league?.memberCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const p = Math.min(page, totalPages - 1);
  const range = [p * pageSize + 1, Math.min((p + 1) * pageSize, totalMembers)];

  // Convert raw entries into structured rows. Leader points for the "share of
  // leader" bar comes from whichever entry is loaded highest right now — exact
  // on page one, an honest floor beyond it rather than a second fetch just for
  // a progress bar.
  const allRows = useMemo(() => {
    const leaderPoints = rawItems[0]?.totalPoints || ownStanding?.totalPoints || 1;
    return rawItems.map((item: StandingEntry, idx: number) => {
      const isSelf = item.membershipId === ownStanding?.membershipId;
      const rankCount = rawItems.filter((r: StandingEntry) => r.position === item.position).length;
      const isTie = rankCount > 1;
      return {
        pos: item.position,
        membershipId: item.membershipId,
        name: isSelf && user?.displayName ? user.displayName : item.displayName,
        initials: (isSelf && user?.displayName ? user.displayName : item.displayName).substring(0, 2).toUpperCase(),
        points: item.totalPoints,
        competitionPoints: item.competitionPoints,
        customQuestionPoints: item.customQuestionPoints,
        self: isSelf,
        tie: isTie,
        color: isSelf ? "var(--color-brand)" : TINTS[idx % TINTS.length],
        share: leaderPoints > 0 ? Math.round((item.totalPoints / leaderPoints) * 100) : 0
      };
    });
  }, [rawItems, user, ownStanding]);

  const pageRows = (isEmpty || isLoading) ? [] : allRows.slice(range[0] - 1, range[1]);

  // ownStanding is fetched independent of which page is loaded, so "my" stats
  // stay correct even when my row isn't on the currently displayed page.
  const myRow = allRows.find(r => r.self);
  const myPosNumber = myRow ? myRow.pos : (ownStanding?.position ?? null);
  const myPointsNumber = myRow ? myRow.points : (ownStanding?.totalPoints ?? 0);
  const myCompetitionPoints = myRow ? myRow.competitionPoints : (ownStanding?.competitionPoints ?? []);
  const myCustomQuestionPoints = myRow ? myRow.customQuestionPoints : (ownStanding?.customQuestionPoints ?? 0);
  const myPos = isEmpty ? "—" : myPosNumber ? `${myPosNumber}${myPosNumber === 1 ? 'st' : myPosNumber === 2 ? 'nd' : myPosNumber === 3 ? 'rd' : 'th'}` : "—";
  const myPosLabel = isFinal ? "WHERE YOU FINISHED" : "YOUR POSITION";
  const myPoints = `${fmt(myPointsNumber)} pts`;
  const myName = myRow?.name || user?.displayName || '';
  const myInitials = myRow?.initials || (user?.displayName || '??').substring(0, 2).toUpperCase();
  const myPointsFmt = fmt(myPointsNumber);

  // Determine neighbour deltas
  const myIdx = allRows.findIndex(r => r.self);
  const rowAbove = myIdx > 0 ? allRows[myIdx - 1] : null;
  const rowBelow = myIdx >= 0 && myIdx < allRows.length - 1 ? allRows[myIdx + 1] : null;

  const myGap = (() => {
    if (isFinal) return `of ${totalMembers} · ${fmt(myPointsNumber)} points`;
    if (rowAbove) {
      const diff = rowAbove.points - myPointsNumber;
      return `${diff} ${diff === 1 ? 'point' : 'points'} behind ${rowAbove.name} in ${rowAbove.pos}${rowAbove.pos === 1 ? 'st' : rowAbove.pos === 2 ? 'nd' : rowAbove.pos === 3 ? 'rd' : 'th'}`;
    }
    if (myRow && myRow.pos === 1) return `Leading by ${rowBelow ? myPointsNumber - rowBelow.points : 0} points`;
    return `${totalMembers} members`;
  })();

  const rowsDesktop = pageRows.map((m: any, i: number) => {
    const isOpen = openIdx === i;
    return {
      ref: m.self ? meRef : null,
      pos: m.pos, name: m.name, initials: m.initials, points: fmt(m.points),
      cells: splitCells(m.competitionPoints, m.customQuestionPoints, false),
      tieStyle: { fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "11.5px", color: "var(--text-muted)", display: m.tie ? "inline" : "none" },
      avatarStyle: { width: "36px", height: "36px", borderRadius: "999px", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: "var(--text-primary)", background: m.color },
      roleDotStyle: { display: "none" },
      caption: m.tie ? "shared " + m.pos + (m.pos === 2 ? "nd" : m.pos === 3 ? "rd" : "th") : "",
      captionStyle: { fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, display: m.tie ? "block" : "none" },
      caretStyle: { width: "20px", flexShrink: 0, textAlign: "center", fontSize: "13px", color: "var(--text-muted)", transition: "transform .15s", transform: isOpen ? "rotate(180deg)" : "none" },
      wrapStyle: { display: "flex", flexDirection: "column", borderBottom: "1px solid var(--surface-border)", background: m.self ? "var(--accent-surface)" : isOpen ? "var(--surface-subtle)" : "transparent", boxShadow: m.self ? "inset 3px 0 0 0 var(--color-brand)" : "none" },
      open: isOpen,
      roleLine: "Share of leader",
      note: m.share + "% of the leader's total.",
      barStyle: { height: "100%", borderRadius: "99px", background: "var(--color-brand)", width: m.share + "%" },
      toggle: () => setOpenIdx(isOpen ? null : i)
    };
  });

  const breakdownMobile = (competitionPoints: StandingCompetitionPoints[], customQuestionPoints: number, totalPoints: number, accent: boolean) => {
    const on = accent ? "rgba(255,255,255,.72)" : "var(--text-secondary)";
    const strong = accent ? "var(--tf-white)" : "var(--text-primary)";
    return realBreakdown(competitionPoints, customQuestionPoints, totalPoints).map(b => ({
      label: b.label, value: fmt(b.value),
      rowStyle: `flex items-baseline justify-between gap-[10px] py-[5px] ${b.rule ? `mt-[4px] pt-[8px] border-t border-[${accent ? 'rgba(255,255,255,0.18)' : 'var(--surface-border)'}]` : ''}`,
      labelStyle: `text-[11.5px] ${b.total ? `font-heading font-bold text-[${strong}]` : `text-[${on}]`}`,
      valueStyle: `font-heading ${b.total ? 'font-bold' : 'font-semibold'} text-[11.5px] text-[${b.total ? strong : on}]`,
      total: b.total
    }));
  };

  const rowsMobile = pageRows.map((m: any, i: number) => {
    const open = openIdx === i;
    return {
      pos: m.pos, name: m.name, initials: m.initials, points: fmt(m.points),
      posStyle: `font-heading font-bold text-[13px] ${i === 0 && isFinal ? 'text-[var(--color-crown)]' : 'text-[var(--text-primary)]'}`,
      tieStyle: `font-heading font-medium text-[10px] text-[var(--text-muted)] ${m.tie ? '' : 'hidden'}`,
      avatarStyle: `w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]`,
      avatarBg: m.color,
      nameStyle: `font-heading font-semibold text-[13.5px] tracking-[-0.1px] whitespace-nowrap overflow-hidden text-ellipsis`,
      roleDot: `hidden`,
      sub: m.tie ? `shared ${m.pos}${m.pos === 2 ? "nd" : m.pos === 3 ? "rd" : "th"}` : "",
      subStyle: `text-[10px] text-[var(--text-muted)] mt-[2px] ${m.tie ? '' : 'hidden'}`,
      pointsStyle: `font-heading font-bold text-[14px] flex-none`,
      caretStyle: `text-[12px] text-[var(--text-muted)] flex-none transition-transform duration-150 ${open ? 'rotate-180' : ''}`,
      wrapStyle: `border-b border-[var(--surface-border)] ${open ? 'bg-[var(--surface-subtle)]' : ''}`,
      open: open,
      breakLabel: "by competition",
      breakdown: breakdownMobile(m.competitionPoints, m.customQuestionPoints, m.points, false),
      toggle: () => setOpenIdx(openIdx === i ? null : i)
    };
  });

  const winner = allRows.find(r => r.pos === 1);
  const winnerLine = winner ? `${fmt(winner.points)} points · ${totalMembers} members · predictions are now history` : '';

  const hasStanding = !isEmpty;
  const selfOnPage = !isEmpty && !isLoading && myPosNumber !== null && myPosNumber >= range[0] && myPosNumber <= range[1];

  const prevStyleMobile = `p-[8px_12px] rounded-[9px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[11px] ${page > 0 ? 'cursor-pointer' : 'opacity-40'}`;
  const nextStyleMobile = `p-[8px_12px] rounded-[9px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[11px] ${page < totalPages - 1 ? 'cursor-pointer' : 'opacity-40'}`;

  const prevStyleDesktop = { padding: "9px 14px", borderRadius: "10px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "12px", border: "1px solid var(--surface-border-strong)", background: "var(--surface-card)", cursor: page > 0 ? "pointer" : "default", color: page > 0 ? "var(--text-primary)" : "var(--text-muted)", opacity: page > 0 ? 1 : 0.5 };
  const nextStyleDesktop = { padding: "9px 14px", borderRadius: "10px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "12px", border: "1px solid var(--surface-border-strong)", background: "var(--surface-card)", cursor: page < totalPages - 1 ? "pointer" : "default", color: page < totalPages - 1 ? "var(--text-primary)" : "var(--text-muted)", opacity: page < totalPages - 1 ? 1 : 0.5 };

  const prevPage = () => { if (page > 0) { setPage(page - 1); setOpenIdx(null); } };
  const nextPage = () => { if (page < totalPages - 1) { setPage(page + 1); setOpenIdx(null); } };

  const jumpToMe = () => {
    const go = () => {
      const list = listRef.current;
      const me = meRef.current;
      if (list && me) {
        list.scrollTop = Math.max(0, me.offsetTop - 200);
      }
    };
    if (selfOnPage) go();
    else {
      setPage(0);
      setOpenIdx(null);
      setTimeout(go, 0);
    }
  };

  const tabItem = (label: string, on: boolean) => ({
    label, style: { padding: '0 13px', height: '43px', display: 'flex', alignItems: 'center', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' }
  });

  const rootNav = [["Home","home",""],["Predict","predict",""],["Leagues","leagues",""]].map((it) => {
    const label = it[0], id = it[1], badge = it[2];
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', background: id === "leagues" ? 'var(--nav-fill)' : 'transparent', opacity: id === "leagues" ? 1 : 0.66 } 
    };
  });

  const desktopNeighbours = isFinal
    ? [{ delta: "", deltaStyle: { display: 'none' }, text: `of ${totalMembers} members · the league is over` }]
    : [
        ...(rowAbove ? [{ delta: "−" + (rowAbove.points - myPointsNumber), deltaStyle: { font: "700 13px 'DM Sans',sans-serif", minWidth: "32px", color: "var(--nav-text)" }, text: `behind ${rowAbove.name} in ${rowAbove.pos}${rowAbove.pos === 1 ? 'st' : rowAbove.pos === 2 ? 'nd' : rowAbove.pos === 3 ? 'rd' : 'th'}` }] : []),
        ...(rowBelow ? [{ delta: "+" + (myPointsNumber - rowBelow.points), deltaStyle: { font: "700 13px 'DM Sans',sans-serif", minWidth: "32px", color: "var(--nav-text)" }, text: `clear of ${rowBelow.name} in ${rowBelow.pos}${rowBelow.pos === 1 ? 'st' : rowBelow.pos === 2 ? 'nd' : rowBelow.pos === 3 ? 'rd' : 'th'}` }] : [])
      ];

  const propsMobile = {
    theme, params, st: isLoading ? 'loading' : isEmpty ? 'empty' : isFinal ? 'final' : 'live', isLoading, isEmpty, isFinal, showRows,
    headSub: isFinal ? `${totalMembers} members · final` : `${totalMembers} members · updated live`,
    myPos, myPosLabel: myPosLabel.toLowerCase(),
    myGap, myName, myInitials, myPoints: myPointsFmt,
    refreshing, hasStanding, totalMembers,
    winnerName: winner?.name || '', winnerLine,
    rows: rowsMobile, TINTS, breakdown: breakdownMobile,
    selfBreakdown: breakdownMobile(myCompetitionPoints, myCustomQuestionPoints, myPointsNumber, true), listRef,
    page: p, PAGES: Array.from({ length: totalPages }, (_, i) => [i * pageSize + 1, Math.min((i + 1) * pageSize, totalMembers)]), range, prevStyle: prevStyleMobile, nextStyle: nextStyleMobile, prevPage, nextPage,
    selfOpen, setSelfOpen, setRefreshing,
    leagueName: league?.name
  };

  const propsDesktop = {
    theme, rootNav, contextTabs: [tabItem("Overview", false), tabItem("Fixtures", false), tabItem("Table", true), tabItem("Questions", false), tabItem("More", false)],
    params, st: isLoading ? 'loading' : isEmpty ? 'empty' : isFinal ? 'final' : 'live', isLoading, isEmpty, isFinal, showRows,
    heroStyle: { flex: 'none', color: 'var(--nav-text)', padding: '26px 0 30px', borderBottom: '1px solid rgba(255,255,255,.1)', background: "linear-gradient(102deg, transparent 46%, color-mix(in srgb, var(--color-brand) 24%, transparent) 100%), var(--nav-surface)" },
    myPos, myPosLabel, myPoints,
    neighbours: desktopNeighbours.length > 0 ? desktopNeighbours : [{ delta: "", deltaStyle: { display: 'none' }, text: `${totalMembers} members` }],
    pageLabel: totalMembers > 0 ? `${range[0]}–${range[1]} of ${totalMembers}` : "0 members",
    refreshing, refresh: () => setRefreshing(false), nudge: () => setRefreshing(true), isReady: !isLoading && !isEmpty,
    listRef, cols: [...competitionColumns.map(c => ({ label: c.label })), { label: "Custom" }].map(c => ({ label: c.label, style: { width: "92px", flexShrink: 0, textAlign: "right", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" } })),
    legend: [{ label: "Owner", dotStyle: { width: "8px", height: "8px", borderRadius: "999px", background: "var(--role-owner)" } }, { label: "Admin", dotStyle: { width: "8px", height: "8px", borderRadius: "999px", background: "var(--role-admin)" } }],
    skeletons: ["62%", "48%", "71%", "55%", "66%", "44%", "58%", "69%", "51%", "64%"].map(w => ({ nameStyle: { height: "11px", borderRadius: "99px", background: "var(--surface-subtle)", maxWidth: w }, cells: ["38px", "34px", "26px", "26px"].map(cw => ({ width: cw, height: "11px", borderRadius: "99px", background: "var(--surface-subtle)" })) })),
    rows: rowsDesktop,
    tiebreakers: ["Total points", "Exact scores correct", "Match results correct", "Lineup players correct"].map((label, i) => ({ n: String(i + 1), label, style: { flex: 1, display: "flex", flexDirection: "column", gap: "6px", padding: "0 16px", borderLeft: i ? "1px solid var(--surface-border)" : "none", paddingLeft: i ? "16px" : 0 } })),
    showTies: !isEmpty && !isLoading,
    hasStanding, selfPos: isEmpty ? "—" : myPosNumber ? String(myPosNumber) : "—", selfMove: isEmpty ? "no points yet" : isFinal ? "final position" : "live position",
    myName, myInitials, selfPoints: myPointsFmt,
    selfCells: splitCells(myCompetitionPoints, myCustomQuestionPoints, true), prevPage, nextPage,
    prevStyle: prevStyleDesktop, nextStyle: nextStyleDesktop,
    prevLabel: p > 0 ? `‹ ${(p - 1) * pageSize + 1}–${p * pageSize}` : "‹ Start",
    nextLabel: p < totalPages - 1 ? `${(p + 1) * pageSize + 1}–${Math.min((p + 2) * pageSize, totalMembers)} ›` : "End ›", jumpToMe,
    leagueName: league?.name,
    memberCount: league?.memberCount, totalMembers,
    winnerName: winner?.name || '', winnerLine
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueTableMobile {...propsMobile} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeagueTableDesktop {...propsDesktop} />
      </div>
    </div>
  );
}
