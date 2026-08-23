'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EndStatesPage() {
  const [screen, setScreen] = useState<'completed' | 'cancelled' | 'archived' | 'unsubscribe'>('completed');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
        { title: "Final table", note: "Unchanged since 1 June" },
        { title: "All fixtures and answers", note: "The complete history" },
        { title: "Your points history", note: "The complete ledger" },
        { title: "League rules", note: "The ruleset this league was played under" }
      ],
      closed: [
        { title: "Predicting", note: "The league completed before it was archived" },
        { title: "Joining", note: "Membership closed when the league completed" },
        { title: "Unarchiving", note: "There is no way back from here in the app" }
      ],
      foot: "Archiving only moves a completed league out of everyone's active list. Nothing was voided, no points changed, and every screen above reads exactly as it did on 1 June."
    }
  };

  const PODIUMS: any = {
    completed: [
      { rank: "1", name: "Ope Adeyemi", initials: "OA", note: "36 exact scores", points: "684", self: false },
      { rank: "2", name: "Marcus Bell", initials: "MB", note: "Led from Round 9", points: "651", self: false },
      { rank: "3", name: "Kolade", initials: "KA", note: "Best run: 7 in a row", points: "612", self: true },
      { rank: "4", name: "Priya Raman", initials: "PR", note: "31 exact scores", points: "588", self: false }
    ],
    archived: [
      { rank: "1", name: "Ope Adeyemi", initials: "OA", note: "Won it on the last night", points: "684", self: false },
      { rank: "2", name: "Marcus Bell", initials: "MB", note: "Led from Round 9", points: "651", self: false },
      { rank: "3", name: "Kolade", initials: "KA", note: "72 points off the top", points: "612", self: true }
    ]
  };

  const cfg = CFG[isUnsub ? "completed" : screen];
  const podium = PODIUMS[isUnsub ? "completed" : screen] || [];

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* App Container */}
      <div className="flex flex-col w-full max-w-[800px] mx-auto h-[100dvh] overflow-hidden relative">

        {isUnsub && (
          <div className="flex-1 flex flex-col min-h-0 animate-[tfin_0.16s_ease]">
            <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[6px_var(--gutter)_24px]">
              <div className="font-heading font-bold text-[17px] leading-[1] tracking-[-0.5px]">TOPFOUR<span className="text-[var(--nav-accent)]">/</span></div>
              <div className="flex items-center gap-[7px] mt-[26px]">
                <span className="w-[7px] h-[7px] rounded-full bg-[var(--nav-positive)] flex-none"></span>
                <span className="tf-kicker text-[var(--nav-positive)]">UNSUBSCRIBED</span>
              </div>
              <div className="font-heading font-bold text-[29px] leading-[1.08] tracking-[-1px] mt-[12px]">Deadline reminders<br/>are off</div>
              <div className="text-[11.5px] text-[var(--nav-text-faint)] mt-[10px]">Premier Predictors · applies to this league only</div>
            </header>

            <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
              <div className="tf-kicker text-[var(--text-muted)] p-[20px_var(--gutter)_10px]">WHAT THIS CHANGES</div>
              <div className="flex items-start gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)]">
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-[13.5px] tracking-[-0.2px]">Deadline reminders</div>
                  <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[4px]">The nudge before a fixture or a question locks</div>
                </div>
                <span className="tf-kicker p-[4px_7px] rounded-[5px] bg-[var(--success-surface)] text-[var(--success-text)] flex-none">STOPPED</span>
              </div>
              <div className="flex items-start gap-[12px] p-[14px_var(--gutter)] border-y border-[var(--surface-border)] bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]">
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-[13.5px] tracking-[-0.2px]">A league ending · a result corrected</div>
                  <div className="text-[10.5px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">Not reminders. Turn these off in the app, under Me → Notifications</div>
                </div>
                <span className="tf-kicker p-[4px_7px] rounded-[5px] bg-[var(--color-brand)] text-[var(--color-on-brand)] flex-none">STILL SENT</span>
              </div>
              <div className="p-[18px_var(--gutter)] text-[11.5px] leading-[1.65] text-[var(--text-muted)]">
                You are still a member of Premier Predictors. Your answers, your points and your place in the table are untouched — this only stops one kind of email.
              </div>
            </main>

            <footer className="flex-none p-[14px_var(--gutter)_22px] bg-[var(--surface-card)] border-t border-[var(--surface-border)]">
              <Link href="/" className="tf-tap h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] flex items-center justify-center font-heading font-bold text-[13.5px] shadow-[var(--elev-glow)]">Open TopFour</Link>
              <div className="tf-tap h-[42px] flex items-center justify-center font-heading font-semibold text-[12.5px] text-[var(--text-link)] mt-[4px]">Undo — keep sending reminders</div>
            </footer>
          </div>
        )}

        {isLeague && (
          <div className="flex-1 flex flex-col min-h-0 animate-[tfin_0.16s_ease]">
            <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_18px]">
              <div className="flex items-center gap-[11px]">
                <Link href="/" className="w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px] tf-tap">
                  ‹
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-[16px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{cfg.name}</div>
                  <div className="flex items-center gap-[7px] mt-[4px]">
                    <span className="font-heading font-bold text-[9.5px] tracking-[0.13em] uppercase" style={cfg.badgeStyle ? {} : {}}>{cfg.badge}</span>
                    <span className="font-tabular-nums text-[10px] text-[var(--nav-text-faint)]">{cfg.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-[11px] mt-[18px]">
                <div className="font-tabular-nums font-heading font-bold text-[44px] leading-[0.86] tracking-[-2px]" style={{ color: cfg.hero[3] }}>{cfg.hero[0]}</div>
                <div className="pb-[5px] min-w-0">
                  <div className="text-[11.5px] leading-[1.35]">{cfg.hero[1]}</div>
                  <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[3px]">{cfg.hero[2]}</div>
                </div>
              </div>
            </header>

            <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
              {cfg.banner && (
                <div className="p-[20px_var(--gutter)] text-[var(--tf-white)]" style={{ background: cfg.banner[3] }}>
                  <div className="tf-kicker opacity-75">{cfg.banner[0]}</div>
                  <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px] mt-[9px]">{cfg.banner[1]}</div>
                  <div className="text-[12.5px] leading-[1.6] mt-[9px] opacity-90">{cfg.banner[2]}</div>
                </div>
              )}

              {cfg.podium && (
                <section className="mt-[20px]">
                  <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                    <span className="tf-kicker text-[var(--text-muted)]">HOW IT FINISHED</span>
                    <span className="tf-tap font-heading font-bold text-[10px] tracking-[0.06em] text-[var(--text-link)]">FULL TABLE</span>
                  </div>
                  {podium.map((p: any, i: number) => (
                    <div key={i} className={`flex items-center gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${i === podium.length - 1 ? 'border-b border-[var(--surface-border)]' : ''} ${p.self ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}>
                      <span className="font-tabular-nums w-[16px] flex-none font-heading font-bold text-[13px]" style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{p.rank}</span>
                      <span className="w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10.5px] text-[var(--text-primary)]" style={{ background: `var(--ident-${(i % 7) + 1})` }}>{p.initials}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-bold text-[13.5px] tracking-[-0.2px] whitespace-nowrap overflow-hidden text-ellipsis">{p.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-[3px]">{p.note}</div>
                      </div>
                      <span className="font-tabular-nums font-heading font-bold text-[15px] flex-none">{p.points}</span>
                    </div>
                  ))}
                </section>
              )}

              {cfg.voided && (
                <section className="mt-[22px]">
                  <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                    <span className="tf-kicker text-[var(--danger-text)]">VOIDED — SCORES NOTHING</span>
                    <span className="font-tabular-nums text-[10px] text-[var(--text-muted)]">{cfg.voided.length} GROUPS</span>
                  </div>
                  {cfg.voided.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] bg-[var(--danger-surface)] shadow-[inset_3px_0_0_0_var(--color-danger)]">
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-bold text-[13px] tracking-[-0.2px]">{r.title}</div>
                        <div className="text-[10.5px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">{r.note}</div>
                      </div>
                    </div>
                  ))}
                  <div className="p-[11px_var(--gutter)] border-y border-[var(--surface-border)] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">
                    Predictions on a voided market are kept and stay visible. They score nothing, which is not the same as never having answered.
                  </div>
                </section>
              )}

              <section className="mt-[22px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">STILL READABLE</div>
                {cfg.open.map((r: any, i: number) => (
                  <div key={i} className={`tf-tap flex items-center gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${i === cfg.open.length - 1 ? 'border-b border-[var(--surface-border)]' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[13.5px] tracking-[-0.2px]">{r.title}</div>
                      <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[4px]">{r.note}</div>
                    </div>
                    <span className="text-[var(--text-muted)] font-heading font-semibold text-[16px] flex-none">›</span>
                  </div>
                ))}
              </section>

              <section className="mt-[22px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">NO LONGER POSSIBLE</div>
                {cfg.closed.map((r: any, i: number) => (
                  <div key={i} className={`flex items-center gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] opacity-[0.62] ${i === cfg.closed.length - 1 ? 'border-b border-[var(--surface-border)]' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[13px] tracking-[-0.2px] text-[var(--text-secondary)]">{r.title}</div>
                      <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[4px]">{r.note}</div>
                    </div>
                    <span className="text-[var(--text-muted)] text-[12px] flex-none">✕</span>
                  </div>
                ))}
              </section>

              {cfg.archive && (
                <section className="mt-[22px]">
                  <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">OWNER ONLY</div>
                  <div className="tf-tap flex items-start gap-[12px] p-[14px_var(--gutter)] border-y border-[var(--surface-border)] bg-[var(--warn-surface)] shadow-[inset_3px_0_0_0_var(--color-warning)]">
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[13.5px] tracking-[-0.2px] text-[var(--warn-text)]">Archive this league</div>
                      <div className="text-[10.5px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">Hides it from every member's list, not just yours. Nothing is deleted and no points change — but the app cannot bring it back.</div>
                    </div>
                  </div>
                </section>
              )}

              <div className="p-[19px_var(--gutter)_30px] text-[10.5px] leading-[1.65] text-[var(--text-muted)]">{cfg.foot}</div>
            </main>
          </div>
        )}
      </div></div>
  );
}
