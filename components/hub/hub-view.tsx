import Link from "next/link";
import { ArrowRight, Trophy, Receipt, Activity, Users, Flame, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalLeaderboardWidget } from "./global-leaderboard-widget";
import { MatchdayScoresHub } from "./matchday-scores-hub";
import { LeagueTablesWidget } from "./league-tables-widget";
import { DemoButton } from "@/components/auth/demo-button";

export async function HubView({ user }: { user?: any }) {
  const name = user?.displayName || user?.email || "Predictor";

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      
      {/* ── Hero Banner & Quick Actions ── */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-elevation-dark-2">
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(14, 165, 233, 0.2)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-mono font-bold text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              EUROPEAN MATCHDAY 2 IS LIVE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-heading">
              Welcome to <span className="text-sky-400">TopFour</span>, {name} 👋
            </h1>
            <p className="text-base text-slate-300 font-sans">
              Predict match outcomes, generate thermal receipt slips, and compete in private prediction clubs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/predict">
                <Button variant="glow" size="lg" className="gap-2 font-bold">
                  <Activity className="h-4 w-4" />
                  MAKE PREDICTIONS
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <DemoButton variant="sky" className="py-2.5 h-11 px-5" />
              <Link href="/how-to-play">
                <Button variant="outline" size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  HOW TO PLAY
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat Pill Grid Cards */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">ACTIVE SLIPS</span>
              <p className="mt-1 text-2xl font-black text-white font-mono">3 SLIPS</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">PTS BALANCE</span>
              <p className="mt-1 text-2xl font-black text-crown font-mono">1,250 PTS</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">ACCURACY</span>
              <p className="mt-1 text-2xl font-black text-emerald-400 font-mono">84% WIN</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">HOT STREAK</span>
              <p className="mt-1 text-2xl font-black text-amber-400 font-mono">3🔥</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Layout: Matchday Hub + Standings + Sidebar ── */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left 8 Cols: Matchday Scores & Official League Standings Tables */}
        <div className="lg:col-span-8 space-y-8">
          <MatchdayScoresHub />
          <LeagueTablesWidget />
        </div>

        {/* Right 4 Cols: Global Leaderboard & Private Rooms Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <GlobalLeaderboardWidget />

          {/* Featured Prediction Rooms Widget */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-elevation-dark-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">Private Clubs</h3>
                  <p className="text-[11px] text-slate-400 font-mono">FEATURED ROOMS</p>
                </div>
              </div>

              <Link href="/rooms" className="text-xs font-bold text-sky-400 hover:text-sky-300">
                All Rooms →
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase">Premier League Pundits</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    PUBLIC
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>148 MEMBERS</span>
                  <span className="text-emerald-400">ACTIVE MATCHDAY</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase">Champions League Elite</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-crown border border-yellow-500/30">
                    VIP ROOM
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>92 MEMBERS</span>
                  <span className="text-emerald-400">ACTIVE MATCHDAY</span>
                </div>
              </div>
            </div>

            <Link href="/rooms/new" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                + Create Private Room
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
