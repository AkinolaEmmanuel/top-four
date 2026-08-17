import Link from "next/link";
import { Activity, Trophy, Users, Zap, CheckCircle2, ArrowRight, ShieldCheck, Flame, HelpCircle, Star, Lock } from "lucide-react";
import { DemoButton } from "@/components/auth/demo-button";

export const metadata = {
  title: "How to Play · topfour.app",
  description: "Official rulebook and guide to private prediction leagues, 40-point match caps, Lonely Wolf bonuses, and XI lineup picks.",
};

const SCORING_BREAKDOWN = [
  { market: "Match Result (1X2)", maxPts: "3 PTS", desc: "Pick Home Win, Draw, or Away Win correctly." },
  { market: "Exact Scoreline", maxPts: "5 PTS", desc: "Predict the exact final scoreline (e.g., 2 - 1)." },
  { market: "Both Teams to Score (BTTS)", maxPts: "2 PTS", desc: "Correctly predict if both teams score." },
  { market: "Total Goals Line", maxPts: "2 PTS", desc: "Predict Over or Under 2.5 total match goals." },
  { market: "Lonely Wolf Bonus", maxPts: "+5 PTS", desc: "Bonus awarded if you are the ONLY manager in your room to hit the exact score." },
  { market: "XI Lineup Pick (Starters)", maxPts: "22 PTS", desc: "1 pt per correct starter across both team elevens (11 Home + 11 Away)." },
];

const STEPS = [
  {
    num: "01",
    title: "Create or Join a Room",
    subtitle: "Up to 20 leagues per manager",
    desc: "Set up a private room in 4 guided steps with custom competition feeds, or join an existing league with a 6-character WhatsApp invite code.",
    badge: "INSTANT ACCESS",
    color: "var(--color-brand)",
  },
  {
    num: "02",
    title: "Predict Scorelines & Markets",
    subtitle: "Locks at kickoff",
    desc: "Predict 1X2 result, exact scoreline, Both Teams to Score, and Total Goals. Picks auto-save instantly and lock at official kickoff.",
    badge: "AUTO-SAVE ENGINES",
    color: "var(--state-live)",
  },
  {
    num: "03",
    title: "Pick XI Starters & Honors",
    subtitle: "Lineups carry over half the points",
    desc: "Select 11 starting players on an interactive grass pitch (4-3-3, 4-4-2, 3-5-2) and lock in your Golden Boot & Golden Ball tournament awards.",
    badge: "22 PTS AT STAKE",
    color: "var(--role-owner)",
  },
  {
    num: "04",
    title: "Track Standings & Bragging Rights",
    subtitle: "Live table settlement",
    desc: "Watch real-time standings update after every final whistle with rivalry trackers ('24 pts to catch Kolade') and gameweek payoff cards.",
    badge: "LIVE PAYOFFS",
    color: "var(--color-success)",
  },
];

export default function HowToPlayPage() {
  return (
    <div className="mx-auto w-full max-w-mobile md:max-w-content px-6 sm:px-8 md:px-10 py-5 sm:py-8 space-y-10 sm:space-y-14 pb-20 min-w-0 font-sans">
      
      {/* ── HERO BANNER (Stadium Pitch Aesthetic) ── */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white space-y-6"
        style={{
          background: "linear-gradient(180deg, var(--pitch-bg-top) 0%, var(--pitch-bg-bottom) 100%)",
          boxShadow: "var(--elev-3)",
          border: "1px solid var(--surface-border)",
        }}
      >
        {/* Pitch backdrop lines */}
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold font-heading text-sky-300">
            <Zap className="h-3.5 w-3.5 text-sky-400" />
            <span>OFFICIAL RULEBOOK & GAMEPLAY GUIDE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.1]">
            How to Play <span className="text-sky-400">TopFour</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Master scoreline predictions, private prediction clubs, Lonely Wolf bonuses, and XI lineup picks across the Premier League, Champions League, and more.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm font-heading flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
              style={{
                background: "var(--brand-fill)",
                color: "var(--color-on-brand)",
              }}
            >
              Create a League Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <DemoButton variant="sky" className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm font-heading" />
          </div>
        </div>
      </section>

      {/* ── THE 40-POINT MATCH CAP HERO (League Rules.dc.html spec) ── */}
      <section
        className="rounded-3xl p-6 sm:p-8 border space-y-4"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--surface-border)",
          boxShadow: "var(--elev-2)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--surface-border)] pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)] block">
              SINGLE MATCH MAXIMUM
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-[var(--color-brand)] tabular-nums">
                40
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base font-heading" style={{ color: "var(--text-primary)" }}>
                  points from one match, at most
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-sans">
                  22 of them come from the two team lineups (1 pt per correct starter)
                </p>
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[var(--accent-surface)] border border-[var(--accent-border)] text-xs font-bold font-heading text-[var(--color-brand)] self-start sm:self-center">
            Lineups carry over half the points
          </div>
        </div>

        {/* Scoring Breakdown Table */}
        <div className="divide-y divide-[var(--surface-border)]">
          {SCORING_BREAKDOWN.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold font-heading text-sm" style={{ color: "var(--text-primary)" }}>
                  {item.market}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-sans">{item.desc}</div>
              </div>
              <span
                className="px-3 py-1 rounded-xl text-xs font-black font-heading tabular-nums shrink-0"
                style={{
                  background: item.maxPts.includes("+") ? "var(--warn-surface)" : "var(--surface-subtle)",
                  color: item.maxPts.includes("+") ? "var(--role-owner)" : "var(--text-primary)",
                  border: item.maxPts.includes("+") ? "1px solid var(--warn-border)" : "1px solid var(--surface-border)",
                }}
              >
                {item.maxPts}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4-STEP GAMEPLAY GUIDE CARDS ── */}
      <section className="space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1">
          <span className="text-[10px] font-bold tracking-wider uppercase font-heading text-[var(--text-muted)] block">
            GAMEPLAY WALKTHROUGH
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading" style={{ color: "var(--text-primary)" }}>
            Four Steps to Victory
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 border space-y-4 flex flex-col justify-between"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--surface-border)",
                boxShadow: "var(--elev-1)",
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-heading text-sm"
                    style={{
                      background: "var(--surface-subtle)",
                      color: s.color,
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    {s.num}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-heading bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--surface-border)]">
                    {s.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg font-heading" style={{ color: "var(--text-primary)" }}>
                    {s.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[var(--color-brand)] font-heading block">
                    {s.subtitle}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed pt-1">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUTOFF & LONELY WOLF RULES ── */}
      <section
        className="rounded-3xl p-6 sm:p-8 border space-y-4"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex items-center gap-3 border-b border-[var(--surface-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base font-heading" style={{ color: "var(--text-primary)" }}>
              Lock Cutoffs & House Rules
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Important rules to keep in mind when making predictions</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--surface-border)] space-y-1.5">
            <div className="font-bold font-heading text-sm" style={{ color: "var(--text-primary)" }}>
              Strict Kickoff Cutoff
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] font-sans leading-relaxed">
              Every match prediction locks automatically at official kickoff time. Once locked, picks cannot be edited under any circumstances.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--surface-border)] space-y-1.5">
            <div className="font-bold font-heading text-sm text-amber-500">
              Lonely Wolf Bonus (+5 PTS)
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] font-sans leading-relaxed">
              If enabled by your league admin, any manager who is the SINGLE person in the room to hit an exact scoreline gets +5 bonus points!
            </p>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION FOOTER ── */}
      <section
        className="rounded-3xl p-8 sm:p-10 text-center space-y-4"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-3)",
        }}
      >
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-2xl font-bold font-heading" style={{ color: "var(--text-primary)" }}>
            Ready to Start Predicting?
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Create your room, invite your squad, and start earning points today.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl font-bold text-xs font-heading flex items-center gap-2 transition-transform active:scale-95"
            style={{
              background: "var(--brand-fill)",
              color: "var(--color-on-brand)",
            }}
          >
            Create Account Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <DemoButton variant="sky" className="px-6 py-3 rounded-xl font-bold text-xs font-heading" />
        </div>
      </section>
    </div>
  );
}
