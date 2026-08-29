'use client';

import React from 'react';

interface FixtureResultsMobileProps {
  currentStatus: string[];
  isSealed: boolean;
  isCorrecting: boolean;
  isOpen: boolean;
  marketPicker: { id: string; label: string; pick: () => void; style: string }[];
  rows: any[];
  facts: any[];
  heroBg: string;
  CLUB: Record<string, string>;
}

export function FixtureResultsMobile(props: FixtureResultsMobileProps) {
  const {
    currentStatus,
    isSealed,
    isCorrecting,
    isOpen,
    marketPicker,
    rows,
    facts,
    heroBg,
    CLUB,
  } = props;

  return (
    <div className="flex flex-col w-full h-[100dvh] overflow-hidden relative bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)]">
      <header className="relative overflow-hidden flex-none text-[var(--nav-text)] p-[8px_var(--gutter)_0]" style={{ background: heroBg }}>
        <div className="relative">
          <div className="flex items-center gap-[11px]">
            <div className="tf-tap w-[36px] h-[36px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[14px]">
              ‹
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-[7px]">
                <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: currentStatus[2] }} />
                <span className="tf-kicker" style={{ color: currentStatus[2] }}>
                  {currentStatus[0]}
                </span>
              </div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{currentStatus[1]}</div>
            </div>
          </div>

          <div className="flex items-center gap-[12px] mt-[16px]">
            <span className="tf-crest w-[36px] h-[39px] text-[11px]" style={{ background: CLUB.LIV }}>
              LIV
            </span>
            <span
              className={`tf-num ${
                isSealed
                  ? 'font-heading font-bold text-[15px] text-[var(--nav-text-faint)]'
                  : 'font-heading font-bold text-[30px] leading-[1] tracking-[-1.2px]'
              }`}
            >
              {isSealed ? "SAT 15:00" : "2 — 1"}
            </span>
            <span className="tf-crest w-[36px] h-[39px] text-[11px]" style={{ background: CLUB.TOT }}>
              TOT
            </span>
            <div className="flex-1 text-right min-w-0">
              <div
                className="tf-num font-heading font-bold text-[26px] leading-[1] tracking-[-0.9px]"
                style={{ color: isCorrecting ? 'var(--nav-accent)' : 'var(--nav-text)' }}
              >
                {isSealed ? "" : "+28"}
              </div>
              <div className="text-[9.5px] text-[var(--nav-text-faint)] mt-[4px]">
                {isSealed ? "" : isCorrecting ? "before the correction" : "your points"}
              </div>
            </div>
          </div>

          {isCorrecting && (
            <div className="h-[3px] rounded-full mt-[14px] bg-[linear-gradient(90deg,rgba(255,255,255,.16)_0_40%,var(--nav-accent)_40%_60%,rgba(255,255,255,.16)_60%)] bg-[length:200px_100%] animate-[tfslide_1.1s_linear_infinite]" />
          )}
        </div>
        <div className="h-[16px]" />
      </header>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {isSealed && (
          <div className="p-[70px_30px] flex flex-col items-center text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[20px] text-[var(--text-muted)]">
              ◍
            </div>
            <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.5px] mt-[20px]">
              Everyone&apos;s answers stay sealed
            </div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[285px]">
              One market is still open, so nobody sees anybody — owners and admins included. This unlocks the moment the last one locks.
            </div>
            <div className="tf-num font-heading font-bold text-[34px] leading-[1] tracking-[-1.2px] mt-[24px]">1h 12m</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-[7px]">until total goals locks</div>
            <div className="text-[11.5px] leading-[1.55] text-[var(--text-muted)] mt-[26px] max-w-[280px]">
              Your own answers are always yours to see and change, on the fixture screen.
            </div>
          </div>
        )}

        {isOpen && (
          <div className="animate-[tfin_0.16s_ease]">
            <div className="tf-scroll flex gap-[6px] p-[12px_var(--gutter)] overflow-x-auto border-b border-[var(--surface-border)]">
              {marketPicker.map((m) => (
                <div key={m.id} onClick={m.pick} className={m.style}>
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex items-baseline justify-between p-[14px_var(--gutter)_10px]">
              <span className="tf-kicker text-[var(--text-muted)]">128 MEMBERS · 3 DID NOT ANSWER</span>
              <span className="text-[10px] text-[var(--text-muted)]">LEADERBOARD ORDER</span>
            </div>

            {rows.map((r, i) => (
              <div key={i} className={r.rowStyle}>
                <span className={`tf-num ${r.rankStyle}`}>{r.rank}</span>
                <span className={r.avatarStyle} style={{ background: r.tint }}>
                  {r.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={r.nameStyle}>{r.name}</div>
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{r.meta}</div>
                </div>
                <span className={r.answerStyle}>{r.answer}</span>
              </div>
            ))}

            <div className="tf-tap p-[15px] text-center font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] border-b border-[var(--surface-border)]">
              LOAD THE NEXT 25
            </div>

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
    </div>
  );
}
