import Link from "next/link";
import { ArrowRight, Trophy, Receipt, Activity, Users, Flame, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalLeaderboardWidget } from "./global-leaderboard-widget";
import { MatchdayScoresHub } from "./matchday-scores-hub";
import { LeagueTablesWidget } from "./league-tables-widget";
import { PlayerStatsWidget } from "./player-stats-widget";
import { DemoButton } from "@/components/auth/demo-button";

export async function HubView({ user }: { user?: any }) {
  const name = user?.displayName || user?.email || "Predictor";

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-10 px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8">
      
      {/* ── Hero Banner & Quick Actions ── */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-10 shadow-elevation-dark-2">
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(14, 165, 233, 0.2)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-mono font-bold text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              EUROPEAN MATCHDAY 2 IS LIVE
            </span>
            <h1 className="text-xl sm:text-5xl font-black tracking-tight text-white uppercase font-heading">
              Welcome to <span className="text-sky-400">TopFour</span>, {name} 👋
            </h1>
            <p className="text-xs sm:text-base text-slate-300 font-sans leading-relaxed">
              Predict match outcomes, generate thermal receipt slips, and compete in private prediction clubs.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link href="/predict">
                <Button variant="glow" size="lg" className="gap-2 font-bold w-full sm:w-auto justify-center">
                  <Activity className="h-4 w-4" />
                  MAKE PREDICTIONS
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <DemoButton variant="sky" className="py-2.5 h-11 px-5 w-full sm:w-auto justify-center" />
              <Link href="/how-to-play">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto justify-center">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  HOW TO PLAY
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat Pill Grid Cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 text-center shadow-sm">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">ACTIVE SLIPS</span>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-black text-white font-mono">3 SLIPS</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 text-center shadow-sm">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">PTS BALANCE</span>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-black text-crown font-mono">1,250 PTS</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 text-center shadow-sm">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">ACCURACY</span>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-black text-emerald-400 font-mono">84% WIN</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 text-center shadow-sm">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">HOT STREAK</span>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-black text-amber-400 font-mono">3🔥</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Layout: Matchday Hub + Standings + Sidebar ── */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start">
        
        {/* Left 8 Cols: Matchday Scores & Official League Standings Tables */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <MatchdayScoresHub />
          <LeagueTablesWidget />
        </div>

        {/* Right 4 Cols: Global Leaderboard, Top Performers & Private Rooms Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <GlobalLeaderboardWidget />
          <PlayerStatsWidget />

          {/* Featured Prediction Rooms Widget */}
          <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-6 space-y-4 shadow-sm dark:shadow-elevation-dark-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-heading">Private Clubs</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">FEATURED ROOMS</p>
                </div>
              </div>

              <Link href="/rooms" className="text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400">
                All Rooms →
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              <div className="rounded-xl border border-border bg-slate-50/80 dark:bg-slate-900/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase font-sans">Premier League Pundits</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/30 font-bold">
                    PUBLIC
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>148 MEMBERS</span>
                  <span className="text-emerald-500 font-bold">ACTIVE MATCHDAY</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-slate-50/80 dark:bg-slate-900/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase font-sans">Champions League Elite</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-crown border border-amber-500/30 font-bold">
                    VIP ROOM
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>92 MEMBERS</span>
                  <span className="text-emerald-500 font-bold">ACTIVE MATCHDAY</span>
                </div>
              </div>
            </div>

            <Link href="/rooms/new" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold justify-center">
                + Create Private Room
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
