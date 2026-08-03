"use client";

import { useState } from "react";
import { TeamLogo } from "@/components/ui/team-logo";
import { motion } from "framer-motion";
import { Zap, ChevronRight, Trophy, Sparkles, Plus, Minus } from "lucide-react";
import { Fixture } from "@/lib/api-football/types";
import { PredictionValue, MarketType } from "@/types";
import { TicketPick } from "@/components/gamification/CollectibleReceiptTicket";
import { PITCH_GREEN, PITCH_GREEN_GLOW } from "@/lib/brand/colors";


interface ArcadeMatchPickCenterProps {
  fixtures: Fixture[];
  selectedPicks: TicketPick[];
  onTogglePick: (pick: TicketPick) => void;
}

export function ArcadeMatchPickCenter({
  fixtures,
  selectedPicks,
  onTogglePick,
}: ArcadeMatchPickCenterProps) {
  const [activeMarket, setActiveMarket] = useState<MarketType>("match_result");

  return (
    <div className="space-y-6">
      
      {/* Category & Market Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-ping" />
            <h2 className="text-xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              GAMEWEEK 2 • LIVE MATCH BOARD
            </h2>
          </div>
          <p className="text-xs text-white/60 font-mono mt-1">
            Click outcomes to print your real-time prediction receipt ticket.
          </p>
        </div>

        {/* Market Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          {(["match_result", "exact_score", "btts", "total_goals"] as MarketType[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMarket(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeMarket === m
                  ? "bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {m.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Fixtures List Grid */}
      <div className="space-y-4">
        {fixtures.map((fixture) => {
          const existingPick = selectedPicks.find((p) => p.fixtureId === fixture.id);

          return (
            <motion.div
              key={fixture.id}
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-5 transition-all hover:border-white/20 shadow-xl"
            >
              {/* Fixture Header Bar */}
              <div className="flex items-center justify-between text-xs text-white/50 font-mono mb-4 border-b border-white/5 pb-2.5">
                <span className="flex items-center gap-1.5 font-bold text-white/80">
                  <Trophy className="h-3.5 w-3.5 text-[#00FF66]" />
                  {fixture.league.name}
                </span>
                <span>{new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

              </div>

              {/* Match Teams Row */}
              <div className="grid grid-cols-3 items-center text-center my-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-12 w-12 flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10">
                    <TeamLogo src={fixture.teams.home.logo} teamName={fixture.teams.home.name} />
                  </div>
                  <span className="text-sm font-bold text-white max-w-[110px] truncate">{fixture.teams.home.name}</span>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    VS
                  </span>
                  <span className="text-[10px] font-mono text-[#00FF66] mt-1.5 font-bold">+2 PTS RESULT</span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-12 w-12 flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10">
                    <TeamLogo src={fixture.teams.away.logo} teamName={fixture.teams.away.name} />
                  </div>
                  <span className="text-sm font-bold text-white max-w-[110px] truncate">{fixture.teams.away.name}</span>
                </div>
              </div>

              {/* Interactive Market Choices */}
              <div className="mt-5">
                {activeMarket === "match_result" && (
                  <MatchResultPicker
                    fixture={fixture}
                    selectedPick={existingPick}
                    onSelect={(val) =>
                      onTogglePick({
                        fixtureId: fixture.id,
                        homeTeam: fixture.teams.home.name,
                        awayTeam: fixture.teams.away.name,
                        pickType: "match_result",
                        value: val,
                        points: 2,
                      })
                    }
                  />
                )}

                {activeMarket === "exact_score" && (
                  <ExactScorePicker
                    fixture={fixture}
                    selectedPick={existingPick}
                    onSelect={(val) =>
                      onTogglePick({
                        fixtureId: fixture.id,
                        homeTeam: fixture.teams.home.name,
                        awayTeam: fixture.teams.away.name,
                        pickType: "exact_score",
                        value: val,
                        points: 5,
                      })
                    }
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MatchResultPicker({
  fixture,
  selectedPick,
  onSelect,
}: {
  fixture: Fixture;
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentPick = selectedPick?.value.market === "match_result" ? selectedPick.value.pick : null;

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {[
        { label: "HOME WIN", pick: "home" as const, sub: fixture.teams.home.name },
        { label: "DRAW", pick: "draw" as const, sub: "Equaled Score" },
        { label: "AWAY WIN", pick: "away" as const, sub: fixture.teams.away.name },
      ].map((item) => {
        const isSelected = currentPick === item.pick;

        return (
          <motion.button
            key={item.pick}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect({ market: "match_result", pick: item.pick })}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
              isSelected
                ? "bg-[#00FF66] border-[#00FF66] text-black shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <span>{item.label}</span>
            <span className={`text-[10px] truncate max-w-[80px] ${isSelected ? "text-black/70" : "text-white/40"}`}>
              {item.sub}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function ExactScorePicker({
  fixture,
  selectedPick,
  onSelect,
}: {
  fixture: Fixture;
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentExact =
    selectedPick?.value.market === "exact_score"
      ? selectedPick.value
      : { market: "exact_score" as const, home: 2, away: 1 };

  const [homeScore, setHomeScore] = useState(currentExact.home);
  const [awayScore, setAwayScore] = useState(currentExact.away);

  const handleApply = (h: number, a: number) => {
    onSelect({ market: "exact_score", home: h, away: a });
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
      <div className="flex items-center gap-3">
        <span className="font-bold text-white">EXACT SCORE:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = Math.max(0, homeScore - 1);
              setHomeScore(next);
              handleApply(next, awayScore);
            }}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-base font-black text-[#00FF66] w-5 text-center">{homeScore}</span>
          <button
            onClick={() => {
              const next = homeScore + 1;
              setHomeScore(next);
              handleApply(next, awayScore);
            }}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <span className="text-white/40">-</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = Math.max(0, awayScore - 1);
              setAwayScore(next);
              handleApply(homeScore, next);
            }}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-base font-black text-[#00FF66] w-5 text-center">{awayScore}</span>
          <button
            onClick={() => {
              const next = awayScore + 1;
              setAwayScore(next);
              handleApply(homeScore, next);
            }}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <button
        onClick={() => handleApply(homeScore, awayScore)}
        className="px-3 py-1.5 rounded-lg bg-[#00FF66] text-black font-black text-xs hover:scale-105 transition-all"
      >
        SELECT ({homeScore}-{awayScore})
      </button>
    </div>
  );
}
