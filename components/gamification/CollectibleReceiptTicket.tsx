"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Printer, Ticket } from "lucide-react";
import { PredictionValue, MarketType } from "@/types";

export type TicketPick = {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  pickType: MarketType;
  value: PredictionValue;
  isDoubleDown?: boolean;
  points: number;
};

export type TicketStatus = "draft" | "locked" | "settled";

interface CollectibleReceiptTicketProps {
  picks: TicketPick[];
  agreedClaims?: string[];
  ticketNumber?: string;
  isDoubleDownActive?: boolean;
  status?: TicketStatus;
  settledPointsEarned?: number;
  onToggleDoubleDown?: () => void;
  onLockInPicks?: () => void;
  onSimulateMatch?: () => void;
  onClearPicks?: () => void;
}

export function CollectibleReceiptTicket({
  picks,
  agreedClaims = [],
  ticketNumber = "RCPT-8894-01",
  isDoubleDownActive = false,
  status = "draft",
  settledPointsEarned = 0,
  onToggleDoubleDown,
  onLockInPicks,
  onSimulateMatch,
  onClearPicks,
}: CollectibleReceiptTicketProps) {

  const basePoints = picks.reduce((acc, p) => acc + p.points, 0) + (agreedClaims.length * 50);
  const totalMultiplier = isDoubleDownActive ? 2 : 1;
  const finalPoints = basePoints * totalMultiplier;

  return (
    <div className="relative w-full max-w-sm mx-auto font-mono">
      
      {/* Printer Slot Chrome Top Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl bg-card border-t border-x border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Printer className="h-3.5 w-3.5 text-sky-500" />
          <span className="font-bold tracking-wider text-foreground">Receipt slip</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Ready</span>
        </div>
      </div>

      {/* Perforated Top Edge SVG */}
      <svg className="w-full h-3 text-white fill-current" viewBox="0 0 300 12" preserveAspectRatio="none">
        <polygon points="0,12 0,0 15,12 30,0 45,12 60,0 75,12 90,0 105,12 120,0 135,12 150,0 165,12 180,0 195,12 210,0 225,12 240,0 255,12 270,0 285,12 300,0 300,12" />
      </svg>

      {/* Thermal Receipt Paper Body */}
      <motion.div
        layout
        className="bg-white text-black p-6 relative shadow-2xl space-y-4 group overflow-hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Holographic Foil Hover Sweep */}
        <div className="pointer-events-none absolute inset-0 z-20 translate-x-[-150%] bg-gradient-to-r from-transparent via-[rgba(14,165,233,0.15)] to-transparent opacity-0 transition-all duration-[1000ms] ease-in-out group-hover:translate-x-[150%] group-hover:opacity-100 mix-blend-overlay" />
        
        {/* Receipt Header */}
        <div className="text-center border-b-2 border-dashed border-black/20 pb-4 space-y-1">
          <h3 className="text-2xl font-black tracking-tighter uppercase">TOPFOUR.APP MATCH TICKET</h3>
          <p className="text-[11px] font-bold text-black/60">GAMEDAY PREDICTION SLIP</p>
          <p className="text-[10px] font-mono text-black/40">SLIP #{ticketNumber} • {new Date().toLocaleDateString()}</p>

          {/* Ticket Status Stamp */}
          <div className="pt-1">
            {status === "draft" && (
              <span className="inline-block px-2.5 py-0.5 rounded bg-black/10 text-black/60 font-bold text-[10px]">
                Draft slip
              </span>
            )}
            {status === "locked" && (
              <span className="inline-block px-3 py-0.5 rounded bg-black text-sky-400 font-bold text-xs tracking-wide animate-pulse">
                ✓ Locked in
              </span>
            )}
            {status === "settled" && (
              <motion.span
                initial={{ scale: 1.2, rotate: -3 }}
                animate={{ scale: 1, rotate: 0 }}
                className="inline-block px-4 py-1 rounded bg-emerald-500 text-slate-950 font-black text-xs tracking-wide border-2 border-black shadow-lg"
              >
                ★ +{settledPointsEarned} pts earned
              </motion.span>
            )}
          </div>
        </div>

        {/* Selected Picks Listing */}
        <div className="space-y-3 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {picks.length === 0 && agreedClaims.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center text-black/40 space-y-2"
              >
                <Ticket className="h-8 w-8 stroke-[1.5]" />
                <p className="text-xs font-semibold">Your slip is empty</p>
                <p className="text-[10px]">Pick a match outcome below to get started.</p>
              </motion.div>
            ) : (
              picks.map((pick, i) => (
                <motion.div
                  key={`${pick.fixtureId}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between border-b border-dashed border-black/15 pb-2 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-black uppercase">{pick.homeTeam} vs {pick.awayTeam}</span>
                    <span className="text-[10px] text-black/60 font-semibold">
                      MARKET: {pick.pickType.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded bg-black text-white font-bold text-xs">
                      {getPickLabel(pick.value)}
                    </span>
                    <p className="text-[10px] font-bold text-emerald-600">+{pick.points} PTS</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Agreed Claims Section on Receipt */}
        {agreedClaims.length > 0 && (
          <div className="border-t-2 border-dashed border-black/20 pt-3 space-y-1.5">
            <span className="text-[10px] font-black tracking-wider text-black/70 block uppercase flex items-center gap-1">
              <span>★ AGREED COMMUNITY CLAIMS</span>
            </span>
            {agreedClaims.map((claimTitle, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                <span className="font-bold text-black truncate flex-1 pr-2">✓ "{claimTitle}"</span>
                <span className="font-black text-emerald-600 text-[10px] shrink-0 font-mono">+50 PTS</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary & Payout Totals */}
        <div className="border-t-2 border-black pt-3 space-y-1.5 text-xs font-bold">
          <div className="flex justify-between text-black/70">
            <span>TOTAL SELECTIONS:</span>
            <span>{picks.length + agreedClaims.length} PICKS</span>
          </div>
          <div className="flex justify-between text-sm font-black border-t border-dashed border-black/20 pt-2 text-black">
            <span>{status === "settled" ? "FINAL PTS WON:" : "EST. MAX PAYOUT:"}</span>
            <span className="text-emerald-600 text-base">
              {status === "settled" ? settledPointsEarned : finalPoints} PTS
            </span>
          </div>
        </div>

        {/* Barcode & Stamps */}
        <div className="border-t border-black/20 pt-4 flex flex-col items-center justify-center space-y-2">
          <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px)]" />
          <p className="text-[9px] tracking-widest text-black/50">||| | |||| || ||| |||| | |||</p>
        </div>
      </motion.div>

      {/* Perforated Bottom Edge SVG */}
      <svg className="w-full h-3 text-white fill-current rotate-180" viewBox="0 0 300 12" preserveAspectRatio="none">
        <polygon points="0,12 0,0 15,12 30,0 45,12 60,0 75,12 90,0 105,12 120,0 135,12 150,0 165,12 180,0 195,12 210,0 225,12 240,0 255,12 270,0 285,12 300,0 300,12" />
      </svg>

      {/* Interactive Game Flow Controls below receipt */}
      <div className="mt-4 space-y-2">
        {status === "draft" && (
          <>
            <div className="flex items-center gap-2">
              {onClearPicks && picks.length > 0 && (
                <button
                  onClick={onClearPicks}
                  className="w-full py-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-xs font-bold transition-all active:scale-95 duration-150"
                >
                  Clear picks
                </button>
              )}
            </div>

            {onLockInPicks && (
              <button
                onClick={onLockInPicks}
                disabled={picks.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 disabled:opacity-40 transition-all shadow-glow-sky active:scale-95 duration-150"
              >
                <Check className="h-4 w-4" />
                Lock in my picks
              </button>
            )}
          </>
        )}

        {status === "settled" && onClearPicks && (
          <button
            onClick={onClearPicks}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary border border-border text-foreground font-bold text-xs hover:bg-accent transition-all active:scale-95 duration-150"
          >
            Start a new slip
          </button>
        )}
      </div>
    </div>
  );
}

function getPickLabel(val: PredictionValue): string {
  const v = val as any;
  if (v.market === "match_result") {
    return v.pick === "home" ? "HOME (1)" : v.pick === "away" ? "AWAY (2)" : "DRAW (X)";
  }
  if (v.market === "exact_score") {
    return `${v.home} - ${v.away}`;
  }
  if (v.market === "btts") {
    return v.pick === "yes" || v.pick === true ? "BTTS: YES" : "BTTS: NO";
  }
  if (v.market === "total_goals") {
    return v.pick === "over" ? "OVER 2.5" : "UNDER 2.5";
  }
  if (v.market === "double_chance") {
    return v.pick === "1X" ? "1X (HOME/DRAW)" : v.pick === "12" ? "12 (HOME/AWAY)" : "X2 (DRAW/AWAY)";
  }
  if (v.market === "anytime_scorer") {
    return `SCORER: ${v.player}`;
  }
  if (v.market === "player_card") {
    return `CARDED: ${v.player}`;
  }
  if (v.market === "custom_question") {
    return `ANS: ${v.answer}`;
  }
  return "PICKED";
}
