'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EndStatesPage() {
  const [screen, setScreen] = useState<'completed' | 'cancelled' | 'archived' | 'unsubscribe'>('completed');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const isUnsub = screen === "unsubscribe";
  const isLeague = !isUnsub;

  const CFG: any = {
    completed: {
      name: "Alumni 2024/25", date: "ENDED 14 MAY",
      badgeStyle: "bg-[var(--nav-fill)] text-[var(--nav-text)] p-[3px_7px] rounded-[5px]", badge: "COMPLETED",
      hero: ["3rd", "of 40 members", "612 points · nothing provisional left", "var(--nav-text)"],
      banner: ["THE TABLE IS FINAL", "Every market has settled", "A league finishes when the last expected market reaches a final decision and no question is still unresolved. Two of these fixtures settled as void — a void is a final decision, not a missing one.", "var(--tf-green-800)"],
      podium: true, archive: true, voided: null,
      open: [
        { title: "Final table", note: "Shared positions and every tiebreaker applied" },
        { title: "All 38 fixtures", note: "Your answers beside everyone else's" },
        { title: "Your points history", note: "Every entry, including 2 corrections" },
        { title: "League rules", note: "The ruleset this league was played under" }
      ],
      closed: [
        { title: "Predicting", note: "There is nothing left to answer" },
        { title: "Asking questions", note: "The last one resolved on 14 May" },
        { title: "Joining", note: "A finished league cannot take new members" }
      ],
      foot: "A completed league is kept indefinitely and stays fully readable. It no longer counts against your twenty unfinished leagues."
    },
    cancelled: {
      name: "Office 2024", date: "CANCELLED 2 FEB",
      badgeStyle: "bg-[var(--color-danger)] text-[var(--tf-white)] p-[3px_7px] rounded-[5px]", badge: "CANCELLED",
      hero: ["11", "of 30 fixtures counted", "You finished 9th of 18 on those eleven", "var(--nav-warning)"],
      banner: ["THE OWNER ENDED THIS LEAGUE", "Everything kicking off after 2 Feb, 15:04 was voided", "The cutoff is a moment, and kick-off decides the side. A fixture that had already kicked off settled normally on the real facts. Everything later was voided outright, whether or not you had answered it.", "var(--color-danger)"],
      podium: false, archive: false,
      voided: [
        { title: "19 fixtures", note: "Kick-off fell after the cutoff · every market on them voided" },
        { title: "3 open questions", note: "Unresolved at cancellation · voided with the rest" },
        { title: "Both lineups, Round 14", note: "Locked two hours out, but kick-off still fell after the cutoff" }
      ],
      open: [
        { title: "Table at cancellation", note: "Final, but built from 11 fixtures rather than 30" },
        { title: "The 11 settled fixtures", note: "Scored on the real result, exactly as normal" },
        { title: "Your points history", note: "A voided item shows a zero, not a blank" },
        { title: "League rules", note: "The ruleset as frozen at publication" }
      ],
      closed: [
        { title: "Predicting", note: "Cancellation closed every remaining market" },
        { title: "Resuming", note: "Permanent. A new league is the only way forward" }
      ],
      foot: "Cancellation cannot be undone and cannot be partially applied. Every member was emailed when it happened."
    },
    archived: {
      name: "Alumni 2024/25", date: "ARCHIVED 2 JUL",
      badgeStyle: "bg-[var(--nav-fill)] text-[var(--nav-text-quiet)] p-[3px_7px] rounded-[5px]", badge: "ARCHIVED",
      hero: ["3rd", "of 40 members", "612 points · completed 14 May", "var(--nav-text)"],
      banner: null, podium: true, archive: false, voided: null,
      open: [
        { title: "Final table", note: "Shared positions and every tiebreaker applied" },
        { title: "All 38 fixtures", note: "Read-only archive" },
        { title: "Your points history", note: "Every entry, fully retained" },
        { title: "League rules", note: "The ruleset as played" }
      ],
      closed: [
        { title: "Predicting", note: "Closed when the league completed" },
        { title: "Joining", note: "Closed when the league completed" }
      ],
      foot: "Archived leagues stay readable forever. Archiving simply keeps your active league list uncluttered."
    },
    unsubscribe: {
      title: "Weekly prediction reminders",
      body: "You will no longer receive the Monday reminder email for any league. In-app alerts, deadline banners and account security emails are unaffected.",
      button: "Resubscribe to weekly reminders",
      foot: "Account security emails (passwords, email changes, new logins) can never be turned off."
    }
  };

  const current = CFG[screen];

  return (
    <div className={`flex-1 flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''} overflow-y-auto`}>
      <div className="flex flex-col w-full max-w-[1080px] mx-auto p-[20px_16px] md:p-[36px] overflow-hidden relative">
        {/* Navigation Selector Bar */}
        <div className="flex flex-wrap items-center gap-[8px] pb-[20px] border-b border-[var(--surface-border)] mb-[24px]">
          <span className="text-[12px] font-heading font-semibold text-[var(--text-muted)] mr-[8px]">END STATE DEMOS:</span>
          {[
            { id: 'completed', label: 'Completed League' },
            { id: 'cancelled', label: 'Cancelled League' },
            { id: 'archived', label: 'Archived League' },
            { id: 'unsubscribe', label: 'Unsubscribe Confirmation' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setScreen(s.id as any)}
              className={`h-[34px] px-[14px] rounded-[9px] text-[12px] font-heading font-semibold transition-all cursor-pointer ${
                screen === s.id
                  ? 'bg-[var(--color-brand)] text-white shadow-sm'
                  : 'bg-[var(--surface-card)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content View */}
        {isLeague ? (
          <div className="flex flex-col gap-[24px]">
            {/* Header Card */}
            <div className="rounded-[20px] bg-[var(--nav-surface)] text-[var(--nav-text)] p-[28px_32px] border border-[var(--surface-border)] shadow-[var(--elev-3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[11px] font-heading font-bold tracking-[0.08em] uppercase text-[var(--nav-text-faint)]">
                    {current.date}
                  </span>
                  <span className={`text-[10px] font-heading font-bold ${current.badgeStyle}`}>{current.badge}</span>
                </div>
                <Link href="/leagues" className="text-[12.5px] text-[var(--nav-text-quiet)] hover:text-white">
                  ‹ Back to Leagues
                </Link>
              </div>

              <h1 className="font-heading font-bold text-[32px] tracking-[-0.8px] mt-[12px] text-white">
                {current.name}
              </h1>

              <div className="flex items-baseline gap-[12px] mt-[16px] pt-[16px] border-t border-[rgba(255,255,255,0.1)]">
                <span className="font-heading font-bold text-[36px] tracking-[-1px] text-white font-tabular-nums">
                  {current.hero[0]}
                </span>
                <span className="text-[14px] text-[var(--nav-text-quiet)]">{current.hero[1]}</span>
                <span className="text-[12px] text-[var(--nav-text-faint)] ml-[auto]">{current.hero[2]}</span>
              </div>
            </div>

            {/* Banner Notice */}
            {current.banner && (
              <div
                className="rounded-[16px] p-[20px_24px] text-white flex flex-col gap-[4px] shadow-sm"
                style={{ background: current.banner[3] }}
              >
                <div className="font-heading font-bold text-[11px] tracking-[0.1em] uppercase opacity-85">
                  {current.banner[0]}
                </div>
                <div className="font-heading font-bold text-[17px]">{current.banner[1]}</div>
                <p className="text-[12.5px] leading-[1.6] opacity-90 mt-[4px]">{current.banner[2]}</p>
              </div>
            )}

            {/* Grid Sections: Open Resources vs Closed Markets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              {/* Still Viewable */}
              <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)]">
                <h2 className="font-heading font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--text-muted)] pb-[12px] border-b border-[var(--surface-border)]">
                  RESOURCES (READ ONLY)
                </h2>
                <div className="divide-y divide-[var(--surface-border)] mt-[4px]">
                  {current.open.map((item: any, i: number) => (
                    <div key={i} className="py-[12px] flex items-center justify-between cursor-pointer hover:bg-[var(--surface-subtle)] px-[8px] rounded-[8px] transition-colors">
                      <div>
                        <div className="font-heading font-semibold text-[13.5px]">{item.title}</div>
                        <div className="text-[11.5px] text-[var(--text-muted)] mt-[2px]">{item.note}</div>
                      </div>
                      <span className="text-[14px] text-[var(--text-muted)]">›</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inactive Features */}
              <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)]">
                <h2 className="font-heading font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--text-muted)] pb-[12px] border-b border-[var(--surface-border)]">
                  LOCKED / COMPLETED
                </h2>
                <div className="divide-y divide-[var(--surface-border)] mt-[4px]">
                  {current.closed.map((item: any, i: number) => (
                    <div key={i} className="py-[12px] px-[8px]">
                      <div className="font-heading font-semibold text-[13.5px] text-[var(--text-secondary)]">{item.title}</div>
                      <div className="text-[11.5px] text-[var(--text-muted)] mt-[2px]">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[12px] leading-[1.6] text-[var(--text-muted)] p-[8px_4px]">{current.foot}</p>
          </div>
        ) : (
          /* Unsubscribe View */
          <div className="max-w-[600px] mx-auto w-full bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[20px] p-[36px] shadow-[var(--elev-3)] text-center">
            <div className="w-[56px] h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px] mx-auto text-[var(--color-success)]">
              ✓
            </div>
            <h1 className="font-heading font-bold text-[24px] tracking-[-0.5px] mt-[20px]">
              Unsubscribed from {current.title}
            </h1>
            <p className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[12px]">
              {current.body}
            </p>
            <button className="mt-[28px] h-[46px] px-[24px] rounded-[12px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] font-heading font-semibold text-[13px] transition-colors cursor-pointer">
              {current.button}
            </button>
            <p className="text-[11.5px] leading-[1.6] text-[var(--text-muted)] mt-[20px]">
              {current.foot}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
