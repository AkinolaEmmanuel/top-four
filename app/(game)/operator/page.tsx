"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Activity, ShieldAlert, CheckCircle, Clock, RefreshCw, AlertCircle, Terminal, Layers } from "lucide-react";

export default function OperatorConsolePage() {
  const [selectedQueue, setSelectedQueue] = useState("settlement");

  const queues = [
    { id: "settlement", label: "Awaiting Settlement", count: 4 },
    { id: "locks", label: "Lock Overrides", count: 2 },
    { id: "voids", label: "Void / Postponed", count: 1 },
    { id: "sync", label: "API-Football Sync", count: 0 },
  ];

  const stats = [
    { label: "Sync Health", value: "99.8%", sub: "API-Football v3", tone: "text-emerald-500" },
    { label: "Pending Settles", value: "4", sub: "GW27 Scores", tone: "text-amber-500" },
    { label: "Active Locks", value: "12", sub: "Next at 15:00", tone: "text-sky-500" },
    { label: "System Status", value: "Healthy", sub: "Redis & DB Online", tone: "text-emerald-500" },
  ];

  const pendingFixtures = [
    { id: "101", match: "Arsenal vs Chelsea", time: "Sat 15:00", status: "FT 2-1", league: "Premier League" },
    { id: "102", match: "Man City vs Liverpool", time: "Sat 17:30", status: "FT 1-1", league: "Premier League" },
    { id: "103", match: "Real Madrid vs Barcelona", time: "Sun 20:00", status: "FT 3-2", league: "La Liga" },
    { id: "104", match: "Inter vs Milan", time: "Sun 19:45", status: "FT 0-0", league: "Serie A" },
  ];

  function handleAction(action: string, id: string) {
    toast.success(`Action "${action}" executed for fixture #${id}`);
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ── HEADER BAR (Operator Console.dc.html) ── */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading" style={{ color: "var(--text-primary)" }}>
                  Operator Console
                </h1>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-heading bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  SYSTEM ADMIN
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Manual score settling, fixture lock overrides, and sync management
              </p>
            </div>
          </div>

          <button
            onClick={() => toast.success("API-Football sync triggered.")}
            className="px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2 transition-transform active:scale-95 shrink-0"
            style={{
              background: "var(--surface-subtle)",
              border: "1px solid var(--surface-border)",
              color: "var(--text-primary)",
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 text-[var(--color-brand)]" />
            Force API Sync
          </button>
        </div>
      </div>

      {/* ── SYSTEM STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-4 space-y-1"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)]">
              {s.label}
            </span>
            <div className={`text-2xl font-black font-heading tabular-nums ${s.tone}`}>
              {s.value}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── QUEUE & ACTIONS GRID ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Queues Sidebar */}
        <div
          className="lg:col-span-4 rounded-2xl p-4 space-y-2"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)] px-1 block">
            OPERATOR QUEUES
          </span>

          <div className="space-y-1">
            {queues.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQueue(q.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-heading font-bold transition-all text-left"
                style={{
                  background: selectedQueue === q.id ? "var(--accent-surface)" : "transparent",
                  color: selectedQueue === q.id ? "var(--color-brand)" : "var(--text-primary)",
                  border: selectedQueue === q.id ? "1px solid var(--accent-border)" : "1px solid transparent",
                }}
              >
                <span>{q.label}</span>
                {q.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    {q.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fixture Queue Detail */}
        <div
          className="lg:col-span-8 rounded-2xl p-5 space-y-4"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
            <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)]">
              {queues.find((q) => q.id === selectedQueue)?.label || "Queue Items"}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Oldest first</span>
          </div>

          <div className="divide-y divide-[var(--surface-border)]">
            {pendingFixtures.map((fix) => (
              <div key={fix.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-heading text-sm text-[var(--text-primary)]">
                      {fix.match}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-heading bg-emerald-500/10 text-emerald-500">
                      {fix.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {fix.league} · {fix.time}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleAction("Settle", fix.id)}
                    className="px-3 py-1.5 rounded-xl font-bold font-heading text-[11px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                  >
                    Confirm Settle
                  </button>
                  <button
                    onClick={() => handleAction("Void", fix.id)}
                    className="px-3 py-1.5 rounded-xl font-bold font-heading text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Void Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
