"use client";

import { useState } from "react";
import { TeamLogo } from "@/components/ui/team-logo";
import { Clock, Flame, Target, HelpCircle, ShieldAlert, Sparkles } from "lucide-react";
import { Fixture } from "@/lib/api-football/types";
import { PredictionValue, MarketType, DEFAULT_SCORING_CONFIG } from "@/types";
import { TicketPick } from "@/components/gamification/CollectibleReceiptTicket";

interface ArcadeMatchPickCenterProps {
  fixtures: Fixture[];
  selectedPicks: TicketPick[];
  onTogglePick: (pick: TicketPick) => void;
}

const LEAGUE_TABS = [
  { id: "all", name: "All Comps", flag: "🌐" },
  { id: 39, name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga", flag: "🇪🇸" },
  { id: 135, name: "Serie A", flag: "🇮🇹" },
  { id: 78, name: "Bundesliga", flag: "🇩🇪" },
  { id: 61, name: "Ligue 1", flag: "🇫🇷" },
  { id: 2, name: "Champions League", flag: "🇪🇺" },
];

const MARKET_TABS: { id: MarketType; label: string; pts: number }[] = [
  { id: "match_result", label: "RESULT (1X2)", pts: 5 },
  { id: "exact_score", label: "EXACT SCORE", pts: 3 },
  { id: "btts", label: "BTTS", pts: 4 },
  { id: "total_goals", label: "GOALS (O/U)", pts: 3 },
  { id: "anytime_scorer", label: "GOALSCORER", pts: 2 },
  { id: "player_card", label: "CARDED", pts: 4 },
  { id: "custom_question", label: "CUSTOM Q", pts: 3 },
];

const MOCK_SCORERS: Record<string, string[]> = {
  Arsenal: ["Bukayo Saka", "Kai Havertz", "Gabriel Martinelli", "Leandro Trossard"],
  Chelsea: ["Cole Palmer", "Nicolas Jackson", "Noni Madueke", "Christopher Nkunku"],
  "Manchester City": ["Erling Haaland", "Phil Foden", "Kevin De Bruyne", "Savinho"],
  Liverpool: ["Mohamed Salah", "Darwin Núñez", "Diogo Jota", "Cody Gakpo"],
  "Real Madrid": ["Kylian Mbappé", "Vinícius Júnior", "Jude Bellingham", "Rodrygo"],
  Barcelona: ["Robert Lewandowski", "Lamine Yamal", "Raphinha", "Dani Olmo"],
};

const MOCK_CARDS: Record<string, string[]> = {
  Arsenal: ["Declan Rice", "Thomas Partey", "William Saliba", "Gabriel Magalhães"],
  Chelsea: ["Moisés Caicedo", "Enzo Fernández", "Marc Cucurella", "Nicolas Jackson"],
  "Manchester City": ["Rodri", "Rúben Dias", "Bernardo Silva", "Mateo Kovačić"],
  Liverpool: ["Alexis Mac Allister", "Dominik Szoboszlai", "Ibrahima Konaté", "Virgil van Dijk"],
  "Real Madrid": ["Daniel Carvajal", "Aurélien Tchouaméni", "Antonio Rüdiger", "Jude Bellingham"],
  Barcelona: ["Gavi", "Íñigo Martínez", "Frenkie de Jong", "Pedri"],
};

export function ArcadeMatchPickCenter({
  fixtures,
  selectedPicks,
  onTogglePick,
}: ArcadeMatchPickCenterProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "all">("all");
  const [activeMarket, setActiveMarket] = useState<MarketType>("match_result");

  const filteredFixtures = fixtures.filter((f) => {
    if (selectedLeagueId === "all") return true;
    return f.league.id === selectedLeagueId;
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-6 space-y-4 sm:space-y-5 shadow-sm dark:shadow-elevation-dark-1">
      
      {/* ── Top Control Bar ── */}
      <div className="space-y-3.5 border-b border-border pb-4">
        
        {/* Header Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-foreground uppercase font-heading flex items-center gap-2">
              MATCHDAY PREDICTOR BOARD
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground font-mono mt-0.5">
            Filter competition & prediction market below. Picks appear directly under each match.
          </p>
        </div>

        {/* 1. League Competition Filter Tabs */}
        <div className="space-y-1">
          <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
            SELECT COMPETITION
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {LEAGUE_TABS.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLeagueId(l.id as any)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                  selectedLeagueId === l.id
                    ? "bg-sky-500/15 border-sky-500/40 text-sky-500 shadow-sm"
                    : "border-border bg-slate-50/80 dark:bg-slate-900/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Prediction Market Switcher Tabs */}
        <div className="space-y-1 pt-0.5">
          <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
            PREDICTION MARKET
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none p-1 rounded-xl bg-secondary/80 border border-border w-full -mx-1 px-1">
            {MARKET_TABS.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMarket(m.id)}
                className={`flex-1 min-w-[95px] shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold text-center transition-all active:scale-95 duration-150 ${
                  activeMarket === m.id
                    ? "bg-sky-500 text-white shadow-glow-sky"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <span>{m.label}</span>
                <span className="block text-[9px] opacity-80">+{m.pts}PTS</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fixtures Table Board (Predictions directly UNDER the match for maximum space) ── */}
      <div className="space-y-4">
        {filteredFixtures.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-mono text-xs">
            No fixtures match the selected competition filter.
          </div>
        ) : (
          filteredFixtures.map((fixture) => {
            const existingPick = selectedPicks.find((p) => p.fixtureId === fixture.id);

            return (
              <div
                key={fixture.id}
                className="p-4 rounded-xl border border-border bg-secondary/30 hover:border-sky-500/40 transition-colors shadow-sm space-y-3"
              >
                {/* Top Section: Match Teams & Kickoff Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                  {/* Left: Kickoff Time */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-sky-500" />
                    <span>{new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Center: Home Team — VS — Away Team (Spacious Center) */}
                  <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1 my-1">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 font-sans font-bold text-xs sm:text-sm text-foreground text-right">
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{fixture.teams.home.name}</span>
                      <div className="h-8 w-8 p-1 rounded-lg bg-card border border-border shrink-0 flex items-center justify-center">
                        <TeamLogo src={fixture.teams.home.logo} teamName={fixture.teams.home.name} size={22} />
                      </div>
                    </div>

                    {/* VS Badge */}
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border shrink-0">
                      VS
                    </span>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 font-sans font-bold text-xs sm:text-sm text-foreground text-left">
                      <div className="h-8 w-8 p-1 rounded-lg bg-card border border-border shrink-0 flex items-center justify-center">
                        <TeamLogo src={fixture.teams.away.logo} teamName={fixture.teams.away.name} size={22} />
                      </div>
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{fixture.teams.away.name}</span>
                    </div>
                  </div>

                  {/* Right: Points Awarded Badge */}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                    +{DEFAULT_SCORING_CONFIG[activeMarket]} PTS
                  </span>
                </div>

                {/* Bottom Section (Directly UNDER the Match): Full-Width Outcome Picker */}
                <div className="w-full pt-1">
                  {activeMarket === "match_result" && (
                    <MatchResultUnderPicker
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
                    <ExactScoreUnderPicker
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

                  {activeMarket === "btts" && (
                    <BttsUnderPicker
                      selectedPick={existingPick}
                      onSelect={(val) =>
                        onTogglePick({
                          fixtureId: fixture.id,
                          homeTeam: fixture.teams.home.name,
                          awayTeam: fixture.teams.away.name,
                          pickType: "btts",
                          value: val,
                          points: 1,
                        })
                      }
                    />
                  )}

                  {activeMarket === "total_goals" && (
                    <TotalGoalsUnderPicker
                      selectedPick={existingPick}
                      onSelect={(val) =>
                        onTogglePick({
                          fixtureId: fixture.id,
                          homeTeam: fixture.teams.home.name,
                          awayTeam: fixture.teams.away.name,
                          pickType: "total_goals",
                          value: val,
                          points: 1,
                        })
                      }
                    />
                  )}

                  {activeMarket === "anytime_scorer" && (
                    <AnytimeScorerUnderPicker
                      fixture={fixture}
                      selectedPick={existingPick}
                      onSelect={(val) =>
                        onTogglePick({
                          fixtureId: fixture.id,
                          homeTeam: fixture.teams.home.name,
                          awayTeam: fixture.teams.away.name,
                          pickType: "anytime_scorer",
                          value: val,
                          points: 5,
                        })
                      }
                    />
                  )}

                  {activeMarket === "player_card" && (
                    <PlayerCardUnderPicker
                      fixture={fixture}
                      selectedPick={existingPick}
                      onSelect={(val) =>
                        onTogglePick({
                          fixtureId: fixture.id,
                          homeTeam: fixture.teams.home.name,
                          awayTeam: fixture.teams.away.name,
                          pickType: "player_card",
                          value: val,
                          points: 4,
                        })
                      }
                    />
                  )}

                  {activeMarket === "custom_question" && (
                    <CustomQuestionUnderPicker
                      selectedPick={existingPick}
                      onSelect={(val) =>
                        onTogglePick({
                          fixtureId: fixture.id,
                          homeTeam: fixture.teams.home.name,
                          awayTeam: fixture.teams.away.name,
                          pickType: "custom_question",
                          value: val,
                          points: 3,
                        })
                      }
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MatchResultUnderPicker({
  fixture,
  selectedPick,
  onSelect,
}: {
  fixture: Fixture;
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentPick = (selectedPick?.value as any)?.market === "match_result" ? (selectedPick?.value as any).pick : null;

  return (
    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
      {[
        { label: "1 — HOME WIN", sub: fixture.teams.home.name, pick: "home" as const },
        { label: "X — DRAW", sub: "Equaled Score", pick: "draw" as const },
        { label: "2 — AWAY WIN", sub: fixture.teams.away.name, pick: "away" as const },
      ].map((item) => {
        const isSelected = currentPick === item.pick;

        return (
          <button
            key={item.pick}
            onClick={() => onSelect({ market: "match_result", pick: item.pick })}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg border font-bold transition-all ${
              isSelected
                ? "bg-sky-500 border-sky-400 text-white shadow-glow-sky"
                : "bg-card border-border text-foreground hover:bg-secondary hover:border-sky-500/40"
            }`}
          >
            <span className="text-xs sm:text-sm font-black">{item.label}</span>
            <span className={`text-[10px] truncate max-w-[120px] mt-0.5 ${isSelected ? "text-white" : "text-muted-foreground"}`}>
              {item.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ExactScoreUnderPicker({
  fixture,
  selectedPick,
  onSelect,
}: {
  fixture: Fixture;
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentExact =
    (selectedPick?.value as any)?.market === "exact_score"
      ? (selectedPick?.value as any)
      : { market: "exact_score" as const, home: 2, away: 1 };

  const [homeScore, setHomeScore] = useState(currentExact.home);
  const [awayScore, setAwayScore] = useState(currentExact.away);

  const handleApply = (h: number, a: number) => {
    onSelect({ market: "exact_score", home: h, away: a });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border text-xs font-mono">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
        <span className="font-bold text-foreground">SET SCORELINE:</span>
        
        {/* Home Counter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-bold">{fixture.teams.home.name.slice(0, 3)}</span>
          <button
            onClick={() => {
              const next = Math.max(0, homeScore - 1);
              setHomeScore(next);
              handleApply(next, awayScore);
            }}
            className="h-9 w-9 rounded-lg bg-secondary hover:bg-accent text-foreground flex items-center justify-center font-bold text-base active:scale-90 transition-transform touch-manipulation border border-border"
          >
            -
          </button>
          <span className="text-lg font-black text-sky-500 w-6 text-center">{homeScore}</span>
          <button
            onClick={() => {
              const next = homeScore + 1;
              setHomeScore(next);
              handleApply(next, awayScore);
            }}
            className="h-9 w-9 rounded-lg bg-secondary hover:bg-accent text-foreground flex items-center justify-center font-bold text-base active:scale-90 transition-transform touch-manipulation border border-border"
          >
            +
          </button>
        </div>

        <span className="text-muted-foreground font-bold">-</span>

        {/* Away Counter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = Math.max(0, awayScore - 1);
              setAwayScore(next);
              handleApply(homeScore, next);
            }}
            className="h-9 w-9 rounded-lg bg-secondary hover:bg-accent text-foreground flex items-center justify-center font-bold text-base active:scale-90 transition-transform touch-manipulation border border-border"
          >
            -
          </button>
          <span className="text-lg font-black text-sky-500 w-6 text-center">{awayScore}</span>
          <button
            onClick={() => {
              const next = awayScore + 1;
              setAwayScore(next);
              handleApply(homeScore, next);
            }}
            className="h-9 w-9 rounded-lg bg-secondary hover:bg-accent text-foreground flex items-center justify-center font-bold text-base active:scale-90 transition-transform touch-manipulation border border-border"
          >
            +
          </button>
          <span className="text-muted-foreground font-bold">{fixture.teams.away.name.slice(0, 3)}</span>
        </div>
      </div>

      <button
        onClick={() => handleApply(homeScore, awayScore)}
        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-all shadow-glow-sky"
      >
        LOCK SCORE ({homeScore} - {awayScore})
      </button>
    </div>
  );
}

function BttsUnderPicker({
  selectedPick,
  onSelect,
}: {
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentPick = (selectedPick?.value as any)?.market === "btts" ? (selectedPick?.value as any).pick : null;

  return (
    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
      {[
        { label: "BOTH TEAMS TO SCORE: YES", pick: "yes" as const },
        { label: "BOTH TEAMS TO SCORE: NO", pick: "no" as const },
      ].map((item) => {
        const isSelected = currentPick === item.pick || (currentPick === true && item.pick === "yes");

        return (
          <button
            key={item.pick}
            onClick={() => onSelect({ market: "btts", pick: item.pick } as any)}
            className={`py-2.5 px-3 rounded-lg border font-bold text-xs transition-all ${
              isSelected
                ? "bg-emerald-500 border-emerald-400 text-white shadow-glow-emerald"
                : "bg-card border-border text-foreground hover:bg-secondary hover:border-emerald-500/40"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function TotalGoalsUnderPicker({
  selectedPick,
  onSelect,
}: {
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentPick = (selectedPick?.value as any)?.market === "total_goals" ? (selectedPick?.value as any).pick : null;

  return (
    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
      {[
        { label: "OVER 2.5 TOTAL GOALS", pick: "over" as const },
        { label: "UNDER 2.5 TOTAL GOALS", pick: "under" as const },
      ].map((item) => {
        const isSelected = currentPick === item.pick;

        return (
          <button
            key={item.pick}
            onClick={() => onSelect({ market: "total_goals", pick: item.pick } as any)}
            className={`py-2.5 px-3 rounded-lg border font-bold text-xs transition-all ${
              isSelected
                ? "bg-sky-500 border-sky-400 text-white shadow-glow-sky"
                : "bg-card border-border text-foreground hover:bg-secondary hover:border-sky-500/40"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function AnytimeScorerUnderPicker({
  fixture,
  selectedPick,
  onSelect,
}: {
  fixture: Fixture;
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentScorer = (selectedPick?.value as any)?.market === "anytime_scorer" ? (selectedPick?.value as any).player : "";
  const homeScorers = MOCK_SCORERS[fixture.teams.home.name] || ["Star Striker", "Winger A", "Midfielder B"];
  const awayScorers = MOCK_SCORERS[fixture.teams.away.name] || ["Top Scorer", "Forward B", "Midfielder C"];
  const allScorers = [...homeScorers, ...awayScorers];

  return (
    <div className="space-y-2 font-mono text-xs">
      <span className="text-[10px] text-muted-foreground uppercase font-bold">SELECT ANYTIME GOALSCORER (+5 PTS):</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {allScorers.map((player) => {
          const isSelected = currentScorer === player;

          return (
            <button
              key={player}
              onClick={() => onSelect({ market: "anytime_scorer", player } as any)}
              className={`py-2 px-2 rounded-lg border font-bold text-[11px] truncate transition-all ${
                isSelected
                  ? "bg-sky-500 border-sky-400 text-white shadow-glow-sky"
                  : "bg-card border-border text-foreground hover:bg-secondary hover:border-sky-500/40"
              }`}
              title={player}
            >
              ⚽ {player}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlayerCardUnderPicker({
  fixture,
  selectedPick,
  onSelect,
}: {
  fixture: Fixture;
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentCarded = (selectedPick?.value as any)?.market === "player_card" ? (selectedPick?.value as any).player : "";
  const homeCards = MOCK_CARDS[fixture.teams.home.name] || ["Enforcer Midfielder", "Center Back A"];
  const awayCards = MOCK_CARDS[fixture.teams.away.name] || ["Defensive Midfielder", "Full Back B"];
  const allCards = [...homeCards, ...awayCards];

  return (
    <div className="space-y-2 font-mono text-xs">
      <span className="text-[10px] text-muted-foreground uppercase font-bold">SELECT PLAYER TO BE CARDED (+4 PTS):</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {allCards.map((player) => {
          const isSelected = currentCarded === player;

          return (
            <button
              key={player}
              onClick={() => onSelect({ market: "player_card", player } as any)}
              className={`py-2 px-2 rounded-lg border font-bold text-[11px] truncate transition-all ${
                isSelected
                  ? "bg-yellow-500 border-yellow-400 text-slate-950 shadow-md font-black"
                  : "bg-card border-border text-foreground hover:bg-secondary hover:border-yellow-500/40"
              }`}
              title={player}
            >
              🟨 {player}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomQuestionUnderPicker({
  selectedPick,
  onSelect,
}: {
  selectedPick?: TicketPick;
  onSelect: (val: PredictionValue) => void;
}) {
  const currentAnswer = (selectedPick?.value as any)?.market === "custom_question" ? (selectedPick?.value as any).answer : "";

  return (
    <div className="p-3 rounded-lg bg-card border border-border space-y-2 font-mono text-xs">
      <div className="flex items-center gap-1.5 text-sky-500 font-bold">
        <HelpCircle className="h-4 w-4" />
        <span>CREATOR QUESTION: Will there be a Red Card in this match? (+3 PTS)</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["YES (Red Card Shown)", "NO (No Red Card)"].map((ans) => {
          const isSelected = currentAnswer === ans;

          return (
            <button
              key={ans}
              onClick={() => onSelect({ market: "custom_question", answer: ans } as any)}
              className={`py-2 px-2 rounded-lg border font-bold text-xs transition-all ${
                isSelected
                  ? "bg-sky-500 border-sky-400 text-white shadow-glow-sky"
                  : "bg-secondary border-border text-foreground hover:bg-accent"
              }`}
            >
              {ans}
            </button>
          );
        })}
      </div>
    </div>
  );
}
