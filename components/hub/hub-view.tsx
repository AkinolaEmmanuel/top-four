"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity, BookOpen, Flame, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTicker } from "./stat-ticker";
import { QuickPickPanel } from "./quick-pick-panel";
import { ContextTabsWidget } from "./context-tabs-widget";
import { MatchdayScoresHub } from "./matchday-scores-hub";

export function HubView({ user }: { user?: any }) {
  const isLoggedIn = Boolean(user);
  const name = user?.displayName || user?.email || "Predictor";

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-10 px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8 w-full max-w-full min-w-0 overflow-hidden">

      {/* ── ZONE 1: Hero Section ── */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-elevation-dark-2 w-full max-w-full min-w-0">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-amber-500/5" />

        <div className="relative z-10 flex flex-col gap-6 w-full max-w-full min-w-0">
          <div className="space-y-4 max-w-3xl min-w-0 flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-heading"
            >
              {isLoggedIn ? (
                <>Welcome back, <span className="text-sky-400">{name}</span> 👋</>
              ) : (
                <>Predict outcomes. <br/><span className="text-sky-400">Prove your ball knowledge.</span></>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-2xl"
            >
              {isLoggedIn
                ? "You have 3 matches left to predict for today's fixtures."
                : "Join thousands of fans making predictions, building receipt slips, and climbing the global leaderboard."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="pt-2"
            >
              <Link href={isLoggedIn ? "/predict" : "/signup"}>
                <Button variant="sky" size="lg" className="gap-2 font-bold transition-transform active:scale-95 shadow-glow-sky">
                  {isLoggedIn ? "Predict now" : "Get started free"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <StatTicker />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ZONE 2 & 3: Main Layout ── */}
      <div className="grid gap-8 lg:grid-cols-12 items-start w-full max-w-full min-w-0 overflow-hidden">
        
        {/* Left 8 Cols: Zone 2 (Matchday Scores Hub) */}
        <div className="lg:col-span-8 space-y-8 w-full max-w-full min-w-0 overflow-hidden">
          <MatchdayScoresHub />
          
          {/* Zone 3 (Context Tabs) - Shown below scores on desktop */}
          <div className="hidden lg:block pt-4 border-t border-border">
            <ContextTabsWidget isLoggedIn={isLoggedIn} />
          </div>
        </div>

        {/* Right 4 Cols: Zone 2 (Quick Pick) */}
        <div className="lg:col-span-4 space-y-8 w-full max-w-full min-w-0 overflow-hidden">
          <QuickPickPanel />

          {/* Zone 3 (Context Tabs) - Shown below quick pick on mobile */}
          <div className="lg:hidden pt-4 border-t border-border">
            <ContextTabsWidget isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
}
