"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArcadeMatchPickCenter } from "./ArcadeMatchPickCenter";
import { CollectibleReceiptTicket, TicketPick, TicketStatus } from "@/components/gamification/CollectibleReceiptTicket";
import { MOCK_FIXTURES } from "@/lib/api-football/mock-data";
import { Trophy, Users, ShieldCheck, Receipt, X } from "lucide-react";
import { useMyRooms } from "@/hooks/use-my-rooms";

export function ArcadeLobbyView() {
  const { data: userRooms } = useMyRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("global");
  const [selectedPicks, setSelectedPicks] = useState<TicketPick[]>([]);

  // Mobile drawer state
  const [showMobileTicketDrawer, setShowMobileTicketDrawer] = useState(false);

  // Match Flow State: draft -> locked -> settled
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("draft");
  const [settledPoints, setSettledPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Upcoming fixtures
  const upcomingFixtures = MOCK_FIXTURES.filter((f) => f.status === "NS").slice(0, 6);

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
    setSettledPoints(basePts);
    setTicketStatus("settled");
    setShowCelebration(true);
  };

  const handleResetFlow = () => {
    setSelectedPicks([]);
    setTicketStatus("draft");
    setSettledPoints(0);
    setShowCelebration(false);
    setShowMobileTicketDrawer(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">

      {/* ── Top Target Group / Room Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-elevation-dark-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="w-full">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
              TARGET GROUP / ROOM
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full sm:w-auto bg-secondary text-foreground text-xs sm:text-sm font-bold font-sans rounded-lg border border-border px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer truncate"
              >
                <option value="global">🌐 Global Tournament Standings</option>
                {userRooms && userRooms.length > 0 ? (
                  userRooms.map((r) => (
                    <option key={r.room.id} value={r.room.id}>
                      🏆 {r.room.name} ({r.role.toUpperCase()})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="room-1">🏆 Premier League Pundits (Private Room)</option>
                    <option value="room-2">⭐️ Champions League Elite (Private Room)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground self-start sm:self-auto shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>MATCHDAY 2 • LIVE PICKS</span>
        </div>
      </div>

      {/* Floating Mobile Ticket Slip Trigger Button */}
      {selectedPicks.length > 0 && (
        <div className="fixed bottom-16 right-4 z-40 lg:hidden">
          <button
            onClick={() => setShowMobileTicketDrawer(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-glow-sky border border-sky-400 animate-bounce"
          >
            <Receipt className="h-4 w-4" />
            <span>SLIP ({selectedPicks.length} PICKS)</span>
          </button>
        </div>
      )}

      {/* Mobile Ticket Drawer Modal */}
      <AnimatePresence>
        {showMobileTicketDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-md lg:hidden"
          >
            <div className="relative w-full max-h-[85vh] overflow-y-auto bg-card rounded-t-3xl border-t border-border p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm font-bold text-foreground font-heading uppercase flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-sky-500" />
                  Your Matchday Receipt Slip
                </span>
                <button
                  onClick={() => setShowMobileTicketDrawer(false)}
                  className="p-1 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <CollectibleReceiptTicket
                picks={selectedPicks}
                status={ticketStatus}
                settledPointsEarned={settledPoints}
                onLockInPicks={() => {
                  handleLockIn();
                  setShowMobileTicketDrawer(false);
                }}
                onSimulateMatch={handleSimulateMatch}
                onClearPicks={handleResetFlow}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matchday Winner Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-5 shadow-glow-emerald">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Trophy className="h-8 w-8 fill-current text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold tracking-tight text-white uppercase font-heading">
                  PREDICTION TICKET SETTLED!
                </h3>
                <p className="text-xs font-mono text-emerald-400">MATCHDAY RESULTS CALCULATED</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
                <p className="text-slate-400">POINTS SCORED</p>
                <p className="text-3xl font-black text-emerald-400">+{settledPoints} PTS</p>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3.5 rounded-xl bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition-all shadow-glow-sky"
              >
                VIEW SETTLED RECEIPT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Predictor Layout */}
      <div className="grid gap-5 lg:grid-cols-12 items-start">

        {/* Left Column (7 cols): Sleek Matchday Predictor Board */}
        <div className="lg:col-span-8 space-y-6">
          <ArcadeMatchPickCenter
            fixtures={upcomingFixtures}
            selectedPicks={selectedPicks}
            onTogglePick={handleTogglePick}
          />
        </div>

        {/* Right Column (5 cols): Live Thermal Receipt Ticket (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
          <CollectibleReceiptTicket
            picks={selectedPicks}
            status={ticketStatus}
            settledPointsEarned={settledPoints}
            onLockInPicks={handleLockIn}
            onSimulateMatch={handleSimulateMatch}
            onClearPicks={handleResetFlow}
          />
        </div>
      </div>
    </div>
  );
}
