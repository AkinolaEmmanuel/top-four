'use client';

import React from 'react';
import Link from 'next/link';

interface FixtureResultsDesktopProps {
  currentStatus: string[];
  isSealed: boolean;
  isCorrecting: boolean;
  isOpen: boolean;
  market: string;
  marketPicker: { id: string; label: string; pick: () => void; style: string }[];
  rows: any[];
  facts: any[];
  heroBg: string;
  CLUB: Record<string, string>;
}

export function FixtureResultsDesktop(props: FixtureResultsDesktopProps) {
  const {
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
  } = props;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)] overflow-y-auto">
      {/* Top Banner Hero */}
      <div className="w-full text-[var(--nav-text)] p-[28px_36px] relative overflow-hidden border-b border-[var(--surface-border)]" style={{ background: heroBg }}>
        <div className="max-w-[1200px] mx-auto flex flex-col gap-[20px]">
          {/* Breadcrumb / Back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <Link href="/home" className="text-[13px] text-[var(--nav-text-quiet)] hover:text-[var(--nav-text)] flex items-center gap-[6px]">
                <span>‹</span> Back to Fixtures
              </Link>
              <span className="text-[var(--nav-border)]">/</span>
              <div className="flex items-center gap-[7px]">
                <span className="w-[8px] h-[8px] rounded-full flex-none" style={{ background: currentStatus[2] }} />
                <span className="font-heading font-bold text-[11px] tracking-[0.08em] uppercase" style={{ color: currentStatus[2] }}>
                  {currentStatus[0]}
                </span>
              </div>
            </div>
            <div className="text-[12px] text-[var(--nav-text-faint)]">{currentStatus[1]}</div>
          </div>

          {/* Match Scoreline & Points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[20px]">
              <div className="flex items-center gap-[14px]">
                <div
                  className="w-[52px] h-[52px] rounded-[14px] grid place-items-center font-heading font-bold text-[15px] text-white shadow-md"
                  style={{ background: CLUB.LIV || '#b7152b' }}
                >
                  LIV
                </div>
                <span className="font-heading font-bold text-[18px]">Liverpool</span>
              </div>

              <div className="px-[24px] py-[6px] rounded-[16px] bg-[rgba(0,0,0,0.25)] border border-[rgba(255,255,255,0.1)]">
                <span className="font-heading font-bold text-[38px] tracking-[-1.5px] font-tabular-nums text-white">
                  {isSealed ? "SAT 15:00" : "2 — 1"}
                </span>
              </div>

              <div className="flex items-center gap-[14px]">
                <span className="font-heading font-bold text-[18px]">Tottenham</span>
                <div
                  className="w-[52px] h-[52px] rounded-[14px] grid place-items-center font-heading font-bold text-[15px] text-white shadow-md"
                  style={{ background: CLUB.TOT || '#17233d' }}
                >
                  TOT
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <div
                className="font-heading font-bold text-[36px] leading-[1] tracking-[-1px]"
                style={{ color: isCorrecting ? 'var(--nav-accent)' : 'var(--nav-text)' }}
              >
                {isSealed ? "" : "+28"}
              </div>
              <div className="text-[12px] text-[var(--nav-text-faint)] mt-[4px]">
                {isSealed ? "" : isCorrecting ? "before the correction" : "your points awarded"}
              </div>
            </div>
          </div>

          {isCorrecting && (
            <div className="h-[4px] rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,.16)_0_40%,var(--nav-accent)_40%_60%,rgba(255,255,255,.16)_60%)] bg-[length:200px_100%] animate-[tfslide_1.1s_linear_infinite]" />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1200px] w-full mx-auto p-[32px] flex flex-col gap-[28px]">
        {/* Market Selector Chips */}
        {isOpen && (
          <div className="flex items-center justify-between pb-[16px] border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[12px] font-heading font-semibold text-[var(--text-muted)] mr-[8px]">MARKET:</span>
              {marketPicker.map((m) => {
                const on = market === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={m.pick}
                    className={`h-[36px] px-[16px] rounded-full font-heading font-semibold text-[12px] transition-all cursor-pointer ${
                      on
                        ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)] font-bold shadow-sm'
                        : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[12px] text-[var(--text-muted)] font-heading font-semibold">
              128 MEMBERS · 3 DID NOT ANSWER
            </div>
          </div>
        )}

        {isSealed ? (
          <div className="p-[80px_30px] flex flex-col items-center text-center max-w-[500px] mx-auto bg-[var(--surface-card)] rounded-[20px] border border-[var(--surface-border)]">
            <div className="w-[64px] h-[64px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[26px] text-[var(--text-muted)]">
              ◍
            </div>
            <h2 className="font-heading font-bold text-[24px] leading-[1.2] tracking-[-0.6px] mt-[24px]">
              Everyone&apos;s answers stay sealed
            </h2>
            <p className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[12px]">
              One market is still open, so nobody sees anybody — owners and admins included. This unlocks the moment the last one locks.
            </p>
            <div className="font-heading font-bold text-[40px] leading-[1] tracking-[-1.5px] mt-[28px] text-[var(--color-brand)] font-tabular-nums">
              1h 12m
            </div>
            <div className="text-[12px] text-[var(--text-muted)] mt-[8px]">until total goals locks</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] items-start">
            {/* Left: Rivals Grid Table (8 cols) */}
            <div className="lg:col-span-8 rounded-[16px] bg-[var(--surface-card)] border border-[var(--surface-border)] overflow-hidden shadow-[var(--elev-2)]">
              <div className="p-[14px_20px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)] flex items-center justify-between text-[11px] font-heading font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                <div className="flex items-center gap-[24px]">
                  <span className="w-[30px]">POS</span>
                  <span>MEMBER</span>
                </div>
                <span>PREDICTION</span>
              </div>

              <div className="divide-y divide-[var(--surface-border)]">
                {rows.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-[12px_20px] transition-colors ${
                      r.you ? 'bg-[var(--accent-surface)]' : 'hover:bg-[var(--surface-subtle)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-[18px]">
                      <span className={`w-[30px] font-heading font-bold text-[13px] ${r.you ? 'text-[var(--color-brand)]' : 'text-[var(--text-muted)]'}`}>
                        {r.rank}
                      </span>
                      <div className="flex items-center gap-[12px]">
                        <span
                          className="w-[34px] h-[34px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] text-white shadow-sm"
                          style={{ background: r.tint }}
                        >
                          {r.initials}
                        </span>
                        <div>
                          <div className={`font-heading ${r.you ? 'font-bold text-[var(--color-brand)]' : 'font-semibold'} text-[13.5px]`}>
                            {r.name} {r.you && <span className="text-[11px] font-normal text-[var(--text-muted)] ml-[4px]">(You)</span>}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-[2px]">{r.meta}</div>
                        </div>
                      </div>
                    </div>

                    <span className={r.answerStyle}>{r.answer}</span>
                  </div>
                ))}
              </div>

              <button className="w-full p-[14px] text-center font-heading font-bold text-[11.5px] tracking-[0.05em] text-[var(--text-link)] hover:bg-[var(--surface-subtle)] transition-colors border-t border-[var(--surface-border)] cursor-pointer">
                LOAD THE NEXT 25 MEMBERS
              </button>
            </div>

            {/* Right: Match Facts Panel (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-[20px]">
              <div className="rounded-[16px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[20px] shadow-[var(--elev-2)]">
                <h3 className="font-heading font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--text-muted)] pb-[12px] border-b border-[var(--surface-border)]">
                  MATCH FACTS USED
                </h3>

                <div className="divide-y divide-[var(--surface-border)] mt-[6px]">
                  {facts.map((f, i) => (
                    <div key={i} className="py-[10px] flex items-baseline justify-between gap-[12px]">
                      <span className="text-[12px] text-[var(--text-secondary)] flex-none">{f.label}</span>
                      <span className="font-heading font-semibold text-[12px] text-right text-[var(--text-primary)]">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--surface-border)] p-[16px] text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
                Members who left the league are not listed, and their answers are hidden from everyone. Extra time counts for every market; shootouts never do.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
