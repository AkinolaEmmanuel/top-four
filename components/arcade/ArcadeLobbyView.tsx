"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArcadeMatchPickCenter } from "./ArcadeMatchPickCenter";
import { CollectibleReceiptTicket, TicketPick, TicketStatus } from "@/components/gamification/CollectibleReceiptTicket";
import { MOCK_FIXTURES } from "@/lib/api-football/mock-data";
import { Trophy, Users, ShieldCheck, Receipt, X, ArrowRight, Globe, MessageSquare, RefreshCw } from "lucide-react";
import { useMyRooms } from "@/hooks/use-my-rooms";
import { getActiveDemoPersona } from "@/lib/mock-auth/personas";

export function ArcadeLobbyView() {
  const router = useRouter();
  const { data: userRooms } = useMyRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("global");
  const [selectedPicks, setSelectedPicks] = useState<TicketPick[]>([]);
  const [activePersona, setActivePersona] = useState(getActiveDemoPersona());

  // Modal State - persist to localStorage so it doesn't re-show on every visit
  const [showArenaModal, setShowArenaModal] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("topfour:arena");
  });
  const [modalStep, setModalStep] = useState<"initial" | "select-group">("initial");

  // Mobile drawer state
  const [showMobileTicketDrawer, setShowMobileTicketDrawer] = useState(false);

  // Match Flow State: draft -> locked -> settled
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("draft");
  const [settledPoints, setSettledPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Listen for persona changes
  useEffect(() => {
    function handlePersonaChange() {
      const p = getActiveDemoPersona();
      setActivePersona(p);
      if (p.groupsCount === 0) {
        setSelectedRoomId("global");
      }
    }
    window.addEventListener("topfour:persona_changed", handlePersonaChange);
    return () => window.removeEventListener("topfour:persona_changed", handlePersonaChange);
  }, []);

  // Filter fixtures based on selected room/group
  const activeRoomObj = userRooms?.find((r) => r.room.id === selectedRoomId)?.room;
  const enabledCompIds = activeRoomObj?.competitions ?? (selectedRoomId === "global" ? [39, 2, 140, 135, 78] : [39]);

  const upcomingFixtures = MOCK_FIXTURES.filter(
    (f) => f.status === "NS" && (selectedRoomId === "global" || enabledCompIds.includes(f.league.id))
  ).slice(0, 6);

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

  function handleSelectGlobalArena() {
    setSelectedRoomId("global");
    localStorage.setItem("topfour:arena", "global");
    setShowArenaModal(false);
  }

  function handleSelectGroupArena(roomId: string) {
    setSelectedRoomId(roomId);
    localStorage.setItem("topfour:arena", roomId);
    setShowArenaModal(false);
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0 w-full max-w-full min-w-0 overflow-hidden">

      {/* ── ONBOARDING ARENA SELECTION MODAL ── */}
      <AnimatePresence>
        {showArenaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.3)] relative"
            >
              {/* Close Modal Button */}
              <button
                onClick={() => setShowArenaModal(false)}
              >
                <X className="h-4 w-4" />
              </button>

              {modalStep === "initial" ? (
                <>
                  <div className="text-center space-y-2 max-w-sm mx-auto">
                  <h2 className="text-xl font-bold text-foreground font-heading">
                    Where do you want to predict?
                  </h2>
                  <p className="text-xs text-muted-foreground font-sans">
                    Choose your prediction arena to load today's fixtures.
                  </p>
                </div>

                  <div className="grid gap-3 pt-2">
                    {/* Option 1: Global Tournament */}
                    <button
                      type="button"
                      onClick={handleSelectGlobalArena}
                      className="w-full text-left flex items-center justify-between p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shrink-0">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground uppercase font-heading group-hover:text-sky-400">
                            Global Tournament Arena
                          </h3>
                          <p className="text-xs text-muted-foreground font-sans">
                            Predict across all European competitions against all pundits.
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-sky-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>

                    {/* Option 2: My Private Groups */}
                    <button
                      type="button"
                      onClick={() => {
                        if (userRooms && userRooms.length > 0) {
                          setModalStep("select-group");
                        } else {
                          router.push("/rooms/join");
                        }
                      }}
                      className="w-full text-left flex items-center justify-between p-4 rounded-2xl border border-border bg-secondary/80 hover:bg-secondary hover:border-sky-500/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-crown flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground uppercase font-heading group-hover:text-sky-400">
                            My Private Group Chat Leagues
                          </h3>
                          <p className="text-xs text-muted-foreground font-sans">
                            {userRooms && userRooms.length > 0
                              ? `Select from your ${userRooms.length} active private prediction groups.`
                              : "No private groups yet — Enter invite code or join a group."}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                  </div>
                </>
              ) : (
                /* Step 2: Select Specific Group */
                <>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setModalStep("initial")}
                      className="text-xs font-sans text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      ← Back
                    </button>
                    <h2 className="text-lg font-bold text-foreground font-heading">
                      Pick a private group
                    </h2>
                    <p className="text-xs text-muted-foreground font-sans">
                      Only fixtures for competitions in this group will be shown.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {userRooms?.map(({ room, role }) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => handleSelectGroupArena(room.id)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-secondary hover:border-sky-500 text-left transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Trophy className="h-4 w-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="font-bold text-foreground block truncate">{room.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {role.toUpperCase()} • {room.competitions.length} COMPETITIONS ENABLED
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-sky-400" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Arena Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-elevation-1 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-sans">Predicting in</span>
              <button
                type="button"
                onClick={() => {
                  setModalStep("initial");
                  setShowArenaModal(true);
                }}
                className="flex items-center gap-1 text-xs text-sky-500 hover:underline font-sans"
              >
                <RefreshCw className="h-3 w-3" /> Switch
              </button>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full sm:w-auto bg-secondary text-foreground text-xs sm:text-sm font-bold font-sans rounded-lg border border-border px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer truncate"
              >
                <option value="global">🌐 Global tournaments</option>
                {userRooms && userRooms.length > 0 && userRooms.map((r) => (
                  <option key={r.room.id} value={r.room.id}>
                    🏆 {r.room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground self-start sm:self-auto shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Live picks open</span>
        </div>
      </div>

      {/* Floating Mobile Ticket Slip Trigger Button */}
      {selectedPicks.length > 0 && (
        <div className="fixed bottom-16 right-4 z-40 lg:hidden">
          <button
            onClick={() => setShowMobileTicketDrawer(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-glow-sky border border-sky-400 animate-pulse"
          >
            <Receipt className="h-4 w-4" />
            <span>My slip ({selectedPicks.length})</span>
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
            <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-emerald-500/40 text-center space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Trophy className="h-8 w-8 fill-current text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
                  Your picks are settled!
                </h3>
                <p className="text-xs font-sans text-emerald-400">Results are in</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary border border-border text-xs font-sans">
                <p className="text-muted-foreground">Points earned</p>
                <p className="text-3xl font-black text-emerald-400">+{settledPoints}</p>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3.5 rounded-xl bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition-all shadow-glow-sky"
              >
                View settled receipt
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
