"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Share2, Printer, Shield, Sparkles } from "lucide-react";
import { PredictionValue, MarketType } from "@/types";
import { PITCH_GREEN } from "@/lib/brand/colors";

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
  ticketNumber = "RCPT-8894-01",
  isDoubleDownActive = false,
  status = "draft",
  settledPointsEarned = 0,
  onToggleDoubleDown,
  onLockInPicks,
  onSimulateMatch,
  onClearPicks,
}: CollectibleReceiptTicketProps) {

  const basePoints = picks.reduce((acc, p) => acc + p.points, 0);
  const totalMultiplier = isDoubleDownActive ? 2 : 1;
  const finalPoints = basePoints * totalMultiplier;
  const potentialXp = picks.length * 50 * totalMultiplier;

  return (
    <div className="relative w-full max-w-sm mx-auto font-mono">
      
      {/* Printer Slot Chrome Top Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl bg-[#1A1A1A] border-t border-x border-white/10 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Printer className="h-3.5 w-3.5 text-[#00FF66]" />
          <span className="font-bold tracking-wider text-white">THERMAL PRINTER</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-ping" />
          <span className="text-[10px] text-[#00FF66] font-bold">READY</span>
        </div>
      </div>

      {/* Perforated Top Edge SVG */}
      <svg className="w-full h-3 text-white fill-current" viewBox="0 0 300 12" preserveAspectRatio="none">
        <polygon points="0,12 0,0 15,12 30,0 45,12 60,0 75,12 90,0 105,12 120,0 135,12 150,0 165,12 180,0 195,12 210,0 225,12 240,0 255,12 270,0 285,12 300,0 300,12" />
      </svg>

      {/* Thermal Receipt Paper Body */}
      <motion.div
        layout
        className="bg-white text-black p-6 relative shadow-2xl space-y-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Receipt Header */}
        <div className="text-center border-b-2 border-dashed border-black/20 pb-4 space-y-1">
          <h3 className="text-2xl font-black tracking-tighter uppercase">TOPFOUR.APP MATCH TICKET</h3>
          <p className="text-[11px] font-bold text-black/60">GAMEDAY PREDICTION SLIP</p>
          <p className="text-[10px] font-mono text-black/40">SLIP #{ticketNumber} • {new Date().toLocaleDateString()}</p>

          {/* Ticket Status Stamp */}
          <div className="pt-1">
            {status === "draft" && (
              <span className="inline-block px-2.5 py-0.5 rounded bg-black/10 text-black/60 font-bold text-[10px]">
                • DRAFT PREDICTION SLIP •
              </span>
            )}
            {status === "locked" && (
              <span className="inline-block px-3 py-0.5 rounded bg-black text-[#00FF66] font-black text-xs tracking-wider animate-pulse">
                ✓ LOCKED IN FOR MATCHDAY
              </span>
            )}
            {status === "settled" && (
              <motion.span
                initial={{ scale: 1.5, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                className="inline-block px-4 py-1 rounded bg-[#00FF66] text-black font-black text-xs tracking-widest border-2 border-black shadow-lg"
              >
                ★ WINNER: +{settledPointsEarned} PTS EARNED! ★
              </motion.span>
            )}
          </div>
        </div>

        {/* Double Down Badge */}
        {isDoubleDownActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-1.5 p-2 rounded bg-black text-[#00FF66] font-black text-xs tracking-wider"
          >
            <Zap className="h-4 w-4 fill-current" />
            DOUBLE DOWN 2X MULTIPLIER ACTIVE
          </motion.div>
        )}

        {/* Selected Picks Listing */}
        <div className="space-y-3 min-h-[140px]">
          <AnimatePresence mode="popLayout">
            {picks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center text-black/40 space-y-2"
              >
                <Sparkles className="h-8 w-8 stroke-[1.5]" />
                <p className="text-xs font-bold uppercase">No picks selected yet</p>
                <p className="text-[10px]">Click fixture outcomes to print your receipt</p>
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
                    <p className="text-[10px] font-bold text-emerald-600">+{pick.points * totalMultiplier} PTS</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Summary & Payout Totals */}
        <div className="border-t-2 border-black pt-3 space-y-1.5 text-xs font-bold">
          <div className="flex justify-between text-black/70">
            <span>SELECTIONS:</span>
            <span>{picks.length} MATCHES</span>
          </div>
          <div className="flex justify-between text-black/70">
            <span>XP MULTIPLIER:</span>
            <span className="text-emerald-700">+{potentialXp} XP</span>
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
          {/* Simulated Barcode */}
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
              {onToggleDoubleDown && (
                <button
                  onClick={onToggleDoubleDown}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                    isDoubleDownActive
                      ? "bg-[#00FF66] border-[#00FF66] text-black shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                      : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  <Zap className="h-4 w-4 fill-current" />
                  {isDoubleDownActive ? "2X DOUBLE DOWN ON" : "USE DOUBLE DOWN (2X)"}
                </button>
              )}
              {onClearPicks && picks.length > 0 && (
                <button
                  onClick={onClearPicks}
                  className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-xs font-bold"
                >
                  CLEAR
                </button>
              )}
            </div>

            {onLockInPicks && (
              <button
                onClick={onLockInPicks}
                disabled={picks.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#00FF66] text-black font-black text-sm hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              >
                <Check className="h-4 w-4" />
                STEP 2: LOCK IN RECEIPT
              </button>
            )}
          </>
        )}

        {status === "locked" && onSimulateMatch && (
          <button
            onClick={onSimulateMatch}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-400 text-black font-black text-sm hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          >
            <Sparkles className="h-4 w-4" />
            STEP 3: SIMULATE MATCHES & GRADE RECEIPT
          </button>
        )}

        {status === "settled" && onClearPicks && (
          <button
            onClick={onClearPicks}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition-all"
          >
            PLAY ANOTHER MATCHDAY SLIP
          </button>
        )}
      </div>
    </div>
  );
}

function getPickLabel(val: PredictionValue): string {

  if (val.market === "match_result") return val.pick.toUpperCase();
  if (val.market === "exact_score") return `${val.home} - ${val.away}`;
  if (val.market === "btts") return val.pick ? "YES" : "NO";
  if (val.market === "total_goals") return val.pick.toUpperCase();
  return "PICKED";
}
