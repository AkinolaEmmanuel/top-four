'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProblemStatesPage() {
  const [problem, setProblem] = useState<'field' | 'state' | 'conflict' | 'notfound' | 'forbidden' | 'ratelimit' | 'offline' | 'unexpected'>('field');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  const IconMap: any = {
    Ghost: () => (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9 9.5h.01M15 9.5h.01M9 15.4c1.8-1.4 4.2-1.4 6 0"/></svg>
    ),
    Lock: () => (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>
    ),
    Clock: () => (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></svg>
    ),
    Cloud: () => (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7 18Z"/><path d="M3 3l18 18"/></svg>
    ),
    Warn: () => (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4.5M12 17h.01"/></svg>
    )
  };

  const RenderIcon = isWhole ? IconMap[WHOLE.icon] : null;

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* App Container */}
      <div className="flex flex-col w-full max-w-[800px] mx-auto h-[100dvh] overflow-hidden relative">

        <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_16px]">
          <div className="flex items-center gap-[11px]">
            <Link href="/" className="w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5 8 12l6.5 7"/></svg>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-bold text-[16px] leading-[1.1] tracking-[-0.2px]">{headTitle}</div>
              <div className="font-medium text-[10px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
            </div>
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto flex flex-col bg-[var(--surface-canvas)]">
          {isField && (
            <div className="p-[20px_var(--gutter)] flex flex-col gap-[17px] animate-[tfin_0.16s_ease]">
              <div>
                <div className="font-heading font-bold text-[10px] leading-[1] tracking-[0.09em] uppercase text-[var(--text-muted)]">League name</div>
                <div className="border-[var(--control-ring)] border-solid border-[var(--surface-border-strong)] rounded-[11px] p-[11px_13px] bg-[var(--surface-card)] mt-[7px] text-[13.5px]">Office League</div>
              </div>
              <div>
                <div className="font-heading font-bold text-[10px] leading-[1] tracking-[0.09em] uppercase text-[var(--text-muted)]">Total goals line</div>
                <div className="border-[var(--control-ring)] border-solid border-[var(--color-danger)] rounded-[11px] p-[11px_13px] bg-[var(--surface-card)] mt-[7px] text-[13.5px]">3.0</div>
                <div className="flex gap-[7px] mt-[8px] items-start">
                  <span className="text-[var(--danger-text)] flex-none mt-[1px]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9.5v4M12 16.6h.01"/></svg>
                  </span>
                  <span className="text-[11.5px] leading-[1.5] text-[var(--danger-text)]">The line must end in .5 — pick 2.5 or 3.5. A whole number would let a match land exactly on the line with no correct answer.</span>
                </div>
              </div>
              <div>
                <div className="font-heading font-bold text-[10px] leading-[1] tracking-[0.09em] uppercase text-[var(--text-muted)]">Points for exact score</div>
                <div className="border-[var(--control-ring)] border-solid border-[var(--color-danger)] rounded-[11px] p-[11px_13px] bg-[var(--surface-card)] mt-[7px] text-[13.5px]">0</div>
                <div className="flex gap-[7px] mt-[8px] items-start">
                  <span className="text-[var(--danger-text)] flex-none mt-[1px]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9.5v4M12 16.6h.01"/></svg>
                  </span>
                  <span className="text-[11.5px] leading-[1.5] text-[var(--danger-text)]">Use 1 to 50. To score nothing for exact scores, switch the market off instead.</span>
                </div>
              </div>
              <div className="tf-tap min-h-[48px] rounded-[13px] flex items-center justify-center font-heading font-bold text-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] mt-[4px]">SAVE CHANGES</div>
              <div className="text-[11px] leading-[1.55] text-[var(--text-muted)] text-center">Everything you typed is still here. Two fields need attention; the rest saved fine.</div>
            </div>
          )}

          {isState && (
            <div className="animate-[tfin_0.16s_ease]">
              <div className="p-[16px_var(--gutter)_0]">
                <div className="p-[14px_15px] rounded-[12px] bg-[var(--surface-subtle)] border-l-[3px] border-[var(--state-locked)]">
                  <div className="font-heading font-bold text-[10px] tracking-[0.11em] text-[var(--text-secondary)]">THIS CLOSED WHILE YOU WERE HERE</div>
                  <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[7px]">Match result locked at 14:45, fifteen minutes before kick-off. Your earlier answers are saved and still count — only the change you just made could not be applied.</div>
                </div>
              </div>
              <div className="p-[16px_var(--gutter)] flex flex-col gap-[1px]">
                {marketRows.map((m, i) => (
                  <div key={i} className="flex items-center gap-[11px] p-[13px_0] border-b border-[var(--surface-border)]">
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-[13px]" style={{ color: m.titleColor }}>{m.title}</div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[4px]">{m.note}</div>
                    </div>
                    <span className={`font-heading font-bold text-[9px] leading-[1] tracking-[0.07em] p-[5px_7px] rounded-[5px] flex-none ${m.chipStyle}`}>{m.chip}</span>
                  </div>
                ))}
              </div>
              <div className="p-[0_var(--gutter)_22px] text-[11px] leading-[1.6] text-[var(--text-muted)] text-center">
                No dialog appeared. The screen simply re-read itself and now shows what is true — which is the normal course of a deadline passing, not an error anyone made.
              </div>
            </div>
          )}

          {isConflict && (
            <div className="p-[18px_var(--gutter)] flex flex-col gap-[15px] animate-[tfin_0.16s_ease]">
              <div>
                <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.35px]">Someone else changed this</div>
                <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">Tunde edited the league's points while you had this open. Your version was written against the older settings, so TopFour did not apply it. Nothing is lost — choose which to keep.</div>
              </div>
              <div className="border border-[var(--surface-border)] rounded-[13px] overflow-hidden">
                <div className="p-[12px_14px] bg-[var(--surface-subtle)] font-heading font-bold text-[10px] tracking-[0.1em] text-[var(--text-secondary)]">NOW STORED · VERSION 8</div>
                {[
                  { k: "Exact score", v: "6 pts" },
                  { k: "Anytime goalscorer", v: "5 pts" },
                  { k: "Total goals line", v: "2.5" }
                ].map((r, i) => (
                  <div key={i} className="flex justify-between p-[11px_14px] border-t border-[var(--surface-border)] bg-[var(--surface-card)]">
                    <span className="text-[12.5px] text-[var(--text-secondary)]">{r.k}</span>
                    <span className="font-heading font-semibold text-[12.5px]">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="border border-[var(--accent-border)] rounded-[13px] overflow-hidden">
                <div className="p-[12px_14px] bg-[var(--accent-surface)] font-heading font-bold text-[10px] tracking-[0.1em] text-[var(--accent-text)]">WHAT YOU SUBMITTED · FROM VERSION 7</div>
                {[
                  { k: "Exact score", v: "5 pts", color: "var(--text-primary)" },
                  { k: "Anytime goalscorer", v: "8 pts", color: "var(--accent-text)" },
                  { k: "Total goals line", v: "3.5", color: "var(--accent-text)" }
                ].map((r, i) => (
                  <div key={i} className="flex justify-between p-[11px_14px] border-t border-[var(--accent-border)] bg-[var(--surface-card)]">
                    <span className="text-[12.5px] text-[var(--text-secondary)]">{r.k}</span>
                    <span className="font-heading font-semibold text-[12.5px]" style={{ color: r.color }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="tf-tap min-h-[48px] rounded-[13px] flex items-center justify-center font-heading font-bold text-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)]">REAPPLY MY CHANGES</div>
              <div className="tf-tap min-h-[48px] rounded-[13px] flex items-center justify-center font-heading font-bold text-[13px] bg-[var(--surface-card)] border border-[var(--surface-border-strong)] text-[var(--text-primary)]">KEEP WHAT IS STORED</div>
              <div className="text-[11px] leading-[1.55] text-[var(--text-muted)] text-center">Reapplying re-reads first, then submits against version 8. TopFour never resubmits silently.</div>
            </div>
          )}

          {isWhole && (
            <div className="flex-1 p-[56px_28px] flex flex-col items-center text-center justify-center animate-[tfin_0.16s_ease]">
              <div style={{ color: WHOLE.color }}>{RenderIcon && <RenderIcon />}</div>
              <div className="font-heading font-bold text-[22px] leading-[1.18] tracking-[-0.45px] mt-[22px]">{WHOLE.title}</div>
              <div className="text-[13.5px] leading-[1.65] text-[var(--text-secondary)] mt-[12px] max-w-[290px]">{WHOLE.body}</div>

              {WHOLE.countdown && (
                <>
                  <div className="tf-tap mt-[26px] w-full max-w-[290px] min-h-[48px] rounded-[13px] flex items-center justify-center font-heading font-bold text-[13px] bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed">{WHOLE.countdown}</div>
                  <div className="mt-[10px] text-[11px] leading-[1.55] text-[var(--text-muted)] max-w-[280px]">The wait is exactly what the server asked for. TopFour never retries in the background and never counts down faster than the clock.</div>
                </>
              )}

              {WHOLE.action && (
                <div className="tf-tap mt-[26px] w-full max-w-[290px] min-h-[48px] rounded-[13px] flex items-center justify-center font-heading font-bold text-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)]">{WHOLE.action}</div>
              )}

              {WHOLE.secondary && (
                <div className="tf-tap mt-[12px] min-h-[44px] flex items-center font-heading font-semibold text-[12.5px] text-[var(--text-link)]">{WHOLE.secondary}</div>
              )}

              {WHOLE.rid && (
                <div className="mt-[24px] flex flex-col items-center gap-[7px]">
                  <span className="text-[10.5px] text-[var(--text-muted)]">Quote this if you contact us</span>
                  <span className="font-mono text-[10px] bg-[var(--surface-subtle)] border border-[var(--surface-border)] p-[2px_5px] rounded-[4px] text-[var(--text-secondary)]">{WHOLE.rid}</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div></div>
  );
}
