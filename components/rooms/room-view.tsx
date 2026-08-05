"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHALK, ERROR_RED } from "@/lib/brand/colors";
import { useRoom } from "@/hooks/use-room";
import { useFixtures } from "@/hooks/use-fixtures";
import { usePredictions, useSubmitPrediction } from "@/hooks/use-predictions";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAwardPicks, useSubmitAwardPick } from "@/hooks/use-award-picks";
import { useCustomQuestions, useCreateCustomQuestion, useSubmitQuestionAnswer, useSettleQuestion } from "@/hooks/use-custom-questions";
import { useTotalGoalsLines, useSetTotalGoalsLine } from "@/hooks/use-total-goals-line";
import { gradePrediction, gradeCustomQuestionAnswer, getSettlementStatus } from "@/lib/predictions/scoring";
import type { Fixture } from "@/lib/api-football/types";
import type { AwardCategory, CustomQuestion, CustomQuestionType, MarketType, Prediction, PredictionValue, Room } from "@/types";
import { MARKET_LABELS } from "@/types";

import { CollectibleReceiptTicket, type TicketPick } from "@/components/gamification/CollectibleReceiptTicket";

const TABS = ["Lobby", "Board", "Vault", "Questions", "Awards"] as const;
type Tab = (typeof TABS)[number];

export function RoomView({ roomId }: { roomId: string }) {
  const [tab, setTab] = useState<Tab>("Lobby");
  const { data, isLoading } = useRoom(roomId);

  if (isLoading) return <LoadingState />;
  if (!data?.room) return null;

  const { room, myRole } = data;
  const canManage = myRole === "owner" || myRole === "admin";

  return (
    <div className="space-y-6">
      <RoomHeader room={room} roomId={roomId} myRole={myRole} />

      <div className="flex gap-1 overflow-x-auto border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all",
              tab === t
                ? "border-sky-500 text-sky-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Lobby" && <LobbyTab roomId={roomId} room={room} canManage={canManage} />}
      {tab === "Board" && <BoardTab roomId={roomId} />}
      {tab === "Vault" && <VaultTab roomId={roomId} room={room} />}
      {tab === "Questions" && <QuestionsTab roomId={roomId} canManage={canManage} />}
      {tab === "Awards" && <AwardsTab roomId={roomId} />}
    </div>
  );
}

function RoomHeader({ room, roomId, myRole }: { room: Room; roomId: string; myRole?: string }) {
  const [copied, setCopied] = useState(false);
  const isGlobal = roomId === "global";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">{room.name}</h1>
          {myRole && myRole !== "participant" && (
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border",
              myRole === "owner" ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-sky-500/40 bg-sky-500/10 text-sky-400"
            )}>
              {myRole}
            </span>
          )}
        </div>
        {room.description && <p className="mt-1 text-sm text-slate-400">{room.description}</p>}
      </div>
      {!isGlobal && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(room.invite_code);
            setCopied(true);
            toast.success("Invite code copied.");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
          <span className="font-mono">{room.invite_code}</span>
        </button>
      )}
    </div>
  );
}

// ── Lobby ─────────────────────────────────────────────────────────────────

function LobbyTab({ roomId, room, canManage }: { roomId: string; room: Room; canManage: boolean }) {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures(roomId);
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(roomId);
  const { data: totalGoalsLines } = useTotalGoalsLines(roomId);
  const submit = useSubmitPrediction(roomId);
  const setLine = useSetTotalGoalsLine(roomId);

  if (fixturesLoading || predictionsLoading) return <LoadingState />;
  if (!fixtures || fixtures.length === 0) {
    return <EmptyState text="No open fixtures right now. Check back closer to kickoff." />;
  }

  const lineByFixture = new Map((totalGoalsLines ?? []).map((l) => [l.fixture_id, l.line]));
  
  // Transform predictions to TicketPicks for the Receipt Gamification Component
  const receiptPicks: TicketPick[] = (predictions ?? []).map((p) => {
    const fixture = fixtures.find((f) => f.id === p.fixture_id);
    return {
      fixtureId: p.fixture_id,
      homeTeam: fixture ? fixture.teams.home.name : "HOME",
      awayTeam: fixture ? fixture.teams.away.name : "AWAY",
      pickType: p.market,
      value: p.value,
      points: room.scoring_config[p.market] ?? 0,
    };
  });

  return (
    <div className="grid lg:grid-cols-[1fr,380px] gap-8 items-start">
      <div className="space-y-4">
        {fixtures.map((fixture) => (
          <FixtureCard
            key={fixture.id}
            fixture={fixture}
            room={room}
            predictions={predictions ?? []}
            line={lineByFixture.get(fixture.id)}
            canManage={canManage}
            pending={submit.isPending}
            onSubmit={(market, value) =>
              submit.mutate(
                { fixtureId: fixture.id, market, value },
                { onSuccess: () => toast.success("Prediction locked in."), onError: (err) => toast.error(err.message) }
              )
            }
            onSetLine={(line) =>
              setLine.mutate(
                { fixtureId: fixture.id, line },
                { onSuccess: () => toast.success("Line set."), onError: (err) => toast.error(err.message) }
              )
            }
          />
        ))}
      </div>
      
      {/* Receipt Column */}
      <div className="sticky top-24 hidden lg:block">
        <CollectibleReceiptTicket 
          picks={receiptPicks}
          ticketNumber={`RCPT-${roomId.slice(0, 4).toUpperCase()}`}
          status={receiptPicks.length > 0 ? "locked" : "draft"}
        />
      </div>
    </div>
  );
}

function FixtureCard({
  fixture,
  room,
  predictions,
  line,
  canManage,
  pending,
  onSubmit,
  onSetLine,
}: {
  fixture: Fixture;
  room: Room;
  predictions: Prediction[];
  line: number | undefined;
  canManage: boolean;
  pending: boolean;
  onSubmit: (market: MarketType, value: PredictionValue) => void;
  onSetLine: (line: number) => void;
}) {
  const existing = (market: MarketType) => predictions.find((p) => p.fixture_id === fixture.id && p.market === market);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {fixture.teams.home.name} vs {fixture.teams.away.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {fixture.league.name} · {fixture.round} ·{" "}
          {new Date(fixture.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {room.enabled_markets.includes("match_result") && (
          <MatchResultRow existing={existing("match_result")} pending={pending} onSubmit={(v) => onSubmit("match_result", v)} />
        )}
        {room.enabled_markets.includes("exact_score") && (
          <ExactScoreRow existing={existing("exact_score")} pending={pending} onSubmit={(v) => onSubmit("exact_score", v)} />
        )}
        {room.enabled_markets.includes("btts") && (
          <BttsRow existing={existing("btts")} pending={pending} onSubmit={(v) => onSubmit("btts", v)} />
        )}
        {room.enabled_markets.includes("total_goals") && (
          <TotalGoalsRow
            existing={existing("total_goals")}
            line={line}
            canManage={canManage}
            pending={pending}
            onSubmit={(v) => onSubmit("total_goals", v)}
            onSetLine={onSetLine}
          />
        )}
      </div>
    </div>
  );
}

function MarketRowShell({ label, children, onLockIn, pending }: { label: string; children: React.ReactNode; onLockIn: () => void; pending: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/[0.15] px-3 py-2">
      <span className="w-32 shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center gap-2">{children}</div>
      <Button size="sm" onClick={onLockIn} disabled={pending}>
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        LOCK IT IN
      </Button>
    </div>
  );
}

function MatchResultRow({ existing, pending, onSubmit }: { existing: Prediction | undefined; pending: boolean; onSubmit: (v: { market: "match_result"; pick: "home" | "draw" | "away" }) => void }) {
  const [pick, setPick] = useState<"home" | "draw" | "away">(
    existing?.value.market === "match_result" ? existing.value.pick : "home"
  );

  return (
    <MarketRowShell label={MARKET_LABELS.match_result} pending={pending} onLockIn={() => onSubmit({ market: "match_result", pick })}>
      {(["home", "draw", "away"] as const).map((option) => (
        <button
          key={option}
          onClick={() => setPick(option)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-bold uppercase transition-colors",
            pick === option ? "bg-primary text-primary-foreground" : "bg-black/20 text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </MarketRowShell>
  );
}

function ExactScoreRow({ existing, pending, onSubmit }: { existing: Prediction | undefined; pending: boolean; onSubmit: (v: { market: "exact_score"; home: number; away: number }) => void }) {
  const [home, setHome] = useState(existing?.value.market === "exact_score" ? existing.value.home : 0);
  const [away, setAway] = useState(existing?.value.market === "exact_score" ? existing.value.away : 0);

  return (
    <MarketRowShell label={MARKET_LABELS.exact_score} pending={pending} onLockIn={() => onSubmit({ market: "exact_score", home, away })}>
      <ScoreInput value={home} onChange={setHome} />
      <span className="text-muted-foreground">–</span>
      <ScoreInput value={away} onChange={setAway} />
    </MarketRowShell>
  );
}

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      className="h-8 w-11 rounded-md border border-input bg-background text-center font-mono text-sm font-bold text-foreground"
    />
  );
}

function BttsRow({ existing, pending, onSubmit }: { existing: Prediction | undefined; pending: boolean; onSubmit: (v: { market: "btts"; pick: boolean }) => void }) {
  const initialPick = existing?.value.market === "btts" ? (typeof existing.value.pick === "boolean" ? existing.value.pick : existing.value.pick === "yes") : true;
  const [pick, setPick] = useState<boolean>(initialPick);

  return (
    <MarketRowShell label={MARKET_LABELS.btts} pending={pending} onLockIn={() => onSubmit({ market: "btts", pick })}>
      {[true, false].map((option) => (
        <button
          key={String(option)}
          onClick={() => setPick(option)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-bold uppercase transition-colors",
            pick === option ? "bg-primary text-primary-foreground" : "bg-black/20 text-muted-foreground hover:text-foreground"
          )}
        >
          {option ? "Yes" : "No"}
        </button>
      ))}
    </MarketRowShell>
  );
}

function TotalGoalsRow({
  existing,
  line,
  canManage,
  pending,
  onSubmit,
  onSetLine,
}: {
  existing: Prediction | undefined;
  line: number | undefined;
  canManage: boolean;
  pending: boolean;
  onSubmit: (v: { market: "total_goals"; pick: "over" | "under" }) => void;
  onSetLine: (line: number) => void;
}) {
  const [pick, setPick] = useState<"over" | "under">(existing?.value.market === "total_goals" ? existing.value.pick : "over");
  const [draftLine, setDraftLine] = useState("2.5");

  if (line === undefined) {
    if (!canManage) {
      return (
        <div className="rounded-lg bg-black/[0.15] px-3 py-2 text-xs text-muted-foreground">
          {MARKET_LABELS.total_goals} — line not set yet.
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-lg bg-black/[0.15] px-3 py-2">
        <span className="w-32 shrink-0 text-xs font-semibold text-muted-foreground">{MARKET_LABELS.total_goals}</span>
        <input
          type="number"
          step="0.5"
          min={0}
          value={draftLine}
          onChange={(e) => setDraftLine(e.target.value)}
          className="h-8 w-16 rounded-md border border-input bg-background px-2 text-center font-mono text-sm text-foreground"
        />
        <Button size="sm" variant="outline" onClick={() => onSetLine(Number(draftLine))}>
          Set line
        </Button>
      </div>
    );
  }

  return (
    <MarketRowShell label={`${MARKET_LABELS.total_goals} (${line})`} pending={pending} onLockIn={() => onSubmit({ market: "total_goals", pick })}>
      {(["over", "under"] as const).map((option) => (
        <button
          key={option}
          onClick={() => setPick(option)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-bold uppercase transition-colors",
            pick === option ? "bg-primary text-primary-foreground" : "bg-black/20 text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </MarketRowShell>
  );
}

// ── Vault ─────────────────────────────────────────────────────────────────

function VaultTab({ roomId, room }: { roomId: string; room: Room }) {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures(roomId);
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(roomId);
  const { data: totalGoalsLines } = useTotalGoalsLines(roomId);

  if (fixturesLoading || predictionsLoading) return <LoadingState />;

  const lineByFixture = new Map((totalGoalsLines ?? []).map((l) => [l.fixture_id, l.line]));

  const entries = (predictions ?? [])
    .map((prediction) => ({ prediction, fixture: fixtures?.find((f) => f.id === prediction.fixture_id) }))
    .filter((entry): entry is { prediction: Prediction; fixture: Fixture } => Boolean(entry.fixture) && entry.fixture!.status !== "NS");

  if (entries.length === 0) {
    return <EmptyState text="Nothing locked away yet. Predictions land here once a fixture kicks off." />;
  }

  return (
    <div className="space-y-3">
      {entries.map(({ prediction, fixture }) => (
        <VaultRow
          key={prediction.id}
          prediction={prediction}
          fixture={fixture}
          points={room.scoring_config[prediction.market]}
          totalGoalsLine={lineByFixture.get(fixture.id)}
        />
      ))}
    </div>
  );
}

function describePredictionValue(prediction: Prediction): string {
  const v = prediction.value as any;
  switch (v.market) {
    case "match_result":
      return `Predicted ${v.pick.toUpperCase()}`;
    case "exact_score":
      return `Predicted ${v.home}–${v.away}`;
    case "btts":
      return `Predicted BTTS: ${v.pick === "yes" || v.pick === true ? "Yes" : "No"}`;
    case "total_goals":
      return `Predicted ${v.pick.toUpperCase()}`;
    case "double_chance":
      return `Predicted Double Chance: ${v.pick}`;
    default:
      return "Predicted";
  }
}

function VaultRow({
  prediction,
  fixture,
  points,
  totalGoalsLine,
}: {
  prediction: Prediction;
  fixture: Fixture;
  points: number;
  totalGoalsLine: number | undefined;
}) {
  const { grade, points: earned } = gradePrediction(prediction, fixture, points, totalGoalsLine);
  const settlement = getSettlementStatus(fixture);

  const badge =
    grade === "pending"
      ? { text: "🔒 RECEIPT LOCKED", color: undefined }
      : grade === "correct"
        ? { text: `${MARKET_LABELS[prediction.market].toUpperCase()} — CORRECT (+${earned} PTS)`, color: CHALK }
        : { text: `${MARKET_LABELS[prediction.market].toUpperCase()} — INCORRECT (0 PTS)`, color: ERROR_RED };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {fixture.teams.home.name} vs {fixture.teams.away.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {describePredictionValue(prediction)}
          {fixture.score.fulltime.home != null && ` · Final (90'): ${fixture.score.fulltime.home}–${fixture.score.fulltime.away}`}
          {grade !== "pending" && settlement === "provisional" && " · Provisional"}
        </p>
      </div>
      <span
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
        style={{
          backgroundColor: badge.color ? `${badge.color}22` : "hsl(var(--muted))",
          color: badge.color ?? "hsl(var(--muted-foreground))",
        }}
      >
        {grade === "pending" && <Lock className="h-3 w-3" />}
        {badge.text}
      </span>
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────

function BoardTab({ roomId }: { roomId: string }) {
  const { data: leaderboard, isLoading } = useLeaderboard(roomId);

  if (isLoading) return <LoadingState />;
  if (!leaderboard || leaderboard.length === 0) {
    return <EmptyState text="SYSTEM BOOTING... WAITING FOR PLAYERS" />;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-4 border-[#222] bg-[#0A0A0A] p-6 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] opacity-50" />
      
      {/* Glare effect */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

      <div className="relative z-30">
        <div className="mb-8 text-center border-b-2 border-[#00FF66]/20 pb-4">
          <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-[#00FF66] animate-pulse drop-shadow-[0_0_15px_rgba(0,255,102,0.8)]">
            HIGH SCORES
          </h2>
          <p className="mt-2 text-xs font-mono font-bold tracking-widest text-[#00FF66]/60">
            CURRENT STANDINGS • INSERT COIN TO JOIN
          </p>
        </div>

        <div className="w-full">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-[#00FF66]/20 text-left text-[10px] font-black uppercase tracking-widest text-[#00FF66]/50">
                <th className="px-4 py-3 w-16">RANK</th>
                <th className="px-4 py-3">PLAYER ID</th>
                <th className="px-4 py-3 text-right">SCORE (PTS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FF66]/10">
              {leaderboard.map((row, i) => {
                const tied = leaderboard.filter((r) => r.rank === row.rank).length > 1;
                const isTop3 = row.rank <= 3;
                return (
                  <tr 
                    key={row.userId}
                    className={cn(
                      "transition-colors hover:bg-[#00FF66]/5",
                      row.rank === 1 && "bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.15),transparent)]"
                    )}
                  >
                    <td className="px-4 py-4 text-lg font-black">
                      <span className={cn(
                        "inline-block min-w-[28px] text-center",
                        row.rank === 1 ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" :
                        row.rank === 2 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]" :
                        row.rank === 3 ? "text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.6)]" :
                        "text-[#00FF66]/70"
                      )}>
                        {tied && "="}{row.rank}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-base font-bold uppercase tracking-wider",
                        isTop3 ? "text-white" : "text-white/70"
                      )}>
                        {row.displayName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={cn(
                        "text-xl font-black tracking-widest",
                        row.rank === 1 ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" : "text-[#00FF66]"
                      )}>
                        {String(row.points).padStart(4, '0')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[#00FF66]/40 text-[10px] font-bold tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] animate-ping" />
          SYSTEM ONLINE • NETWORK SYNCED
        </div>
      </div>
    </div>
  );
}

// ── Questions ─────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<CustomQuestionType, string> = {
  yes_no: "Yes / No",
  true_false: "True / False",
  options: "Multiple choice",
  open_text: "Open text",
};

function QuestionsTab({ roomId, canManage }: { roomId: string; canManage: boolean }) {
  const { data, isLoading } = useCustomQuestions(roomId);
  const [showNewForm, setShowNewForm] = useState(false);

  if (isLoading) return <LoadingState />;

  const questions = data?.questions ?? [];
  const myAnswers = data?.myAnswers ?? {};

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setShowNewForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            New question
          </Button>
        </div>
      )}
      {showNewForm && <NewQuestionForm roomId={roomId} onDone={() => setShowNewForm(false)} />}

      {questions.length === 0 && !showNewForm && <EmptyState text="No custom questions yet." />}

      {questions.map((question) => (
        <QuestionCard key={question.id} roomId={roomId} question={question} myAnswer={myAnswers[question.id]} canManage={canManage} />
      ))}
    </div>
  );
}

function QuestionCard({
  roomId,
  question,
  myAnswer,
  canManage,
}: {
  roomId: string;
  question: CustomQuestion;
  myAnswer: string | undefined;
  canManage: boolean;
}) {
  const submitAnswer = useSubmitQuestionAnswer(roomId);
  const settle = useSettleQuestion(roomId);
  const [draftAnswer, setDraftAnswer] = useState(myAnswer ?? "");
  const [settleInput, setSettleInput] = useState("");

  const deadlinePassed = new Date() > new Date(question.deadline);
  const isSettled = question.correct_answer !== null;
  const myGrade = isSettled && myAnswer ? gradeCustomQuestionAnswer({ id: "", question_id: question.id, user_id: "", answer: myAnswer, submitted_at: "" }, question) : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{question.question_text}</p>
          {question.context && <p className="mt-1 text-xs text-muted-foreground">{question.context}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {QUESTION_TYPE_LABELS[question.type]} · {question.points} pts · Deadline{" "}
            {new Date(question.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        </div>
        {isSettled && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">Settled</span>
        )}
      </div>

      {isSettled ? (
        <div className="mt-3 text-sm">
          <p className="text-muted-foreground">
            Accepted: <span className="font-semibold text-foreground">{question.correct_answer!.join(", ")}</span>
          </p>
          {myAnswer && (
            <p className="mt-1 font-semibold" style={{ color: myGrade?.grade === "correct" ? CHALK : ERROR_RED }}>
              Your answer &ldquo;{myAnswer}&rdquo; was {myGrade?.grade === "correct" ? `correct (+${question.points} pts)` : "incorrect"}.
            </p>
          )}
        </div>
      ) : deadlinePassed ? (
        canManage ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={settleInput}
              onChange={(e) => setSettleInput(e.target.value)}
              placeholder="Accepted answer(s), comma-separated"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <Button
              size="sm"
              onClick={() =>
                settle.mutate(
                  { questionId: question.id, correctAnswers: settleInput.split(",").map((a) => a.trim()).filter(Boolean) },
                  { onSuccess: () => toast.success("Question settled."), onError: (err) => toast.error(err.message) }
                )
              }
              disabled={!settleInput.trim() || settle.isPending}
            >
              Settle
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">🔒 Deadline passed — awaiting settlement.</p>
        )
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <QuestionAnswerInput question={question} value={draftAnswer} onChange={setDraftAnswer} />
          <Button
            size="sm"
            onClick={() =>
              submitAnswer.mutate(
                { questionId: question.id, answer: draftAnswer },
                { onSuccess: () => toast.success("Answer saved."), onError: (err) => toast.error(err.message) }
              )
            }
            disabled={!draftAnswer.trim() || submitAnswer.isPending}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

function QuestionAnswerInput({ question, value, onChange }: { question: CustomQuestion; value: string; onChange: (v: string) => void }) {
  if (question.type === "yes_no" || question.type === "true_false") {
    const options = question.type === "yes_no" ? ["yes", "no"] : ["true", "false"];
    return (
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-bold uppercase transition-colors",
              value === option ? "bg-primary text-primary-foreground" : "bg-black/20 text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "options" && question.options) {
    return (
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              value === option ? "bg-primary text-primary-foreground" : "bg-black/20 text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
    />
  );
}

function NewQuestionForm({ roomId, onDone }: { roomId: string; onDone: () => void }) {
  const create = useCreateCustomQuestion(roomId);
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState<CustomQuestionType>("yes_no");
  const [options, setOptions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [points, setPoints] = useState(3);
  const [context, setContext] = useState("");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Question text"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground sm:col-span-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CustomQuestionType)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          {(Object.keys(QUESTION_TYPE_LABELS) as CustomQuestionType[]).map((t) => (
            <option key={t} value={t}>
              {QUESTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={50}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          placeholder="Points (1-50)"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        />
        {type === "options" && (
          <input
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Options, comma-separated"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground sm:col-span-2"
          />
        )}
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        />
        <input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Context (optional)"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!questionText.trim() || !deadline || create.isPending}
          onClick={() =>
            create.mutate(
              {
                questionText,
                type,
                options: type === "options" ? options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
                deadline: new Date(deadline).toISOString(),
                points,
                context: context || undefined,
              },
              { onSuccess: () => { toast.success("Question created."); onDone(); }, onError: (err) => toast.error(err.message) }
            )
          }
        >
          Create
        </Button>
      </div>
    </div>
  );
}

// ── Awards (unchanged — Phase 2 will formalize Golden Boot as a real market) ──

const AWARD_LABELS: Record<AwardCategory, string> = {
  golden_boot: "Golden Boot",
  golden_ball: "Golden Ball",
  golden_glove: "Golden Glove",
  young_player: "Young Player",
};

function getCountdownLabel(fixtures: Fixture[] | undefined): string | null {
  if (!fixtures || fixtures.length === 0) return null;
  const earliest = fixtures.reduce((min, f) => (new Date(f.date) < new Date(min.date) ? f : min));
  const diffMs = new Date(earliest.date).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

function AwardsTab({ roomId }: { roomId: string }) {
  const { data: picks } = useAwardPicks(roomId);
  const { data: fixtures } = useFixtures(roomId);
  const submit = useSubmitAwardPick(roomId);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const lockLabel = getCountdownLabel(fixtures);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">Tournament Honors</h3>
        {lockLabel && (
          <span className="text-xs font-semibold text-muted-foreground">Locks in {lockLabel}</span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {(Object.keys(AWARD_LABELS) as AwardCategory[]).map((award) => {
          const existing = picks?.find((p) => p.award === award);
          const value = drafts[award] ?? existing?.player_name ?? "";

          return (
            <div key={award}>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {AWARD_LABELS[award]}
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={value}
                  onChange={(e) => setDrafts((d) => ({ ...d, [award]: e.target.value }))}
                  placeholder="Player name"
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  size="sm"
                  disabled={!value || submit.isPending}
                  onClick={() =>
                    submit.mutate(
                      { award, playerName: value },
                      {
                        onSuccess: () => toast.success(`${AWARD_LABELS[award]} pick locked in.`),
                        onError: (err) => toast.error(err.message),
                      }
                    )
                  }
                >
                  Save
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
