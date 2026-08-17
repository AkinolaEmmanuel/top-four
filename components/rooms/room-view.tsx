"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Check, Plus, Shield, Trophy, Users, HelpCircle, Award, Settings, Activity } from "lucide-react";
import { Crest } from "@/components/ui/crest";
import { AvatarDisc } from "@/components/ui/avatar-disc";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/use-room";
import { useFixtures } from "@/hooks/use-fixtures";
import { usePredictions, useSubmitPrediction } from "@/hooks/use-predictions";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useCustomQuestions, useCreateCustomQuestion, useSubmitQuestionAnswer } from "@/hooks/use-custom-questions";
import { HonorsTab } from "@/components/rooms/honors-tab";
import { AdminTab } from "@/components/rooms/admin-tab";
import type { Room, RoomRole } from "@/types";

const LEAGUE_TABS = ["Overview", "Standings", "Fixtures", "Honors", "Questions", "Rules", "Admin"] as const;
type LeagueTab = (typeof LEAGUE_TABS)[number];

export function RoomView({ roomId }: { roomId: string }) {
  const [tab, setTab] = useState<LeagueTab>("Overview");
  const { data, isLoading, isError } = useRoom(roomId);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--color-brand)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-3 text-xs font-sans text-[var(--text-muted)]">Loading league details...</p>
      </div>
    );
  }

  if (isError || !data?.room) {
    return (
      <div
        className="rounded-2xl p-8 text-center max-w-md mx-auto space-y-3"
        style={{
          background: "var(--danger-surface)",
          border: "1px solid var(--danger-border)",
          color: "var(--danger-text)",
        }}
      >
        <h3 className="font-bold text-base font-heading">League not found</h3>
        <p className="text-xs">The requested league could not be loaded.</p>
      </div>
    );
  }

  const { room, myRole } = data;
  const isGlobal = roomId === "global";
  const canManage = myRole === "owner" || myRole === "admin";

  return (
    <div className="space-y-6 pb-24 md:pb-8 w-full min-w-0 font-sans">
      {/* ── LEVEL 2 LEAGUE CHROME BAR (Desktop - App Shell.dc.html) ── */}
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Crest code={room.name.slice(0, 3)} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="text-lg sm:text-xl font-bold font-heading truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {room.name}
                </h1>
                {myRole && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase font-heading shrink-0"
                    style={{
                      background: myRole === "owner" ? "var(--warn-surface)" : "var(--accent-surface)",
                      color: myRole === "owner" ? "var(--role-owner)" : "var(--role-admin)",
                      border: myRole === "owner" ? "1px solid var(--warn-border)" : "1px solid var(--accent-border)",
                    }}
                  >
                    {myRole}
                  </span>
                )}
              </div>
              <p
                className="text-xs font-sans truncate mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {room.description || "Official TopFour Prediction League · 128 members"}
              </p>
            </div>
          </div>

          {!isGlobal && room.invite_code && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(room.invite_code);
                setCopied(true);
                toast.success("Invite code copied.");
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-heading transition-all active:scale-95 self-start sm:self-center"
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--surface-border)",
                color: "var(--text-primary)",
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
              <span className="font-mono text-[11px]">Code: {room.invite_code}</span>
            </button>
          )}
        </div>

        {/* League Nav Tabs */}
        <div
          className="flex items-center gap-1 overflow-x-auto mt-4 pt-3 border-t border-[var(--surface-border)]"
        >
          {LEAGUE_TABS.map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-heading transition-all whitespace-nowrap active:scale-95"
                style={{
                  background: isActive ? "var(--brand-fill)" : "transparent",
                  color: isActive ? "var(--color-on-brand)" : "var(--text-secondary)",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {tab === "Overview" && <OverviewTab room={room} />}
      {tab === "Standings" && <StandingsTab roomId={roomId} />}
      {tab === "Fixtures" && <FixturesTab roomId={roomId} />}
      {tab === "Honors" && <HonorsTab roomId={roomId} />}
      {tab === "Questions" && <QuestionsTab roomId={roomId} canManage={canManage} />}
      {tab === "Rules" && <RulesTab room={room} />}
      {tab === "Admin" && <AdminTab room={room} canManage={canManage} />}
    </div>
  );
}

/* ── OVERVIEW TAB (League Overview.dc.html) ── */
function OverviewTab({ room }: { room: Room }) {
  return (
    <div className="space-y-6">
      {/* Stadium Next Lock Hero */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white"
        style={{
          background: "linear-gradient(180deg, var(--pitch-bg-top) 0%, var(--pitch-bg-bottom) 100%)",
          boxShadow: "var(--elev-3)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase font-heading text-red-300">
                NEXT LOCK IN THIS LEAGUE
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase font-heading px-2 py-0.5 rounded bg-black/20 text-white/90">
              ROUND 3
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-black font-heading tabular-nums">
              2h 15m
            </span>
            <span className="text-xs text-white/70">until match result locks</span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 py-3 border-y border-white/10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Crest code="ARS" size="md" />
              <span className="font-bold text-sm sm:text-base font-heading truncate">
                Arsenal
              </span>
            </div>
            <span className="text-xs font-bold font-heading px-2 py-0.5 rounded bg-black/20 text-white/80 shrink-0">
              Today 16:30
            </span>
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              <span className="font-bold text-sm sm:text-base font-heading truncate text-right">
                Chelsea
              </span>
              <Crest code="CHE" size="md" />
            </div>
          </div>
        </div>
      </section>

      {/* Rivalry Section */}
      <section
        className="rounded-2xl p-5 sm:p-6 space-y-4"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold tracking-wider uppercase font-heading"
            style={{ color: "var(--text-muted)" }}
          >
            RIVALRY · WHO YOU ARE CHASING
          </span>
          <span className="text-xs font-bold font-heading" style={{ color: "var(--text-link)" }}>
            TABLE →
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span
            className="text-4xl font-black font-heading tabular-nums"
            style={{ color: "var(--color-brand)" }}
          >
            24
          </span>
          <div>
            <div className="font-bold text-sm font-heading" style={{ color: "var(--text-primary)" }}>
              points to catch Kolade (#1)
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              You are #4 with 1,080 pts
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── STANDINGS TAB ── */
function StandingsTab({ roomId }: { roomId: string }) {
  const { data: leaderboard, isLoading } = useLeaderboard(roomId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Loading standings...
      </div>
    );
  }

  const rows = leaderboard || [];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--elev-1)",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 sm:px-6 py-3 text-[10px] font-bold uppercase tracking-wider font-heading"
        style={{
          background: "var(--surface-subtle)",
          borderBottom: "1px solid var(--surface-border)",
          color: "var(--text-muted)",
        }}
      >
        <span className="w-8 text-center shrink-0">POS</span>
        <span className="flex-1">MEMBER</span>
        <span className="w-16 text-right shrink-0">PTS</span>
      </div>

      <div className="divide-y divide-[var(--surface-border)] text-xs">
        {rows.map((row: any, idx: number) => (
          <div
            key={row.userId || idx}
            className="flex items-center gap-3 px-4 sm:px-6 py-3.5"
          >
            <span className="w-8 text-center font-bold font-heading tabular-nums shrink-0" style={{ color: "var(--text-muted)" }}>
              #{idx + 1}
            </span>
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <AvatarDisc name={row.displayName || "Member"} id={row.userId} size="sm" />
              <span className="font-bold font-heading truncate" style={{ color: "var(--text-primary)" }}>
                {row.displayName || `Member ${idx + 1}`}
              </span>
            </div>
            <span className="w-16 text-right font-black font-heading tabular-nums shrink-0" style={{ color: "var(--text-primary)" }}>
              {row.totalPoints ?? row.points ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── FIXTURES TAB ── */
function FixturesTab({ roomId }: { roomId: string }) {
  const { data: fixtures, isLoading } = useFixtures(roomId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Loading fixtures...
      </div>
    );
  }

  const list = (fixtures || []).slice(0, 6);

  return (
    <div
      className="rounded-2xl overflow-hidden divide-y divide-[var(--surface-border)]"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--elev-1)",
      }}
    >
      {list.map((f: any) => (
        <div key={f.id} className="flex items-center justify-between p-4 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Crest code={f.homeTeam?.name?.slice(0, 3) || "HOM"} size="sm" />
            <span className="font-bold font-heading truncate" style={{ color: "var(--text-primary)" }}>
              {f.homeTeam?.name} vs {f.awayTeam?.name}
            </span>
            <Crest code={f.awayTeam?.name?.slice(0, 3) || "AWY"} size="sm" />
          </div>

          <span
            className="text-[11px] font-bold font-heading px-2 py-0.5 rounded shrink-0"
            style={{ background: "var(--surface-subtle)", color: "var(--text-secondary)" }}
          >
            {f.status === "FT" ? `${f.homeScore} - ${f.awayScore}` : "NS"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── QUESTIONS TAB ── */
function QuestionsTab({ roomId, canManage }: { roomId: string; canManage: boolean }) {
  const { data, isLoading } = useCustomQuestions(roomId);
  const [newQuestionText, setNewQuestionText] = useState("");
  const createMutation = useCreateCustomQuestion(roomId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Loading custom questions...
      </div>
    );
  }

  const questions = data?.questions || [];

  return (
    <div className="space-y-4">
      {canManage && (
        <div
          className="p-4 rounded-2xl space-y-3"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
          }}
        >
          <span className="text-[10px] font-bold uppercase font-heading" style={{ color: "var(--text-muted)" }}>
            CREATE CUSTOM QUESTION
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Who wins the Golden Boot?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs font-sans border border-[var(--surface-border)] bg-[var(--surface-subtle)]"
            />
            <button
              onClick={() => {
                if (!newQuestionText.trim()) return;
                createMutation.mutate({
                  questionText: newQuestionText.trim(),
                  type: "yes_no",
                  options: ["Yes", "No"],
                  deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
                  points: 5,
                });
                setNewQuestionText("");
                toast.success("Question created.");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold font-heading"
              style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <span className="text-[10px] font-bold uppercase font-heading" style={{ color: "var(--text-muted)" }}>
          ACTIVE QUESTIONS
        </span>
        {questions.length > 0 ? (
          <div className="divide-y divide-[var(--surface-border)]">
            {questions.map((q: any) => (
              <div key={q.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold font-heading" style={{ color: "var(--text-primary)" }}>
                    {q.question_text || q.questionText}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Worth {q.points} points
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-heading bg-emerald-500/10 text-emerald-500">
                  Open
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-secondary)]">No custom questions in this league yet.</p>
        )}
      </div>
    </div>
  );
}

/* ── RULES TAB ── */
function RulesTab({ room }: { room: Room }) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 space-y-4"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--elev-1)",
      }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider font-heading" style={{ color: "var(--text-muted)" }}>
        LEAGUE SCORING & RULES
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase font-heading">Match Result</div>
          <div className="font-black text-base font-heading mt-1" style={{ color: "var(--text-primary)" }}>
            {room.scoring_config?.match_result ?? 2} pts
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase font-heading">Exact Score</div>
          <div className="font-black text-base font-heading mt-1" style={{ color: "var(--text-primary)" }}>
            {room.scoring_config?.exact_score ?? 5} pts
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase font-heading">Both Teams To Score</div>
          <div className="font-black text-base font-heading mt-1" style={{ color: "var(--text-primary)" }}>
            {room.scoring_config?.btts ?? 1} pt
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase font-heading">Total Goals (2.5)</div>
          <div className="font-black text-base font-heading mt-1" style={{ color: "var(--text-primary)" }}>
            {room.scoring_config?.total_goals ?? 1} pt
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase font-heading">Anytime Scorer</div>
          <div className="font-black text-base font-heading mt-1" style={{ color: "var(--text-primary)" }}>
            {room.scoring_config?.anytime_scorer ?? 5} pts
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase font-heading">Lock Preset</div>
          <div className="font-black text-base font-heading mt-1" style={{ color: "var(--text-primary)" }}>
            {room.lock_preset ?? "5m"} before
          </div>
        </div>
      </div>
    </div>
  );
}
