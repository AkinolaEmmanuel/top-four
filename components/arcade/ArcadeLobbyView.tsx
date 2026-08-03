"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArcadeHUDHeader } from "./ArcadeHUDHeader";
import { ArcadeMatchPickCenter } from "./ArcadeMatchPickCenter";
import { CollectibleReceiptTicket, TicketPick, TicketStatus } from "@/components/gamification/CollectibleReceiptTicket";
import { INITIAL_GUEST_STATS, getXpForNextLevel } from "@/lib/gamification/gamification-engine";
import { MOCK_FIXTURES } from "@/lib/api-football/mock-data";
import { Flame, Trophy, Zap, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { PITCH_GREEN, PITCH_GREEN_GLOW } from "@/lib/brand/colors";

export function ArcadeLobbyView() {
  const [guestStats, setGuestStats] = useState(INITIAL_GUEST_STATS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPicks, setSelectedPicks] = useState<TicketPick[]>([]);
  const [isDoubleDownActive, setIsDoubleDownActive] = useState(false);

  // Single Game Flow State: draft -> locked -> settled
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("draft");
  const [settledPoints, setSettledPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Live upcoming fixtures (Not Started status)
  const upcomingFixtures = MOCK_FIXTURES.filter((f) => f.status === "NS").slice(0, 4);

  const handleTogglePick = (pick: TicketPick) => {
    if (ticketStatus !== "draft") return;

    setSelectedPicks((prev) => {
      const index = prev.findIndex((p) => p.fixtureId === pick.fixtureId);
      if (index >= 0) {
        const existing = prev[index];
        if (
          existing.pickType === pick.pickType &&
          JSON.stringify(existing.value) === JSON.stringify(pick.value)
        ) {
          return prev.filter((_, i) => i !== index);
        }
        const updated = [...prev];
        updated[index] = pick;
        return updated;
      }
      return [...prev, pick];
    });
  };

  const handleLockIn = () => {
    if (selectedPicks.length === 0) return;
    setTicketStatus("locked");
  };

  const handleSimulateMatch = () => {
    const basePts = selectedPicks.reduce((acc, p) => acc + p.points, 0);
    const multiplier = isDoubleDownActive ? 2 : 1;
    const finalPts = basePts * multiplier;
    const earnedXp = selectedPicks.length * 75 * multiplier;

    setSettledPoints(finalPts);
    setTicketStatus("settled");
    setShowCelebration(true);

    // Update guest stats
    setGuestStats((prev) => {
      const newXp = prev.xp + earnedXp;
      const nextXpThreshold = getXpForNextLevel(prev.level);
      const newLevel = newXp >= nextXpThreshold ? prev.level + 1 : prev.level;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        creds: prev.creds + finalPts * 10,
        current_streak: prev.current_streak + 1,
        total_predictions: prev.total_predictions + selectedPicks.length,
      };
    });
  };

  const handleResetFlow = () => {
    setSelectedPicks([]);
    setIsDoubleDownActive(false);
    setTicketStatus("draft");
    setSettledPoints(0);
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00FF66] selection:text-black">
      
      {/* Gaming HUD Header */}
      <ArcadeHUDHeader
        stats={guestStats}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Level Up / Winner Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#121212] border-2 border-[#00FF66] text-center space-y-5 shadow-[0_0_50px_rgba(0,255,102,0.4)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00FF66] text-black">
                <Trophy className="h-8 w-8 fill-current animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase text-white">MATCHDAY RECEIPT SETTLED!</h3>
                <p className="text-xs font-mono text-[#00FF66]">ALL PREDICTIONS CORRECTLY MATCHED</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono">
                <div>
                  <p className="text-white/50">PTS EARNED</p>
                  <p className="text-xl font-black text-[#00FF66]">+{settledPoints} PTS</p>
                </div>
                <div>
                  <p className="text-white/50">XP GAINED</p>
                  <p className="text-xl font-black text-amber-400">+{selectedPicks.length * 75 * (isDoubleDownActive ? 2 : 1)} XP</p>
                </div>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3.5 rounded-xl bg-[#00FF66] text-black font-black text-sm hover:scale-105 transition-all shadow-lg"
              >
                VIEW SETTLED RECEIPT TICKET
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Arcade Pitch Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Step Guide Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#121212] via-[#0F1710] to-[#121212] p-6 sm:p-8 shadow-2xl">
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[120px]"
            style={{ backgroundColor: PITCH_GREEN_GLOW }}
          />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
                  INTERACTIVE DEMO • SINGLE GAME FLOW
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mt-2">
                  TOPFOUR.APP <span className="text-[#00FF66]">GAMEFLOW</span>
                </h1>
              </div>

              {/* Game Flow Step Badges */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${ticketStatus === "draft" ? "bg-[#00FF66] text-black border-[#00FF66]" : "bg-white/5 border-white/10 text-white/50"}`}>
                  1. SELECT PICKS
                </div>
                <ChevronRight className="h-4 w-4 text-white/40" />
                <div className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${ticketStatus === "locked" ? "bg-amber-400 text-black border-amber-400" : "bg-white/5 border-white/10 text-white/50"}`}>
                  2. LOCK IN
                </div>
                <ChevronRight className="h-4 w-4 text-white/40" />
                <div className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${ticketStatus === "settled" ? "bg-[#00FF66] text-black border-[#00FF66]" : "bg-white/5 border-white/10 text-white/50"}`}>
                  3. SETTLE & WIN
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid: Match Pick Center + Thermal Receipt Ticket */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column: Match Pick Center */}
          <div className="lg:col-span-7 space-y-6">
            <ArcadeMatchPickCenter
              fixtures={upcomingFixtures}
              selectedPicks={selectedPicks}
              onTogglePick={handleTogglePick}
            />
          </div>

          {/* Right Column: Interactive Thermal Receipt Printer */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <CollectibleReceiptTicket
              picks={selectedPicks}
              status={ticketStatus}
              settledPointsEarned={settledPoints}
              isDoubleDownActive={isDoubleDownActive}
              onToggleDoubleDown={() => setIsDoubleDownActive(!isDoubleDownActive)}
              onLockInPicks={handleLockIn}
              onSimulateMatch={handleSimulateMatch}
              onClearPicks={handleResetFlow}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
