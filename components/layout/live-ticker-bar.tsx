"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Activity } from "lucide-react";

const TICKER_ITEMS = [
  { id: 1, type: "goal", text: "⚽ GOAL! Bukayo Saka 52' • Arsenal 1 - 0 Chelsea • +5 PTS awarded to 428 predictors" },
  { id: 2, type: "live", text: "🔥 1,840 live predictions currently submitted for European Matchday 2" },
  { id: 3, type: "lead", text: "🏆 Akinola Emmanuel took #1 spot on the European Leaderboard with 1,250 PTS!" },
  { id: 4, type: "goal", text: "⚽ GOAL! Erling Haaland 38' • Man City 2 - 1 Newcastle • +3 PTS awarded" },
  { id: 5, type: "room", text: "💬 Premier League Pundits Club created a new custom prediction claim: 'Elliot Anderson flop horizon'" },
];

export function LiveTickerBar() {
  return (
    <div className="w-full bg-card border-b border-border text-foreground py-1.5 px-4 overflow-hidden select-none text-[11px] font-mono shadow-xs z-30 transition-colors duration-300">
      <div className="flex items-center gap-3 mx-auto max-w-8xl">
        {/* Ticker Live Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          <span>MATCHDAY LIVE</span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex items-center gap-8 whitespace-nowrap w-max"
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <span key={`${item.id}-${idx}`} className="flex items-center gap-2 text-foreground/90 hover:text-sky-500 transition-colors cursor-pointer">
                <span>{item.text}</span>
                <span className="text-muted-foreground/40 font-sans">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
