"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRight, CheckCircle2, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedHeroMatchCard() {
  const [selectedPick, setSelectedPick] = useState<"home" | "draw" | "away">("home");

  const picks = {
    home: { label: "Arsenal FC", multiplier: "2.10x", pts: 210 },
    draw: { label: "Draw", multiplier: "3.40x", pts: 340 },
    away: { label: "Chelsea FC", multiplier: "3.15x", pts: 315 },
  };

  const active = picks[selectedPick];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 shadow-glow-sky w-full md:w-[320px] lg:w-[360px] shrink-0 min-w-0 space-y-4"
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Card Header Tag */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold text-sky-400 tracking-wider uppercase">
            FEATURED MATCHDAY 2
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          74' LIVE
        </span>
      </div>

      {/* Matchup Banner */}
      <div className="flex items-center justify-between gap-2 py-1">
        {/* Home */}
        <div className="flex flex-col items-center text-center gap-1.5 min-w-0 flex-1">
          <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-white/10 p-2 flex items-center justify-center shadow-md">
            <img src="https://media.api-sports.io/football/teams/42.png" alt="Arsenal FC" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xs font-black text-white font-heading truncate w-full">Arsenal</span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-center font-mono shrink-0">
          <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wider bg-slate-950/80 px-3 py-1 rounded-xl border border-white/10 shadow-inner">
            2 - 1
          </span>
          <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Premier League</span>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center text-center gap-1.5 min-w-0 flex-1">
          <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-white/10 p-2 flex items-center justify-center shadow-md">
            <img src="https://media.api-sports.io/football/teams/49.png" alt="Chelsea FC" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xs font-black text-white font-heading truncate w-full">Chelsea</span>
        </div>
      </div>

      {/* Interactive Outcome Market Selector */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase">
          <span>SELECT OUTCOME</span>
          <span className="text-sky-400">1X2 MARKET</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(["home", "draw", "away"] as const).map((key) => {
            const item = picks[key];
            const isSelected = selectedPick === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedPick(key)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                  isSelected
                    ? "bg-sky-500/20 border-sky-400 text-white shadow-glow-sky font-bold"
                    : "bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/25 hover:bg-slate-900/80"
                }`}
              >
                <span className="text-[11px] font-bold truncate w-full">{key === "home" ? "1 (ARS)" : key === "draw" ? "X (Draw)" : "2 (CHE)"}</span>
                <span className={`text-xs font-mono font-black mt-0.5 ${isSelected ? "text-sky-400" : "text-slate-400"}`}>
                  {item.multiplier}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projected Earnings & Quick Lock-In CTA */}
      <div className="pt-2 border-t border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono bg-slate-950/80 p-2.5 rounded-xl border border-white/10">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            PROJECTED RETURN:
          </span>
          <motion.span
            key={active.pts}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-emerald-400 font-black text-sm"
          >
            +{active.pts} PTS
          </motion.span>
        </div>

        <Link href={`/predict?pick=${selectedPick}`} className="block">
          <Button variant="glow" size="sm" className="w-full justify-center font-bold text-xs gap-1.5 h-10 shadow-glow-sky">
            <span>LOCK IN PREDICTION</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Live Crowd Consensus Indicator */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
          <span>COMMUNITY CONSENSUS</span>
          <span className="text-emerald-400">74% ARSENAL WIN</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden flex">
          <div className="h-full bg-sky-500 w-[74%]" />
          <div className="h-full bg-amber-500 w-[18%]" />
          <div className="h-full bg-rose-500 w-[8%]" />
        </div>
      </div>
    </motion.div>
  );
}
