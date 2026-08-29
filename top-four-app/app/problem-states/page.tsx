'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProblemStatesPage() {
  const [problem, setProblem] = useState<'field' | 'state' | 'conflict' | 'notfound' | 'forbidden' | 'ratelimit' | 'offline' | 'unexpected'>('field');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const isField = problem === "field";
  const isState = problem === "state";
  const isConflict = problem === "conflict";

  const marketRows = [
    { title: "Match result", note: "Locked 14:45 · your answer stands", titleColor: "var(--text-muted)", chip: "LOCKED", chipStyle: "bg-[var(--surface-subtle)] text-[var(--state-locked)]" },
    { title: "Exact score", note: "Locked 14:45 · your answer stands", titleColor: "var(--text-muted)", chip: "LOCKED", chipStyle: "bg-[var(--surface-subtle)] text-[var(--state-locked)]" },
    { title: "Anytime goalscorer", note: "Still open · locks 14:45", titleColor: "var(--text-primary)", chip: "OPEN", chipStyle: "bg-[var(--accent-surface)] text-[var(--accent-text)]" },
    { title: "Starting lineups", note: "Locked 13:00 — two hours before kick-off", titleColor: "var(--text-muted)", chip: "LOCKED", chipStyle: "bg-[var(--surface-subtle)] text-[var(--state-locked)]" }
  ];

  const WHOLE_MAP: Record<string, any> = {
    notfound: {
      icon: "Ghost", color: "var(--text-muted)",
      title: "Not found, or no longer available",
      body: "This league either does not exist or is not one you can see. TopFour deliberately does not say which — telling you the difference would reveal which leagues exist and who is in them.",
      action: "BACK TO MY LEAGUES", secondary: "", countdown: "", rid: ""
    },
    forbidden: {
      icon: "Lock", color: "var(--text-muted)",
      title: "Only the owner can do that",
      body: "Publishing, cancelling and transferring ownership are the owner's alone — an admin cannot do them. You are an admin here, so you can still manage invitations, join requests and questions.",
      action: "BACK TO THE LEAGUE", secondary: "See what each role can do", countdown: "", rid: ""
    },
    ratelimit: {
      icon: "Clock", color: "var(--warn-text)",
      title: "Too many attempts",
      body: "For your account's safety, sign-in is paused for a short while. This happens after several failed attempts and clears on its own — nothing is locked permanently.",
      action: "", secondary: "Reset your password instead", countdown: "TRY AGAIN IN 0:47", rid: ""
    },
    offline: {
      icon: "Cloud", color: "var(--text-muted)",
      title: "You're offline",
      body: "TopFour needs a connection. Predictions are never queued to send later — a deadline could pass while an answer sat on your phone, and you would believe it was in.",
      action: "TRY AGAIN", secondary: "", countdown: "", rid: ""
    },
    unexpected: {
      icon: "Warn", color: "var(--warn-text)",
      title: "Something went wrong at our end",
      body: "This one is not your connection and not anything you did. Nothing you had saved is affected. If it keeps happening, quoting the reference below lets us find this exact request.",
      action: "TRY AGAIN", secondary: "", countdown: "", rid: "req_01J9KX7T2M4A8QF3"
    }
  };
  const WHOLE = WHOLE_MAP[problem];
  const isWhole = !!WHOLE;

  const headTitle = { field: "Points and rules", state: "Arsenal v Chelsea", conflict: "Points and rules", notfound: "League", forbidden: "League", ratelimit: "Sign in", offline: "TopFour", unexpected: "TopFour" }[problem];
  const headSub = { field: "Office League · step 3 of 5", state: "Premier Predictors · Round 3", conflict: "Office League · version conflict", notfound: "", forbidden: "Office League · admin", ratelimit: "", offline: "No connection", unexpected: "" }[problem];

  return (
    <div className={`flex-1 flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''} overflow-y-auto`}>
      <div className="flex flex-col w-full max-w-[1080px] mx-auto p-[20px_16px] md:p-[36px] overflow-hidden relative">
        {/* State Selector Bar */}
        <div className="flex flex-wrap items-center gap-[8px] pb-[20px] border-b border-[var(--surface-border)] mb-[24px]">
          <span className="text-[12px] font-heading font-semibold text-[var(--text-muted)] mr-[8px]">PROBLEM STATE:</span>
          {[
            { id: 'field', label: 'Field Validation' },
            { id: 'state', label: 'Mid-Air Lock' },
            { id: 'conflict', label: 'Version Conflict' },
            { id: 'notfound', label: '404 Not Found' },
            { id: 'forbidden', label: '403 Forbidden' },
            { id: 'ratelimit', label: '429 Rate Limit' },
            { id: 'offline', label: 'Offline' },
            { id: 'unexpected', label: '500 Server Error' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setProblem(s.id as any)}
              className={`h-[34px] px-[14px] rounded-[9px] text-[12px] font-heading font-semibold transition-all cursor-pointer ${
                problem === s.id
                  ? 'bg-[var(--color-brand)] text-white shadow-sm'
                  : 'bg-[var(--surface-card)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Header Preview */}
        <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[18px_24px] rounded-[16px] border border-[var(--surface-border)] shadow-[var(--elev-2)] mb-[20px]">
          <div className="flex items-center gap-[12px]">
            <Link href="/home" className="w-[36px] h-[36px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[14px] hover:text-white">
              ‹
            </Link>
            <div>
              <h1 className="font-heading font-bold text-[20px] leading-[1.1]">{headTitle}</h1>
              {headSub && <div className="text-[12px] text-[var(--nav-text-faint)] mt-[3px]">{headSub}</div>}
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="bg-[var(--surface-card)] rounded-[18px] border border-[var(--surface-border)] p-[28px] shadow-[var(--elev-2)]">
          {isField && (
            <div className="max-w-[560px] flex flex-col gap-[20px]">
              <div>
                <label className="block font-heading font-bold text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-[6px]">
                  League name
                </label>
                <input
                  type="text"
                  defaultValue="Office League"
                  className="w-full h-[46px] px-[14px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13.5px] outline-none"
                />
              </div>

              <div>
                <label className="block font-heading font-bold text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-[6px]">
                  Total goals line
                </label>
                <input
                  type="text"
                  defaultValue="3.0"
                  className="w-full h-[46px] px-[14px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--color-danger)] text-[13.5px] outline-none"
                />
                <p className="text-[12px] leading-[1.5] text-[var(--danger-text)] mt-[6px]">
                  The line must end in .5 — pick 2.5 or 3.5. A whole number would let a match land exactly on the line with no correct answer.
                </p>
              </div>

              <div>
                <label className="block font-heading font-bold text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-[6px]">
                  Points for exact score
                </label>
                <input
                  type="text"
                  defaultValue="0"
                  className="w-full h-[46px] px-[14px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--color-danger)] text-[13.5px] outline-none"
                />
                <p className="text-[12px] leading-[1.5] text-[var(--danger-text)] mt-[6px]">
                  Use 1 to 50. To score nothing for exact scores, switch the market off instead.
                </p>
              </div>

              <button className="h-[46px] px-[24px] rounded-[11px] bg-[var(--color-brand)] text-white font-heading font-bold text-[13px] shadow-[var(--elev-glow)] hover:bg-[var(--color-brand)]/90 transition-all cursor-pointer">
                Save Changes
              </button>
            </div>
          )}

          {isState && (
            <div className="max-w-[700px] flex flex-col gap-[20px]">
              <div className="p-[18px_20px] rounded-[14px] bg-[var(--surface-subtle)] border-l-[4px] border-[var(--state-locked)]">
                <div className="font-heading font-bold text-[11px] tracking-[0.1em] uppercase text-[var(--text-secondary)]">
                  THIS CLOSED WHILE YOU WERE HERE
                </div>
                <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[8px]">
                  Match result locked at 14:45, fifteen minutes before kick-off. Your earlier answers are saved and still count — only the change you just made could not be applied.
                </div>
              </div>

              <div className="divide-y divide-[var(--surface-border)]">
                {marketRows.map((m, i) => (
                  <div key={i} className="py-[14px] flex items-center justify-between">
                    <div>
                      <div className="font-heading font-semibold text-[14px]" style={{ color: m.titleColor }}>{m.title}</div>
                      <div className="text-[11.5px] text-[var(--text-muted)] mt-[2px]">{m.note}</div>
                    </div>
                    <span className={`px-[10px] py-[3px] rounded-[6px] font-heading font-bold text-[10px] tracking-[0.06em] uppercase ${m.chipStyle}`}>
                      {m.chip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isConflict && (
            <div className="max-w-[600px] flex flex-col gap-[16px]">
              <div className="p-[20px] rounded-[14px] bg-[rgba(239,68,68,0.08)] border border-[var(--color-danger)]">
                <div className="font-heading font-bold text-[16px] text-[var(--danger-text)]">
                  The league rules were updated elsewhere
                </div>
                <p className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[8px]">
                  Another administrator changed the configuration while you were editing. Reloading brings the current version so you can review their changes.
                </p>
              </div>

              <button className="h-[46px] px-[22px] rounded-[11px] bg-[var(--color-brand)] text-white font-heading font-bold text-[13px] shadow-[var(--elev-glow)] cursor-pointer hover:bg-[var(--color-brand)]/90 transition-all self-start">
                Reload Current Rules
              </button>
            </div>
          )}

          {isWhole && (
            <div className="max-w-[560px] mx-auto text-center py-[24px] flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[24px]" style={{ color: WHOLE.color }}>
                {WHOLE.icon === 'Ghost' ? '👻' : WHOLE.icon === 'Lock' ? '🔒' : WHOLE.icon === 'Clock' ? '⏱' : WHOLE.icon === 'Cloud' ? '☁' : '⚠'}
              </div>
              <h2 className="font-heading font-bold text-[22px] tracking-[-0.5px] mt-[20px]">
                {WHOLE.title}
              </h2>
              <p className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">
                {WHOLE.body}
              </p>

              {WHOLE.action && (
                <button className="mt-[24px] h-[46px] px-[24px] rounded-[11px] bg-[var(--color-brand)] text-white font-heading font-bold text-[13px] shadow-[var(--elev-glow)] cursor-pointer hover:bg-[var(--color-brand)]/90 transition-all">
                  {WHOLE.action}
                </button>
              )}

              {WHOLE.rid && (
                <div className="mt-[20px] font-mono text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] px-[12px] py-[6px] rounded-[6px]">
                  Reference ID: {WHOLE.rid}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
