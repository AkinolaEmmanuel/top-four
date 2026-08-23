'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* App Container */}
      <div className="flex flex-col w-full max-w-[800px] mx-auto h-[100dvh] overflow-hidden relative">

        <header className="relative overflow-hidden flex-none text-[var(--nav-text)] p-[8px_var(--gutter)_0]" style={{ background: heroBg }}>
          <div className="relative">
            <div className="flex items-center gap-[11px]">
              <div className="tf-tap w-[36px] h-[36px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[14px]">‹</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[7px]">
                  <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: currentStatus[2] }}></span>
                  <span className="tf-kicker" style={{ color: currentStatus[2] }}>{currentStatus[0]}</span>
                </div>
                <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{currentStatus[1]}</div>
              </div>
            </div>

            <div className="flex items-center gap-[12px] mt-[16px]">
              <span className="tf-crest w-[36px] h-[39px] text-[11px]" style={{ background: CLUB.LIV }}>LIV</span>
              <span className={`tf-num ${isSealed ? 'font-heading font-bold text-[15px] text-[var(--nav-text-faint)]' : 'font-heading font-bold text-[30px] leading-[1] tracking-[-1.2px]'}`}>
                {isSealed ? "SAT 15:00" : "2 — 1"}
              </span>
              <span className="tf-crest w-[36px] h-[39px] text-[11px]" style={{ background: CLUB.TOT }}>TOT</span>
              <div className="flex-1 text-right min-w-0">
                <div className="tf-num font-heading font-bold text-[26px] leading-[1] tracking-[-0.9px]" style={{ color: isCorrecting ? 'var(--nav-accent)' : 'var(--nav-text)' }}>
                  {isSealed ? "" : "+28"}
                </div>
                <div className="text-[9.5px] text-[var(--nav-text-faint)] mt-[4px]">
                  {isSealed ? "" : isCorrecting ? "before the correction" : "your points"}
                </div>
              </div>
            </div>

            {isCorrecting && (
              <div className="h-[3px] rounded-full mt-[14px] bg-[linear-gradient(90deg,rgba(255,255,255,.16)_0_40%,var(--nav-accent)_40%_60%,rgba(255,255,255,.16)_60%)] bg-[length:200px_100%] animate-[tfslide_1.1s_linear_infinite]"></div>
            )}
          </div>
          <div className="h-[16px]"></div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
          {isSealed && (
            <div className="p-[70px_30px] flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[20px] text-[var(--text-muted)]">◍</div>
              <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px] mt-[20px]">Everyone's answers stay sealed</div>
              <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[285px]">One market is still open, so nobody sees anybody — owners and admins included. This unlocks the moment the last one locks.</div>
              <div className="tf-num font-heading font-bold text-[34px] leading-[1] tracking-[-1.2px] mt-[24px]">1h 12m</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-[7px]">until total goals locks</div>
              <div className="text-[11.5px] leading-[1.55] text-[var(--text-muted)] mt-[26px] max-w-[280px]">Your own answers are always yours to see and change, on the fixture screen.</div>
            </div>
          )}

          {isOpen && (
            <div className="animate-[tfin_0.16s_ease]">
              <div className="tf-scroll flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto border-b border-[var(--surface-border)]">
                {marketPicker.map(m => (
                  <div key={m.id} onClick={m.pick} className={m.style}>{m.label}</div>
                ))}
              </div>

              <div className="flex items-baseline justify-between p-[14px_var(--gutter)_10px]">
                <span className="tf-kicker text-[var(--text-muted)]">128 MEMBERS · 3 DID NOT ANSWER</span>
                <span className="text-[10px] text-[var(--text-muted)]">LEADERBOARD ORDER</span>
              </div>

              {rows.map((r, i) => (
                <div key={i} className={r.rowStyle}>
                  <span className={`tf-num ${r.rankStyle}`}>{r.rank}</span>
                  <span className={r.avatarStyle} style={{ background: r.tint }}>{r.initials}</span>
                  <div className="flex-1 min-w-0">
                    <div className={r.nameStyle}>{r.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-[3px]">{r.meta}</div>
                  </div>
                  <span className={r.answerStyle}>{r.answer}</span>
                </div>
              ))}

              <div className="tf-tap p-[15px] text-center font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] border-b border-[var(--surface-border)]">LOAD THE NEXT 25</div>

              <section className="mt-[22px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">MATCH FACTS USED</div>
                {facts.map((f, i) => (
                  <div key={i} className={f.rowStyle}>
                    <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{f.label}</span>
                    <span className="font-heading font-semibold text-[11.5px] text-right flex-1">{f.value}</span>
                  </div>
                ))}
              </section>

              <div className="p-[16px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">
                Members who left the league are not listed, and their answers are hidden from everyone — including themselves. Extra time counts for every market; a shootout never does, so a tie decided on penalties settles as a draw.
              </div>
            </div>
          )}
        </main>
      </div></div>
  );
}
