'use client';

import { useState } from 'react';
import { FixtureResultsMobile } from '@/app/components/fixtures/FixtureResultsMobile';
import { FixtureResultsDesktop } from '@/app/components/fixtures/FixtureResultsDesktop';
import { useAuth } from '@/context/auth-context';

const CLUB: Record<string, string> = { LIV: "#b7152b", TOT: "#17233d", ARS: "#c8182f", CHE: "#1746a2" };

export default function FixtureResultsPage() {
  const { user } = useAuth();
  const [theme] = useState<'light' | 'dark'>('dark');
  const [state] = useState<'sealed' | 'provisional' | 'final' | 'correcting'>('final');
  const [market, setMarket] = useState('result');

  const st = state;
  const isSealed = st === "sealed";
  const isCorrecting = st === "correcting";
  const isOpen = !isSealed;

  const STATUS: Record<string, string[]> = {
    sealed: ["ONE MARKET STILL OPEN", "Premier League · In Progress", "var(--nav-text-faint)"],
    provisional: ["PROVISIONAL RESULTS", "Premier League · full time", "var(--state-provisional)"],
    final: ["FULL TIME · SETTLED", "Premier League · settled", "var(--nav-positive)"],
    correcting: ["CORRECTION IN PROGRESS", "A match fact was repaired · recalculating", "var(--nav-accent)"]
  };

  const currentStatus = STATUS[st];

  const NAMES: Record<string, string> = { result: "Result", score: "Exact score", btts: "BTTS", goals: "Over / under", scorer: "Scorer" };
  const marketPicker = ["result", "score", "btts", "goals", "scorer"].map(id => ({
    id, label: NAMES[id], pick: () => setMarket(id),
    style: `h-[32px] px-[12px] rounded-full grid place-items-center whitespace-nowrap flex-none cursor-pointer font-heading font-bold text-[10.5px] ${market === id ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`
  }));

  const rows = user ? [
    {
      rank: "1",
      name: user.displayName || "You",
      initials: (user.displayName || "YO").substring(0, 2).toUpperCase(),
      meta: "Your prediction",
      you: true,
      tint: "var(--color-brand)",
      answer: "Submitted",
      rowStyle: `flex items-center gap-[11px] p-[11px_var(--gutter)] border-t border-[var(--surface-border)] border-b bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]`,
      rankStyle: `w-[22px] flex-none font-heading font-bold text-[11.5px] text-[var(--accent-text-strong)]`,
      avatarStyle: `w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]`,
      nameStyle: `font-heading font-bold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis text-[var(--accent-text-strong)]`,
      answerStyle: `flex-none p-[6px_10px] rounded-[8px] font-heading font-bold text-[11.5px] whitespace-nowrap bg-[var(--color-success)] text-[var(--tf-white)]`
    }
  ] : [];

  const FACTS = [
    ["Status", "Official score verified by data feed"],
    ["Settled on", "90 minutes · standard settlement"]
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
