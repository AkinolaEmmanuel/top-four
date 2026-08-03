"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Volume2, VolumeX, Trophy, ShieldCheck, ArrowRight, User } from "lucide-react";
import { GamificationStats } from "@/types";
import { getLevelProgress, getXpForNextLevel } from "@/lib/gamification/gamification-engine";
import { PITCH_GREEN, PITCH_GREEN_GLOW } from "@/lib/brand/colors";

interface ArcadeHUDHeaderProps {
  stats: GamificationStats;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenShop?: () => void;
  onOpenMissions?: () => void;
}

export function ArcadeHUDHeader({
  stats,
  soundEnabled = true,
  onToggleSound,
  onOpenShop,
  onOpenMissions,
}: ArcadeHUDHeaderProps) {
  const [showXpTooltip, setShowXpTooltip] = useState(false);
  const progressPercent = getLevelProgress(stats.xp, stats.level);
  const nextLevelXp = getXpForNextLevel(stats.level);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Logo & Live Match Pulse */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 font-mono font-black text-white transition-all duration-300 group-hover:scale-105 group-hover:border-[#00FF66]">
              <span className="text-xl tracking-tighter">T</span>
              {/* Pitch green dot badge */}
              <span
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse"
                style={{ backgroundColor: PITCH_GREEN, boxShadow: `0 0 10px ${PITCH_GREEN}` }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white uppercase flex items-center gap-1.5">
                TOPFOUR<span className="text-white/40">.APP</span> <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">ARCADE</span>
              </span>
            </div>
          </Link>


          {/* Live Fixtures Ticker Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF66]"></span>
            </span>
            <span>MATCHDAY 2 • LIVE TICKER</span>
          </div>
        </div>

        {/* Center: Gamification Stats HUD (Level, Streak, Creds) */}
        <div className="flex items-center gap-3">
          
          {/* Level & XP Progress Bar */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition-all"
            onMouseEnter={() => setShowXpTooltip(true)}
            onMouseLeave={() => setShowXpTooltip(false)}
          >
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-[#00FF66]" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                LVL {stats.level}
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-16 sm:w-24 h-2 rounded-full bg-white/10 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: PITCH_GREEN, boxShadow: `0 0 8px ${PITCH_GREEN}` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
              {showXpTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-black border border-white/20 text-[11px] font-mono text-white whitespace-nowrap shadow-xl z-50"
                >
                  <p className="font-bold text-[#00FF66]">{stats.rank_title}</p>
                  <p className="text-white/70">{stats.xp} / {nextLevelXp} XP ({progressPercent}%)</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hot Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-4 w-4 text-amber-400" />
            </motion.div>
            <span className="text-xs font-mono font-bold text-white">
              {stats.current_streak} STREAK
            </span>
          </div>

          {/* Virtual Creds Button */}
          <button
            onClick={onOpenShop}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00FF66]/50 hover:bg-[#00FF66]/5 transition-all text-xs font-mono font-bold text-white group"
          >
            <Zap className="h-4 w-4 text-[#00FF66] transition-transform group-hover:scale-110" />
            <span>{stats.creds} CREDS</span>
          </button>
        </div>

        {/* Right: Sound FX & Login/Signup CTAs */}
        <div className="flex items-center gap-2.5">
          
          {/* Sound FX Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
              title={soundEnabled ? "Mute Arcade SFX" : "Enable Arcade SFX"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-[#00FF66]" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/15 transition-all"
          >
            <User className="h-3.5 w-3.5" />
            Sign In
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00FF66] px-4 py-2 text-xs font-black text-black transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,255,102,0.4)]"
          >
            PLAY NOW
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
