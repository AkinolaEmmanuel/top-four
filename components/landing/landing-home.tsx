"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Shield, Activity, Users, CheckCircle2, Zap, HelpCircle, ChevronRight, Star } from "lucide-react";
import { Crest } from "@/components/ui/crest";
import { DemoButton } from "@/components/auth/demo-button";

const COMPETITIONS = [
  {
    name: "Premier League",
    country: "England",
    code: "PL",
    color: "var(--brand-fill)",
    teams: ["ARS", "CHE", "LIV", "MCI", "MUN", "TOT"],
    desc: "38 Gameweeks of 1X2, exact score, BTTS & Over/Under goals.",
  },
  {
    name: "UEFA Champions League",
    country: "Europe",
    code: "UCL",
    color: "var(--tf-navy-800)",
    teams: ["RMA", "FCB", "MIL", "BAY", "PSG", "MCI"],
    desc: "Knockout drama & group stage predictions across Europe's elite.",
  },
  {
    name: "La Liga",
    country: "Spain",
    code: "ESP",
    color: "var(--color-danger)",
    teams: ["RMA", "FCB", "ATM", "SEV"],
    desc: "El Clásico and weekly Spanish top-flight match predictions.",
  },
  {
    name: "Serie A",
    country: "Italy",
    code: "ITA",
    color: "var(--tf-blue-700)",
    teams: ["MIL", "INT", "JUV", "NAP"],
    desc: "Tactical battles, Derby della Madonnina, and scudetto races.",
  },
  {
    name: "Bundesliga",
    country: "Germany",
    code: "GER",
    color: "#d10214",
    teams: ["BAY", "BVB", "LEV"],
    desc: "High-scoring German encounters with rapid point payoff.",
  },
  {
    name: "Ligue I",
    country: "France",
    code: "FRA",
    color: "var(--tf-navy-800)",
    teams: ["PSG", "LYO", "ASM", "MAR"],
    desc: "Weekly French top-flight predictions.",
  }
];

const MARKET_RULES = [
  { market: "Match Result (1X2)", pts: "3 PTS", desc: "Pick Home Win, Draw, or Away Win" },
  { market: "Exact Scoreline", pts: "5 PTS", desc: "Predict exact final score (e.g. 2 - 1)" },
  { market: "Both Teams to Score", pts: "2 PTS", desc: "Will both teams score at least once?" },
  { market: "Total Goals Line", pts: "2 PTS", desc: "Over or Under 2.5 total match goals" },
  { market: "Lonely Wolf Bonus", pts: "+5 PTS", desc: "Bonus if you are the ONLY one in your room to hit exact score" },
];

export function LandingHome() {
  return (
    <div className="mx-auto w-full max-w-mobile md:max-w-content px-6 sm:px-8 md:px-10 py-8 space-y-8 sm:space-y-12 pb-20 min-w-0 font-sans">
      {/* ── HERO SECTION (Home.dc.html pitch aesthetic) ── */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white"
        style={{
          background: "linear-gradient(180deg, var(--pitch-bg-top) 0%, var(--pitch-bg-bottom) 100%)",
          boxShadow: "var(--elev-3)",
          border: "1px solid var(--surface-border)",
        }}
      >
        {/* Pitch markings backdrop */}
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white rounded-full" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold font-heading text-sky-300">
            <span>TOPFOUR PREDICTION CLUBS</span>
          </div> */}

          <div className="space-y-3">
            <h1 className="text-5xl sm:text-5xl font-bold font-heading tracking-tight">
              Predictions are better <br />
              <span className="text-sky-400">with people.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Create a league for your group, or join one with an invite code. Predict match outcomes, exact scorelines, and custom props — and let the standings settle every argument.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm font-heading flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
              style={{
                background: "var(--brand-fill)",
                color: "var(--color-on-brand)",
              }}
            >
              Create a League
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/rooms/join"
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm font-heading border border-white/30 bg-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-sm"
            >
              Join with Code
            </Link>

            {/* <DemoButton variant="sky" className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm font-heading" /> */}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-white/10 font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Up to 20 leagues per manager</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Instant scoreline autosave</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Free to play</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPETITIONS YOU CAN PREDICT IN ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
          <div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase font-heading block"
              style={{ color: "var(--text-muted)" }}
            >
              SUPPORTED LEAGUES & TOURNAMENTS
            </span>
            <h2
              className="text-xl sm:text-2xl font-bold font-heading mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              Competitions You Can Predict In
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-sans">
            Real-time score feeds updated after every final whistle
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPETITIONS.map((comp, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-5 space-y-3 border transition-all duration-200 hover:shadow-elev-2"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--surface-border)",
                boxShadow: "var(--elev-1)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Crest code={comp.code} color={comp.color} size="md" />
                  <div>
                    <h3 className="font-bold text-sm font-heading" style={{ color: "var(--text-primary)" }}>
                      {comp.name}
                    </h3>
                    <span className="text-[10.5px] text-[var(--text-muted)] font-sans">{comp.country}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-heading bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                {comp.desc}
              </p>

              <div className="pt-2 border-t border-[var(--surface-border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {comp.teams.slice(0, 4).map((t) => (
                    <Crest key={t} code={t} size="sm" />
                  ))}
                  <span className="text-[10px] font-bold text-[var(--text-muted)] ml-1">+ more</span>
                </div>
                <Link
                  href="/login?redirect=/predict"
                  className="font-bold text-xs font-heading flex items-center gap-1 hover:underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  Predict
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE BANNERS: Standings, Lineups & Custom Props ── */}
      <section className="space-y-4">
        <div className="px-1">
          <span
            className="text-[10px] font-bold tracking-wider uppercase font-heading block"
            style={{ color: "var(--text-muted)" }}
          >
            MODES OF PLAY
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold font-heading mt-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            Predict More Than Just Scorelines
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Banner 1: Standings */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white space-y-4 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "var(--elev-2)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-heading">
                  SEASON PROPS
                </span>
                <Trophy className="h-5 w-5 text-indigo-300" />
              </div>
              <h3 className="text-lg font-black font-heading leading-tight text-white">
                League Standings & Top 4
              </h3>
              <p className="text-xs text-indigo-100 font-sans leading-relaxed">
                Rank teams 1st through 20th and lock in your Top 4 prediction before kickoff to earn massive end-of-season bonuses.
              </p>
            </div>
            <Link
              href="/login?redirect=/table"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-indigo-200 hover:text-white pt-2 group"
            >
              <span>Predict Standings</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Banner 2: Lineup Picker */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white space-y-4 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "var(--elev-2)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-heading">
                  11 PLAYERS
                </span>
                <Activity className="h-5 w-5 text-emerald-300" />
              </div>
              <h3 className="text-lg font-black font-heading leading-tight text-white">
                Starting XI Lineup Picker
              </h3>
              <p className="text-xs text-emerald-100 font-sans leading-relaxed">
                Tactical 4-3-3, 4-4-2, or 3-5-2 grass pitch formation. Pick 11 starting players and score +22 PTS maximum per match.
              </p>
            </div>
            <Link
              href="/login?redirect=/rooms"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-emerald-200 hover:text-white pt-2 group"
            >
              <span>Pick XI Lineup</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Banner 3: Custom Prop Questions */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white space-y-4 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, #701a75 0%, #a21caf 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "var(--elev-2)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/30 font-heading">
                  SPECIAL PROPS
                </span>
                <HelpCircle className="h-5 w-5 text-fuchsia-300" />
              </div>
              <h3 className="text-lg font-black font-heading leading-tight text-white">
                Custom League Questions
              </h3>
              <p className="text-xs text-fuchsia-100 font-sans leading-relaxed">
                Answer custom head-to-head battles, manager sack races, and 007 agent questions created by your league admin.
              </p>
            </div>
            <Link
              href="/login?redirect=/predict"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-fuchsia-200 hover:text-white pt-2 group"
            >
              <span>Explore Custom Props</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SAMPLE CUSTOM QUESTIONS PREVIEW ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
          <div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase font-heading block text-amber-500"
            >
              SAMPLE LEAGUE PROPS
            </span>
            <h2
              className="text-xl sm:text-2xl font-bold font-heading mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              Popular Custom Questions
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-sans">
            Created by league admins to settle side bets
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Question 1: 007 Agent */}
          <div
            className="rounded-2xl p-5 space-y-3.5 border"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--surface-border)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[9.5px] font-bold font-heading uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                SPECIAL PROP
              </span>
              <span className="text-xs font-bold font-heading text-emerald-500">+4 PTS</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm font-heading" style={{ color: "var(--text-primary)" }}>
                First to "007 Agent" Status 🕵️‍♂️
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Which player will be the first to reach 0 goals and 0 assists in 7 appearances this season?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {["Antony", "Mudryk", "Darwin Núñez", "Jack Grealish"].map((opt, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl text-xs font-bold font-heading text-center bg-[var(--surface-subtle)] border border-[var(--surface-border)] hover:border-[var(--color-brand)] transition-colors cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>

          {/* Question 2: Striker Battle */}
          <div
            className="rounded-2xl p-5 space-y-3.5 border"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--surface-border)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[9.5px] font-bold font-heading uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                STRIKER RACE
              </span>
              <span className="text-xs font-bold font-heading text-emerald-500">+5 PTS</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm font-heading" style={{ color: "var(--text-primary)" }}>
                Highest Goal Scorer Battle ⚽
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Who scores the highest number of goals between Gyökeres, João Pedro, Šeško & Igor Thiago?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {["Viktor Gyökeres", "João Pedro", "Benjamin Šeško", "Igor Thiago"].map((opt, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl text-xs font-bold font-heading text-center bg-[var(--surface-subtle)] border border-[var(--surface-border)] hover:border-[var(--color-brand)] transition-colors cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: Manager Sacked */}
          <div
            className="rounded-2xl p-5 space-y-3.5 border sm:col-span-2 lg:col-span-1"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--surface-border)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[9.5px] font-bold font-heading uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                MANAGER SACK
              </span>
              <span className="text-xs font-bold font-heading text-emerald-500">+4 PTS</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm font-heading" style={{ color: "var(--text-primary)" }}>
                First Manager Sacked 👔
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Which Premier League manager will be the first to leave or be relieved of duties this season?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {["Erik ten Hag", "Sean Dyche", "Russell Martin", "Steve Cooper"].map((opt, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl text-xs font-bold font-heading text-center bg-[var(--surface-subtle)] border border-[var(--surface-border)] hover:border-[var(--color-brand)] transition-colors cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW SCORING & MARKETS WORK ── */}
      <section className="space-y-4">
        <div className="px-1">
          <span
            className="text-[10px] font-bold tracking-wider uppercase font-heading block"
            style={{ color: "var(--text-muted)" }}
          >
            SCORING RULES & MARKET MATRIX
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold font-heading mt-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            How Points Are Earned
          </h2>
        </div>

        <div
          className="rounded-2xl divide-y divide-[var(--surface-border)] overflow-hidden border"
          style={{
            background: "var(--surface-card)",
            borderColor: "var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          {MARKET_RULES.map((rule, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold font-heading text-sm" style={{ color: "var(--text-primary)" }}>
                  {rule.market}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-sans">{rule.desc}</div>
              </div>
              <span
                className="px-3 py-1 rounded-xl text-xs font-black font-heading tabular-nums shrink-0"
                style={{
                  background: rule.pts.includes("+") ? "var(--warn-surface)" : "var(--accent-surface)",
                  color: rule.pts.includes("+") ? "var(--role-owner)" : "var(--color-brand)",
                  border: rule.pts.includes("+") ? "1px solid var(--warn-border)" : "1px solid var(--accent-border)",
                }}
              >
                {rule.pts}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAMPLE MATCH PREVIEW (Home.dc.html Match Card Spec) ── 
      <section
        className="rounded-3xl p-6 sm:p-8 border space-y-4"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--surface-border)",
          boxShadow: "var(--elev-2)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <Crest code="ARS" color="#c8182f" size="md" />
            <span className="font-bold text-xs font-heading">vs</span>
            <Crest code="CHE" color="#1746a2" size="md" />
            <div>
              <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)] block">
                PREMIER PREDICTORS · GW2
              </span>
              <h3 className="font-bold text-sm sm:text-base font-heading" style={{ color: "var(--text-primary)" }}>
                Arsenal v Chelsea
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold font-heading bg-sky-500/10 text-sky-400 border border-sky-500/20 self-start sm:self-center">
            Locks in 4h 12m
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center py-2">
          <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)] space-y-1">
            <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] font-heading">1X2 RESULT</div>
            <div className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
              Arsenal Win
            </div>
            <span className="text-[10px] text-emerald-500 font-bold font-heading">+3 PTS</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)] space-y-1">
            <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] font-heading">EXACT SCORE</div>
            <div className="font-mono font-bold text-xs" style={{ color: "var(--text-primary)" }}>
              2 - 1
            </div>
            <span className="text-[10px] text-emerald-500 font-bold font-heading">+5 PTS</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)] space-y-1">
            <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] font-heading">BTTS</div>
            <div className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
              Yes
            </div>
            <span className="text-[10px] text-emerald-500 font-bold font-heading">+2 PTS</span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/login?redirect=/predict"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs font-heading transition-transform active:scale-95"
            style={{
              background: "var(--brand-fill)",
              color: "var(--color-on-brand)",
            }}
          >
            Sign In to Predict Matches
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
        */}
      {/* ── CALL TO ACTION FOOTER ── 
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
            Ready to Start Your League?
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Create your private room, share your 6-character code, and start predicting with your squad.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/rooms/new"
            className="px-6 py-3 rounded-xl font-bold text-xs font-heading flex items-center gap-2 transition-transform active:scale-95"
            style={{
              background: "var(--brand-fill)",
              color: "var(--color-on-brand)",
            }}
          >
            Create a League
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/rooms/join"
            className="px-5 py-3 rounded-xl font-bold text-xs font-heading border border-[var(--surface-border-strong)] bg-[var(--surface-subtle)] text-[var(--text-primary)]"
          >
            Join with Code
          </Link>

          <DemoButton variant="sky" className="px-5 py-3 rounded-xl font-bold text-xs font-heading" />
        </div>
      </section>
      */}
    </div>
  );
}
