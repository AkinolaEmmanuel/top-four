"use client";

import Link from "next/link";
import { Crest } from "@/components/ui/crest";
import { ArrowRight, ChevronRight, Clock, Trophy, CheckCircle2, Activity, HelpCircle } from "lucide-react";

import { LandingHome } from "@/components/landing/landing-home";

export function HubView({ user }: { user?: any }) {
  const isLoggedIn = Boolean(user);
  if (!isLoggedIn) {
    return <LandingHome />;
  }

  const displayName = user?.displayName || user?.email || "Predictor";

  // Data modelled directly on Home.dc.html
  const nextLock = {
    league: "Premier Predictors",
    home: "ARS",
    away: "CHE",
    homeName: "Arsenal",
    awayName: "Chelsea",
    clock: "4h 12m",
    clockSub: "until match result locks",
    kickoff: "Today 16:30",
    progress: "3 of 7 answered",
    barPercent: 43,
    cta: "Answer 4 markets →",
  };

  const queue = [
    {
      id: "q-1",
      home: "ARS",
      away: "CHE",
      match: "Arsenal v Chelsea",
      league: "Premier Predictors · GW2",
      time: "4h 12m",
      missing: "4 of 7 missing",
      urgent: true,
    },
    {
      id: "q-2",
      home: "LIV",
      away: "TOT",
      match: "Liverpool v Spurs",
      league: "Premier Predictors · GW2",
      time: "6h 40m",
      missing: "2 of 7 missing",
      urgent: false,
    },
    {
      id: "q-3",
      home: "MCI",
      away: "EVE",
      match: "Man City v Everton",
      league: "Office League · GW2",
      time: "8h 05m",
      missing: "6 of 6 missing",
      urgent: false,
    },
    {
      id: "q-007",
      home: "CHE",
      away: "MUN",
      match: "First to 007 Agent Status 🕵️‍♂️",
      league: "Premier Predictors · Custom Prop",
      time: "Locks Friday",
      missing: "Pick Antony, Mudryk or Núñez",
      urgent: true,
    },
    {
      id: "q-strikers",
      home: "ARS",
      away: "CHE",
      match: "Top Striker Goal Race ⚽",
      league: "Premier Predictors · Head to Head",
      time: "Locks Sept 1st",
      missing: "Gyökeres vs João Pedro vs Šeško vs Thiago",
      urgent: true,
    },
  ];

  const weekendPayoff = {
    kicker: "THIS WEEKEND",
    badge: "GW 2 SETTLED",
    points: "38",
    sub: "points earned across 3 leagues",
    breakdown: [
      { mark: "✓", label: "Arsenal 2-1 Chelsea (Exact Score)", pts: "+5", correct: true },
      { mark: "✓", label: "Liverpool vs Spurs (Match Result)", pts: "+2", correct: true },
      { mark: "✓", label: "Man City (Over 2.5 Goals)", pts: "+1", correct: true },
      { mark: "✓", label: "Haaland Anytime Goalscorer", pts: "+5", correct: true },
    ],
  };

  const leagues = [
    {
      id: "l-1",
      name: "Premier Predictors",
      crest: "PP",
      crestBg: "var(--brand-fill)",
      meta: "128 members · Gameweek 2",
      position: "#4",
      points: "1,080 pts",
    },
    {
      id: "l-2",
      name: "Office League 2026",
      crest: "OL",
      crestBg: "var(--tf-blue-700)",
      meta: "18 members · Gameweek 2",
      position: "#2",
      points: "840 pts",
    },
    {
      id: "l-3",
      name: "Champions League Elite",
      crest: "CL",
      crestBg: "var(--tf-navy-800)",
      meta: "42 members · Round 1",
      position: "#6",
      points: "520 pts",
    },
  ];

  return (
    <div className="space-y-6 px-2 md:px-5 pb-24 md:pb-8 w-full min-w-0 font-sans">
      {/* ── DESKTOP DUAL-COLUMN GRID (Desktop - Home.dc.html) ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero & Match Queue */}
        <div className="lg:col-span-7 space-y-6">
          {/* ── HERO: The Next Lock Anywhere ── */}
          <section
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
            style={{
              background: "linear-gradient(180deg, var(--pitch-bg-top) 0%, var(--pitch-bg-bottom) 100%)",
              color: "var(--tf-white)",
              boxShadow: "var(--elev-3)",
            }}
          >
            {/* Stadium center pitch circle overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 65%)",
              }}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 top-1/2 h-px"
              style={{ background: "var(--pitch-line)" }}
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full"
              style={{ border: "1px solid var(--pitch-line)" }}
            />

            <div className="relative z-10">
              {/* Kicker + League Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ background: "var(--tf-red-400)" }}
                  />
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase font-heading"
                    style={{ color: "var(--tf-red-300)" }}
                  >
                    NEXT LOCK
                  </span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-heading"
                  style={{ background: "rgba(255,255,255,0.12)", color: "var(--tf-white)" }}
                >
                  {nextLock.league}
                </span>
              </div>

              {/* Large Countdown Clock */}
              <div className="flex items-baseline gap-2.5 mt-2">
                <span
                  className="text-4xl sm:text-5xl font-black tracking-tight font-heading tabular-nums"
                  style={{ color: "var(--tf-white)" }}
                >
                  {nextLock.clock}
                </span>
                <span
                  className="text-xs font-sans"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {nextLock.clockSub}
                </span>
              </div>

              {/* Teams Row */}
              <div className="flex items-center justify-between gap-3 mt-5 py-3 border-y border-white/10">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Crest code={nextLock.home} size="lg" />
                  <span className="font-bold text-sm sm:text-base font-heading truncate">
                    {nextLock.homeName}
                  </span>
                </div>

                <span className="text-[11px] font-bold font-heading uppercase px-2 py-0.5 rounded bg-black/20 text-white/80 shrink-0">
                  {nextLock.kickoff}
                </span>

                <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                  <span className="font-bold text-sm sm:text-base font-heading truncate text-right">
                    {nextLock.awayName}
                  </span>
                  <Crest code={nextLock.away} size="lg" />
                </div>
              </div>

              {/* Answer Progress Bar */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${nextLock.barPercent}%`,
                      background: "var(--color-brand)",
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold font-heading tabular-nums shrink-0 text-white/90">
                  {nextLock.progress}
                </span>
              </div>

              {/* CTA Button */}
              <Link
                href="/predict"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-bold font-heading transition-transform active:scale-[0.98]"
                style={{
                  background: "var(--brand-fill)",
                  color: "var(--color-on-brand)",
                  boxShadow: "var(--elev-2)",
                }}
              >
                {nextLock.cta}
              </Link>
            </div>
          </section>

          {/* ── THE QUEUE: Next Deadlines in Order ── */}
          <section className="space-y-2.5">
            <div className="flex items-baseline justify-between px-1">
              <span
                className="text-[10px] font-bold tracking-wider uppercase font-heading"
                style={{ color: "var(--text-muted)" }}
              >
                NEXT DEADLINES
              </span>
              <Link
                href="/predict"
                className="text-[11px] font-bold font-heading hover:underline"
                style={{ color: "var(--text-link)" }}
              >
                OPEN FULL QUEUE →
              </Link>
            </div>

            <div
              className="rounded-2xl overflow-hidden divide-y divide-[var(--surface-border)]"
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--surface-border)",
                boxShadow: "var(--elev-1)",
              }}
            >
              {queue.map((q) => (
                <Link
                  key={q.id}
                  href="/predict"
                  className="flex items-center gap-3.5 p-3.5 sm:p-4 hover:bg-[var(--surface-subtle)] transition-colors active:scale-[0.99]"
                  style={{
                    background: q.urgent ? "var(--accent-surface)" : undefined,
                    boxShadow: q.urgent ? "inset 3px 0 0 0 var(--color-brand)" : undefined,
                  }}
                >
                  {/* Stacked Crests */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Crest code={q.home} size="xs" />
                    <Crest code={q.away} size="xs" />
                  </div>

                  {/* Title & League */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-bold text-sm font-heading truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {q.match}
                    </div>
                    <div
                      className="text-[11px] font-sans truncate mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {q.league}
                    </div>
                  </div>

                  {/* Deadline & Missing Answers */}
                  <div className="text-right shrink-0">
                    <div
                      className="text-xs sm:text-sm font-bold font-heading tabular-nums"
                      style={{
                        color: q.urgent ? "var(--danger-text)" : "var(--text-primary)",
                      }}
                    >
                      {q.time}
                    </div>
                    <div
                      className="text-[10px] font-sans mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {q.missing}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Weekend Payoff Card & Your Leagues Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* ── THE PAYOFF: Weekend Points Breakdown ── */}
          <section
            className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--tf-navy-950) 0%, var(--tf-navy-800) 100%)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--elev-2)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 font-heading">
                {weekendPayoff.kicker}
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-heading bg-white text-slate-950">
                {weekendPayoff.badge}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black font-heading tabular-nums">
                {weekendPayoff.points}
              </span>
              <span className="text-xs text-white/70">
                {weekendPayoff.sub}
              </span>
            </div>

            <div className="mt-4 space-y-2 pt-3 border-t border-white/10 text-xs">
              {weekendPayoff.breakdown.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-white/90">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold">{row.mark}</span>
                    <span className="truncate">{row.label}</span>
                  </div>
                  <span className="font-bold font-heading tabular-nums text-emerald-400 shrink-0">
                    {row.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── YOUR LEAGUES: Summary Strip ── */}
          <section className="space-y-2.5">
        <div className="flex items-baseline justify-between px-1">
          <span
            className="text-[10px] font-bold tracking-wider uppercase font-heading"
            style={{ color: "var(--text-muted)" }}
          >
            YOUR LEAGUES
          </span>
          <Link
            href="/rooms"
            className="text-[11px] font-bold font-heading hover:underline"
            style={{ color: "var(--text-link)" }}
          >
            SEE ALL {leagues.length} →
          </Link>
        </div>

        <div
          className="rounded-2xl overflow-hidden divide-y divide-[var(--surface-border)]"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          {leagues.map((l) => (
            <Link
              key={l.id}
              href="/rooms"
              className="flex items-center gap-3.5 p-3.5 sm:p-4 hover:bg-[var(--surface-subtle)] transition-colors active:scale-[0.99]"
            >
              <div
                className="w-[30px] h-[33px] flex items-center justify-center font-bold text-xs font-heading shrink-0"
                style={{
                  clipPath: "var(--crest-clip)",
                  background: l.crestBg,
                  color: "var(--tf-white)",
                }}
              >
                {l.crest}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-sm font-heading truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {l.name}
                </div>
                <div
                  className="text-[11px] font-sans truncate mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {l.meta}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className="text-sm font-bold font-heading tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {l.position}
                </div>
                <div
                  className="text-[10px] font-sans mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {l.points}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  </div>

  {/* ── FEATURE PROMO BANNERS ── */}
  <section className="pt-4 border-t border-[var(--surface-border)] space-y-4">
    <div className="flex items-center justify-between px-1">
      <div>
        <span className="text-[10px] font-bold tracking-wider uppercase font-heading text-sky-400 block">
          GAME MODES & PROPS
        </span>
        <h2 className="text-lg sm:text-xl font-bold font-heading" style={{ color: "var(--text-primary)" }}>
          Predict Standings, Lineups & Custom Props
        </h2>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      {/* Standings Banner */}
      <Link
        href="/table"
        className="relative overflow-hidden rounded-2xl p-5 text-white space-y-3 flex flex-col justify-between transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "var(--elev-2)",
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-heading">
              SEASON PROPS
            </span>
            <Trophy className="h-4 w-4 text-indigo-300" />
          </div>
          <h3 className="text-base font-black font-heading text-white">
            League Standings & Top 4
          </h3>
          <p className="text-xs text-indigo-100 font-sans leading-relaxed">
            Rank 1st through 20th and lock in your Top 4 prediction before kickoff.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold font-heading text-indigo-200">
          <span>Predict Standings</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>

      {/* XI Lineup Banner */}
      <Link
        href="/rooms"
        className="relative overflow-hidden rounded-2xl p-5 text-white space-y-3 flex flex-col justify-between transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "var(--elev-2)",
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-heading">
              11 PLAYERS
            </span>
            <Activity className="h-4 w-4 text-emerald-300" />
          </div>
          <h3 className="text-base font-black font-heading text-white">
            Starting XI Lineup Picker
          </h3>
          <p className="text-xs text-emerald-100 font-sans leading-relaxed">
            Grass pitch 4-3-3, 4-4-2 or 3-5-2. Score +22 PTS maximum per match.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold font-heading text-emerald-200">
          <span>Pick XI Lineup</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>

      {/* Custom Questions Banner */}
      <Link
        href="/predict"
        className="relative overflow-hidden rounded-2xl p-5 text-white space-y-3 flex flex-col justify-between transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, #701a75 0%, #a21caf 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "var(--elev-2)",
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/30 font-heading">
              SPECIAL PROPS
            </span>
            <HelpCircle className="h-4 w-4 text-fuchsia-300" />
          </div>
          <h3 className="text-base font-black font-heading text-white">
            Custom League Questions
          </h3>
          <p className="text-xs text-fuchsia-100 font-sans leading-relaxed">
            Answer 007 agent props & Striker battles (Gyökeres, João Pedro, Šeško, Thiago).
          </p>
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold font-heading text-fuchsia-200">
          <span>Answer Props</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>
    </div>
  </section>
</div>
  );
}
