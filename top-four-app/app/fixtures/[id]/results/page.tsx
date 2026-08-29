'use client';

import { useState } from 'react';
import { FixtureResultsMobile } from '@/app/components/fixtures/FixtureResultsMobile';
import { FixtureResultsDesktop } from '@/app/components/fixtures/FixtureResultsDesktop';

const CLUB: Record<string, string> = { LIV: "#b7152b", TOT: "#17233d" };

const GRID = [
  { rank: "1", name: "Marcus Bell", initials: "MB", meta: "1,042 pts · admin", tint: "var(--ident-1)", a: { result: "Liverpool", score: "2–1", btts: "Yes", goals: "Over", scorer: "Salah" } },
  { rank: "2", name: "Priya Raman", initials: "PR", meta: "998 pts · admin", tint: "var(--ident-2)", a: { result: "Draw", score: "1–1", btts: "Yes", goals: "Under", scorer: "Son" } },
  { rank: "3", name: "Tomás Oliveira", initials: "TO", meta: "961 pts", tint: "var(--ident-3)", a: { result: "Liverpool", score: "3–0", btts: "No", goals: "Over", scorer: "Gakpo" } },
  { rank: "24", name: "Kolade", initials: "KA", meta: "846 pts", you: true, tint: "var(--color-brand)", a: { result: "Liverpool", score: "2–1", btts: "Yes", goals: "Over", scorer: "Salah" } },
  { rank: "25", name: "Hannah Whitfield", initials: "HW", meta: "834 pts", tint: "var(--ident-4)", a: { result: "Spurs", score: "0–2", btts: "No", goals: "Under", scorer: "—" } },
  { rank: "26", name: "Jonas Lindqvist", initials: "JL", meta: "829 pts", tint: "var(--ident-5)", a: { result: "Liverpool", score: "1–0", btts: "No", goals: "Under", scorer: "Salah" } },
  { rank: "27", name: "Aisha Kone", initials: "AK", meta: "812 pts", tint: "var(--ident-6)", a: { result: "—", score: "—", btts: "—", goals: "—", scorer: "—" } },
  { rank: "28", name: "Dan Kowalski", initials: "DK", meta: "joined yesterday", tint: "var(--ident-7)", a: { result: "—", score: "—", btts: "—", goals: "—", scorer: "—" } }
];

const CORRECT: Record<string, string> = { result: "Liverpool", score: "2–1", btts: "Yes", goals: "Over", scorer: "Salah" };

export default function FixtureResultsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [state, setState] = useState<'sealed' | 'provisional' | 'final' | 'correcting'>('final');
  const [market, setMarket] = useState('result');

  const st = state;
  const isSealed = st === "sealed";
  const isCorrecting = st === "correcting";
  const isOpen = !isSealed;

  const STATUS: Record<string, string[]> = {
    sealed: ["ONE MARKET STILL OPEN", "Premier League · Round 3", "var(--nav-text-faint)"],
    provisional: ["PROVISIONAL · FINAL IN 21H", "Premier League · Round 3 · full time", "var(--state-provisional)"],
    final: ["FULL TIME · SETTLED", "Premier League · Round 3 · settled 3h ago", "var(--nav-positive)"],
    correcting: ["CORRECTION IN PROGRESS", "A match fact was repaired · recalculating", "var(--nav-accent)"]
  };

  const currentStatus = STATUS[st];

  const NAMES: Record<string, string> = { result: "Result", score: "Exact score", btts: "BTTS", goals: "Over / under", scorer: "Scorer" };
  const marketPicker = ["result", "score", "btts", "goals", "scorer"].map(id => ({
    id, label: NAMES[id], pick: () => setMarket(id),
    style: `h-[32px] px-[12px] rounded-full grid place-items-center whitespace-nowrap flex-none cursor-pointer font-heading font-bold text-[10.5px] ${market === id ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`
  }));

  const rows = GRID.map((g, i, arr) => {
    const ans = (g.a as any)[market];
    const none = ans === "—";
    const right = !none && ans === CORRECT[market];
    return {
      rank: g.rank, name: g.name, initials: g.initials, meta: g.meta, you: g.you, tint: g.tint,
      answer: none ? "no answer" : ans,
      rowStyle: `flex items-center gap-[11px] p-[11px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${g.you ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
      rankStyle: `w-[22px] flex-none font-heading font-bold text-[11.5px] ${g.you ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-muted)]'}`,
      avatarStyle: `w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]`,
      nameStyle: `font-heading ${g.you ? 'font-bold' : 'font-semibold'} text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis ${g.you ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-primary)]'}`,
      answerStyle: `flex-none p-[6px_10px] rounded-[8px] font-heading font-bold text-[11.5px] whitespace-nowrap ${none ? 'text-[var(--text-muted)] border border-dashed border-[var(--surface-border-strong)]' : right ? 'bg-[var(--color-success)] text-[var(--tf-white)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]'}`
    };
  });

  const FACTS = [
    ["Final score", "Liverpool 2 Tottenham 1"],
    ["Scorers", "Salah 12', Gakpo 61', Solanke 78'"],
    ["Cards", "Van de Ven 44', Jones 66'"],
    ["Settled on", "90 minutes · no extra time"],
    ["Fact revision", isCorrecting ? "r3 pending operator confirm" : "r2 · confirmed by provider"]
  ];
  
  const facts = FACTS.map(([label, value], i, arr) => ({
    label, value,
    rowStyle: `flex items-baseline gap-[14px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''}`
  }));

  const heroBg = `linear-gradient(103deg, color-mix(in srgb, ${CLUB.LIV} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${CLUB.TOT} 42%, transparent) 0%, transparent 52%), var(--nav-surface)`;

  const sharedProps = {
    currentStatus,
    isSealed,
    isCorrecting,
    isOpen,
    market,
    marketPicker,
    rows,
    facts,
    heroBg,
    CLUB,
  };

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <FixtureResultsMobile {...sharedProps} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <FixtureResultsDesktop {...sharedProps} />
      </div>
    </div>
  );
}
