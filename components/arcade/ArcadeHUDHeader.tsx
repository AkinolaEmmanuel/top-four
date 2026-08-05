"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Trophy, User, ArrowRight, Activity } from "lucide-react";
import { GamificationStats } from "@/types";
import { Logo } from "@/components/brand/logo";

interface ArcadeHUDHeaderProps {
  stats: GamificationStats;
}

export function ArcadeHUDHeader({ stats }: ArcadeHUDHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Logo & Live Match Pulse */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={28} />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-foreground uppercase flex items-center gap-1.5 font-heading">
                TOPFOUR<span className="text-sky-500">.APP</span>
              </span>
            </div>
          </Link>

          {/* Live Fixtures Ticker Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span>MATCHDAY 2 • LIVE STATS</span>
          </div>
        </div>

        {/* Center: Clean Stats (Points, Predictions, Streak) */}
        <div className="flex items-center gap-3">
          
          {/* Points Total */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary border border-border shadow-sm">
            <Trophy className="h-4 w-4 text-crown" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none font-mono">PTS BALANCE</span>
              <span className="text-xs font-mono font-bold text-foreground">
                {stats.creds * 10 || 1250} PTS
              </span>
            </div>
          </div>

          {/* Predictions Count */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary border border-border shadow-sm">
            <Activity className="h-4 w-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none font-mono">PREDICTIONS</span>
              <span className="text-xs font-mono font-bold text-emerald-500">
                {stats.total_predictions || 24} MADE
              </span>
            </div>
          </div>

          {/* Hot Streak Counter */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary border border-border shadow-sm">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="h-4 w-4 text-amber-500" />
            </motion.div>
            <span className="text-xs font-mono font-bold text-foreground">
              {stats.current_streak || 3} STREAK
            </span>
          </div>
        </div>

        {/* Right: Auth CTAs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all active:scale-95 duration-150"
          >
            <User className="h-3.5 w-3.5" />
            Sign In
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-sky-600 shadow-glow-sky active:scale-95 duration-150"
          >
            GET STARTED
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
