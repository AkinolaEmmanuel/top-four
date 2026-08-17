"use client";

import { useProfile } from "@/hooks/use-profile";
import { AvatarDisc } from "@/components/ui/avatar-disc";
import { Crest } from "@/components/ui/crest";
import { ChevronRight, Shield, Bell, Moon, Sun, Lock, LogOut } from "lucide-react";
import { signOut } from "@/lib/mock-auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MePage() {
  const { data: profile, isLoading } = useProfile(true);
  const router = useRouter();

  const name = profile?.displayName || "Akinola Emmanuel";
  const email = profile?.email || "akinola@example.com";
  const totalPoints = "1,080";

  // Data from Me.dc.html
  const rounds = [
    { label: "GW1", pts: 42, h: "70%" },
    { label: "GW2", pts: 38, h: "64%" },
    { label: "GW3", pts: 55, h: "92%" },
    { label: "GW4", pts: 32, h: "54%" },
    { label: "GW5", pts: 60, h: "100%" },
    { label: "GW6", pts: 48, h: "80%" },
    { label: "GW7", pts: 25, h: "42%" },
    { label: "GW8", pts: 45, h: "75%" },
    { label: "GW9", pts: 50, h: "84%" },
    { label: "GW10", pts: 52, h: "88%" },
  ];

  const leagues = [
    { name: "Premier Predictors", meta: "128 members · Gameweek 2", pts: "640 pts", code: "PP", bg: "var(--brand-fill)" },
    { name: "Office League 2026", meta: "18 members · Gameweek 2", pts: "320 pts", code: "OL", bg: "var(--tf-blue-700)" },
    { name: "Champions League Elite", meta: "42 members · Round 1", pts: "120 pts", code: "CL", bg: "var(--tf-navy-800)" },
  ];

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Sign-out failed.");
    }
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8 w-full min-w-0 font-sans">
      {/* ── PROFILE & TOTAL POINTS HEADER (Me.dc.html) ── */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex items-center gap-4">
          <AvatarDisc name={name} size="lg" className="text-base" />
          <div className="min-w-0">
            <h1
              className="text-lg sm:text-xl font-bold font-heading truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </h1>
            <p className="text-xs font-sans truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
              {email}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2.5 mt-5 pt-4 border-t border-[var(--surface-border)]">
          <span
            className="text-4xl sm:text-5xl font-black font-heading tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {totalPoints}
          </span>
          <div>
            <div className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
              points in total
            </div>
            <div className="text-[11px] font-sans" style={{ color: "var(--text-muted)" }}>
              across 3 active leagues
            </div>
          </div>
        </div>
      </div>

      {/* ── POINTS BY ROUND (Chart) ── */}
      <section
        className="rounded-2xl p-5 sm:p-6 space-y-4"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex items-baseline justify-between">
          <span
            className="text-[10px] font-bold tracking-wider uppercase font-heading"
            style={{ color: "var(--text-muted)" }}
          >
            POINTS BY ROUND
          </span>
          <span className="text-[11px] font-sans" style={{ color: "var(--text-muted)" }}>
            Last 10 Gameweeks
          </span>
        </div>

        <div className="flex items-end gap-2.5 h-28 pt-4 pb-1">
          {rounds.map((r, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
              <div
                className="w-full max-w-[24px] rounded-t-md transition-all duration-300 hover:opacity-80"
                style={{
                  height: r.h,
                  background: idx === rounds.length - 1 ? "var(--color-brand)" : "var(--surface-subtle)",
                  border: "1px solid var(--surface-border)",
                }}
                title={`${r.label}: ${r.pts} pts`}
              />
              <span className="text-[9.5px] font-heading font-bold text-[var(--text-muted)] truncate">
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHERE THEY CAME FROM ── */}
      <section className="space-y-2.5">
        <span
          className="text-[10px] font-bold tracking-wider uppercase font-heading px-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          WHERE THEY CAME FROM
        </span>

        <div
          className="rounded-2xl overflow-hidden divide-y divide-[var(--surface-border)]"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          {leagues.map((l, idx) => (
            <div key={idx} className="flex items-center gap-3.5 p-3.5 sm:p-4 text-xs">
              <Crest code={l.code} color={l.bg} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-bold font-heading truncate" style={{ color: "var(--text-primary)" }}>
                  {l.name}
                </div>
                <div className="text-[11px] font-sans truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {l.meta}
                </div>
              </div>
              <span className="font-bold font-heading tabular-nums text-sm shrink-0" style={{ color: "var(--text-primary)" }}>
                {l.pts}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACCOUNT SETTINGS & PREFERENCES ── */}
      <section className="space-y-2.5">
        <span
          className="text-[10px] font-bold tracking-wider uppercase font-heading px-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          ACCOUNT & PREFERENCES
        </span>

        <div
          className="rounded-2xl overflow-hidden divide-y divide-[var(--surface-border)]"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <div className="flex items-center justify-between p-4 text-xs">
            <div>
              <div className="font-bold font-heading" style={{ color: "var(--text-primary)" }}>
                Lock Notifications
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                Remind me 1 hour before predictions lock
              </div>
            </div>
            <span className="text-[11px] font-bold font-heading px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-4 text-xs">
            <div>
              <div className="font-bold font-heading" style={{ color: "var(--text-primary)" }}>
                Display Name
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                Visible on all league tables
              </div>
            </div>
            <span className="font-bold font-heading" style={{ color: "var(--text-secondary)" }}>
              {name}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 text-xs text-left hover:bg-[var(--danger-surface)] transition-colors"
            style={{ color: "var(--color-danger)" }}
          >
            <div className="flex items-center gap-2 font-bold font-heading">
              <LogOut className="h-4 w-4" />
              Sign Out
            </div>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>
        </div>
      </section>
    </div>
  );
}
