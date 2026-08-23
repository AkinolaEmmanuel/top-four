'use client';

import { useState, useRef } from 'react';
import { LeagueTableMobile } from '../../../components/leagues/LeagueTableMobile';
import { LeagueTableDesktop } from '../../../components/leagues/LeagueTableDesktop';
import { useAuth } from '@/context/auth-context';

const TINTS = ["var(--ident-2)", "var(--ident-3)", "var(--ident-3)", "var(--ident-1)", "var(--ident-5)", "var(--ident-4)", "var(--ident-7)", "var(--ident-6)", "var(--ident-6)"];
const TOP = [
  { pos: "1", name: "Yemi", initials: "YE", points: 1340 },
  { pos: "2", tie: true, name: "Tunde", initials: "TU", points: 1298 },
  { pos: "2", tie: true, name: "Sade", initials: "SA", points: 1298 },
  { pos: "4", name: "Emmanuel", initials: "EA", points: 1284, role: "Admin" },
  { pos: "5", name: "Bola", initials: "BO", points: 1240 },
  { pos: "6", name: "Chi", initials: "CH", points: 1188 },
  { pos: "7", name: "Moses", initials: "MO", points: 1102 },
  { pos: "8", name: "Ada", initials: "AD", points: 1044 },
  { pos: "9", name: "Ife", initials: "IF", points: 998 },
  { pos: "10", name: "Amara", initials: "AM", points: 974 }
];

const MEMBERS = [
  { pos: 1, name: "Yemi", initials: "YE", points: 1340, color: "var(--ident-2)" },
  { pos: 2, tie: true, name: "Tunde", initials: "TU", points: 1298, color: "var(--ident-3)" },
  { pos: 2, tie: true, name: "Sade", initials: "SA", points: 1298, color: "var(--ident-3)" },
  { pos: 4, name: "Emmanuel", initials: "EA", points: 1284, color: "var(--ident-1)", role: "Admin" },
  { pos: 5, name: "Bola", initials: "BO", points: 1240, color: "var(--ident-5)" },
  { pos: 6, name: "Chi", initials: "CH", points: 1188, color: "var(--ident-4)" },
  { pos: 7, name: "Moses", initials: "MO", points: 1102, color: "var(--ident-7)" },
  { pos: 8, name: "Ada", initials: "AD", points: 1044, color: "var(--ident-6)" },
  { pos: 9, name: "Ife", initials: "IF", points: 998, color: "var(--ident-6)" }
];

const PAGES_MOBILE = [[1, 50], [51, 100], [101, 128]];
const PAGES_DESKTOP = [[1, 25], [26, 50], [51, 75], [76, 100], [101, 128]];
const SELF_RANK = 24;
const NEIGHBOUR_DELTA = "font:700 13px 'DM Sans',sans-serif;min-width:32px;color:var(--nav-text)";
const NAMES = ["Amara","Femi","Zainab","Obi","Ngozi","Yusuf","Chidi","Halima","Segun","Ifeanyi","Aisha","Tayo","Ebele","Musa","Nkechi","Dele","Fatima","Uche","Bisi","Kunle","Amina","Sola","Ngo","Bayo","Hauwa","Emeka","Ronke","Idris","Chioma","Tobi","Rukia","Gbenga","Adanna","Sanni","Lola","Nnamdi","Zara","Wale","Ijeoma","Bashir","Titi","Okon","Maryam","Seyi","Adaeze","Garba","Funmi","Chuka","Rashida","Damola"];
const AV = ["var(--ident-2)","var(--ident-3)","var(--ident-3)","var(--ident-1)","var(--ident-5)","var(--ident-4)","var(--ident-7)","var(--ident-6)","var(--ident-6)"];

const SPLIT = [["Premier League", "PL", 0.6], ["Champions League", "UCL", 0.3], ["FA Cup", "FA", 0.05], ["Custom questions", "Custom", 0.05]];
const NEIGHBOURS: Record<number, any> = { 22: ["Simi", 864], 23: ["Tobi", 852], 25: ["Ade", 841], 26: ["Nneka", 833] };

const ALL = (() => {
  const list: any[] = MEMBERS.slice();
  for (let rank = 10; rank <= 128; rank++) {
    const self = rank === SELF_RANK;
    const fixed = NEIGHBOURS[rank];
    const nm = fixed ? fixed[0] : NAMES[(rank - 10) % NAMES.length];
    list.push({
      pos: rank, name: self ? "Kolade" : nm, self: self, role: self ? "Owner" : undefined,
      initials: self ? "KA" : nm.slice(0, 2).toUpperCase(),
      points: self ? 846 : fixed ? fixed[1] : Math.round(846 * Math.pow(0.99, rank - SELF_RANK)),
      color: self ? "var(--color-brand)" : AV[rank % AV.length]
    });
  }
  return list;
})();

export default function LeagueTablePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [state, setState] = useState<'live' | 'final' | 'empty' | 'loading'>('live');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selfOpen, setSelfOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);

  const listRef = useRef<HTMLElement>(null);
  const meRef = useRef<HTMLDivElement>(null);

  const st = state;
  const isLoading = st === "loading", isEmpty = st === "empty", isFinal = st === "final";
  const showRows = !isLoading && !isEmpty;

  const fmt = (n: number) => n.toLocaleString("en-GB");

  const splitCells = (points: number, accent: boolean) => {
    return SPLIT.map(s => ({
      value: fmt(Math.round(points * (s[2] as number))),
      style: { width: "92px", flexShrink: 0, textAlign: "right", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "12.5px", fontVariantNumeric: "tabular-nums", color: accent ? "var(--nav-text-faint)" : "var(--text-secondary)" }
    }));
  };

  const PAGES = isDesktopLayout ? PAGES_DESKTOP : PAGES_MOBILE;
  const p = Math.min(page, PAGES.length - 1);
  const range = PAGES[p] || [1, 50];

  const pageRows = (isEmpty || isLoading) ? [] : ALL.slice(range[0] - 1, range[1]).map((m: any) => 
    m.self && user ? { ...m, name: user.displayName, initials: user.displayName.substring(0, 2).toUpperCase() } : m
  );

  const rowsDesktop = pageRows.map((m: any, i: number) => {
    const isOpen = openIdx === i;
    const share = Math.round(m.points / 1340 * 100);
    return {
      ref: m.self ? meRef : null,
      pos: m.pos, name: m.name, initials: m.initials, points: fmt(m.points),
      cells: splitCells(m.points, false),
      tieStyle: { fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "11.5px", color: "var(--text-muted)", display: m.tie ? "inline" : "none" },
      avatarStyle: { width: "36px", height: "36px", borderRadius: "999px", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: "var(--text-primary)", background: m.color },
      roleDotStyle: { width: "8px", height: "8px", borderRadius: "999px", flexShrink: 0, background: m.role === "Owner" ? "var(--role-owner)" : "var(--role-admin)", display: m.role ? "block" : "none" },
      caption: m.tie ? "shared " + m.pos + "nd" : "",
      captionStyle: { fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, display: m.tie ? "block" : "none" },
      caretStyle: { width: "20px", flexShrink: 0, textAlign: "center", fontSize: "13px", color: "var(--text-muted)", transition: "transform .15s", transform: isOpen ? "rotate(180deg)" : "none" },
      wrapStyle: { display: "flex", flexDirection: "column", borderBottom: "1px solid var(--surface-border)", background: m.self ? "var(--accent-surface)" : isOpen ? "var(--surface-subtle)" : "transparent", boxShadow: m.self ? "inset 3px 0 0 0 var(--color-brand)" : "none" },
      open: isOpen,
      roleLine: m.role ? m.role + " · share of leader" : "Share of leader",
      note: share + "% of the leader's total.",
      barStyle: { height: "100%", borderRadius: "99px", background: "var(--color-brand)", width: share + "%" },
      toggle: () => setOpenIdx(isOpen ? null : i)
    };
  });

  const breakdownMobile = (total: number, accent: boolean) => {
    const on = accent ? "rgba(255,255,255,.72)" : "var(--text-secondary)";
    const strong = accent ? "var(--tf-white)" : "var(--text-primary)";
    return [
      { label: "Premier League", value: Math.round(total * .6) },
      { label: "Champions League", value: Math.round(total * .3) },
      { label: "FA Cup", value: Math.round(total * .05) },
      { label: "Custom questions", value: Math.round(total * .05), rule: true },
      { label: "Total", value: total, total: true }
    ].map(b => ({
      label: b.label, value: fmt(b.value),
      rowStyle: `flex items-baseline justify-between gap-[10px] py-[5px] ${b.rule ? `mt-[4px] pt-[8px] border-t border-[${accent ? 'rgba(255,255,255,0.18)' : 'var(--surface-border)'}]` : ''}`,
      labelStyle: `text-[11.5px] ${b.total ? `font-heading font-bold text-[${strong}]` : `text-[${on}]`}`,
      valueStyle: `font-heading ${b.total ? 'font-bold' : 'font-semibold'} text-[11.5px] text-[${b.total ? strong : on}]`,
      total: b.total
    }));
  };

  const rowsMobile = (showRows ? TOP.map(m => m.pos === "24" && user ? { ...m, name: user.displayName, initials: user.displayName.substring(0, 2).toUpperCase() } : m) : []).map((m: any, i: number) => {
    const open = openIdx === i;
    return {
      pos: m.pos, name: m.name, initials: m.initials, points: fmt(m.points),
      posStyle: `font-heading font-bold text-[13px] ${i === 0 && isFinal ? 'text-[var(--color-crown)]' : 'text-[var(--text-primary)]'}`,
      tieStyle: `font-heading font-medium text-[10px] text-[var(--text-muted)] ${m.tie ? '' : 'hidden'}`,
      avatarStyle: `w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]`,
      avatarBg: TINTS[i % TINTS.length],
      nameStyle: `font-heading font-semibold text-[13.5px] tracking-[-0.1px] whitespace-nowrap overflow-hidden text-ellipsis`,
      roleDot: `w-[7px] h-[7px] rounded-full flex-none bg-[${m.role === 'Owner' ? 'var(--role-owner)' : 'var(--role-admin)'}] ${m.role ? '' : 'hidden'}`,
      sub: m.tie ? `shared ${m.pos}nd` : "",
      subStyle: `text-[10px] text-[var(--text-muted)] mt-[2px] ${m.tie ? '' : 'hidden'}`,
      pointsStyle: `font-heading font-bold text-[14px] flex-none`,
      caretStyle: `text-[12px] text-[var(--text-muted)] flex-none transition-transform duration-150 ${open ? 'rotate-180' : ''}`,
      wrapStyle: `border-b border-[var(--surface-border)] ${open ? 'bg-[var(--surface-subtle)]' : ''}`,
      open: open,
      breakLabel: (m.role ? `${m.role} · ` : "") + "by competition",
      breakdown: breakdownMobile(m.points, false),
      toggle: () => setOpenIdx(openIdx === i ? null : i)
    };
  });

  const hasStanding = !isEmpty;
  const selfOnPage = !isEmpty && !isLoading && SELF_RANK >= range[0] && SELF_RANK <= range[1];

  const myPos = isEmpty ? "—" : "24th";
  const myPosLabel = isFinal ? "WHERE YOU FINISHED" : "YOUR POSITION";
  const myPoints = "846 pts";

  const prevStyleMobile = `p-[8px_12px] rounded-[9px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[11px] ${page > 0 ? 'cursor-pointer' : 'opacity-40'}`;
  const nextStyleMobile = `p-[8px_12px] rounded-[9px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[11px] ${page < PAGES.length - 1 ? 'cursor-pointer' : 'opacity-40'}`;

  const prevStyleDesktop = { padding: "9px 14px", borderRadius: "10px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "12px", border: "1px solid var(--surface-border-strong)", background: "var(--surface-card)", cursor: page > 0 ? "pointer" : "default", color: page > 0 ? "var(--text-primary)" : "var(--text-muted)", opacity: page > 0 ? 1 : 0.5 };
  const nextStyleDesktop = { padding: "9px 14px", borderRadius: "10px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "12px", border: "1px solid var(--surface-border-strong)", background: "var(--surface-card)", cursor: page < PAGES.length - 1 ? "pointer" : "default", color: page < PAGES.length - 1 ? "var(--text-primary)" : "var(--text-muted)", opacity: page < PAGES.length - 1 ? 1 : 0.5 };

  const prevPage = () => { if (page > 0) { setPage(page - 1); setOpenIdx(null); } };
  const nextPage = () => { if (page < PAGES.length - 1) { setPage(page + 1); setOpenIdx(null); } };
  
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

  const navItem = (label: string, on: boolean) => ({
    label, style: { padding: '7px 13px', borderRadius: '9px', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', background: on ? 'rgba(255,255,255,0.14)' : 'transparent', opacity: on ? 1 : 0.66 }
  });
  
  const tabItem = (label: string, on: boolean) => ({
    label, style: { padding: '0 13px', height: '43px', display: 'flex', alignItems: 'center', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' }
  });

  const rootNav = [["Home","home",""],["Predict","predict","25"],["Leagues","leagues",""]].map((it) => {
    const label = it[0], id = it[1], badge = it[2];
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', background: id === "leagues" ? 'var(--nav-fill)' : 'transparent', opacity: id === "leagues" ? 1 : 0.66 } 
    };
  });

  const propsMobile = {
    theme, params, st, isLoading, isEmpty, isFinal, showRows,
    headSub: isFinal ? "128 members · final" : "128 members · updated moments ago",
    myPos, myPosLabel: myPosLabel.toLowerCase(),
    myGap: isFinal ? "of 128 · 846 points" : "6 points behind Tobi in 23rd",
    refreshing, hasStanding,
    rows: rowsMobile, TINTS, breakdown: breakdownMobile,
    selfBreakdown: breakdownMobile(846, true), listRef,
    page: p, PAGES, range, prevStyle: prevStyleMobile, nextStyle: nextStyleMobile, prevPage, nextPage,
    selfOpen, setSelfOpen, setRefreshing
  };

  const propsDesktop = {
    theme, rootNav, contextTabs: [tabItem("Overview", false), tabItem("Fixtures", false), tabItem("Table", true), tabItem("Questions", false), tabItem("More", false)],
    params, st, isLoading, isEmpty, isFinal, showRows,
    heroStyle: { flex: 'none', color: 'var(--nav-text)', padding: '26px 0 30px', borderBottom: '1px solid rgba(255,255,255,.1)', background: "linear-gradient(102deg, transparent 46%, color-mix(in srgb, var(--color-brand) 24%, transparent) 100%), var(--nav-surface)" },
    myPos, myPosLabel, myPoints,
    neighbours: isFinal ? [{ delta: "", deltaStyle: { display: 'none' }, text: "of 128 members · the league is over" }] : [{ delta: "−" + (ALL[22].points - 846), deltaStyle: { font: "700 13px 'DM Sans',sans-serif", minWidth: "32px", color: "var(--nav-text)" }, text: "behind " + ALL[22].name + " in 23rd" }, { delta: "+" + (846 - ALL[24].points), deltaStyle: { font: "700 13px 'DM Sans',sans-serif", minWidth: "32px", color: "var(--nav-text)" }, text: "clear of " + ALL[24].name + " in 25th" }],
    pageLabel: `${range[0]}–${range[1]} of 128`,
    refreshing, refresh: () => setRefreshing(false), nudge: () => setRefreshing(true), isReady: !isLoading && !isEmpty,
    listRef, cols: SPLIT.map(s => ({ label: s[1], style: { width: "92px", flexShrink: 0, textAlign: "right", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" } })),
    legend: [{ label: "Owner", dotStyle: { width: "8px", height: "8px", borderRadius: "999px", background: "var(--role-owner)" } }, { label: "Admin", dotStyle: { width: "8px", height: "8px", borderRadius: "999px", background: "var(--role-admin)" } }],
    skeletons: ["62%", "48%", "71%", "55%", "66%", "44%", "58%", "69%", "51%", "64%"].map(w => ({ nameStyle: { height: "11px", borderRadius: "99px", background: "var(--surface-subtle)", maxWidth: w }, cells: ["38px", "34px", "26px", "26px"].map(cw => ({ width: cw, height: "11px", borderRadius: "999px", background: "var(--surface-subtle)" })) })),
    rows: rowsDesktop,
    tiebreakers: ["Total points", "Exact scores correct", "Match results correct", "Lineup players correct"].map((label, i) => ({ n: String(i + 1), label, style: { flex: 1, display: "flex", flexDirection: "column", gap: "6px", padding: "0 16px", borderLeft: i ? "1px solid var(--surface-border)" : "none", paddingLeft: i ? "16px" : 0 } })),
    showTies: !isEmpty && !isLoading,
    hasStanding, selfPos: isEmpty ? "—" : "24", selfMove: isEmpty ? "no points yet" : isFinal ? "final position" : "up 2 since last visit",
    selfCells: splitCells(846, true), prevPage, nextPage,
    prevStyle: prevStyleDesktop, nextStyle: nextStyleDesktop,
    prevLabel: p > 0 ? "‹ " + PAGES[p - 1][0] + "–" + PAGES[p - 1][1] : "‹ Start",
    nextLabel: p < PAGES.length - 1 ? PAGES[p + 1][0] + "–" + PAGES[p + 1][1] + " ›" : "End ›", jumpToMe
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      



      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueTableMobile {...propsMobile} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        {/* We use isDesktopLayout state to use correct PAGES pagination size */}
        <LeagueTableDesktop {...propsDesktop} />
      </div>
    </div>
  );
}
