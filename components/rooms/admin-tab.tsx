"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Shield, Copy, RefreshCw, Trash2, AlertTriangle, Check, Crown, UserMinus } from "lucide-react";
import type { Room } from "@/types";
import { AvatarDisc } from "@/components/ui/avatar-disc";

export function AdminTab({ room, canManage }: { room: Room; canManage: boolean }) {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description || "");
  const [lonelyWolf, setLonelyWolf] = useState(room.lonely_wolf_enabled || false);
  const [inviteCode, setInviteCode] = useState(room.invite_code);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const mockMembers = [
    { id: "1", name: "Akinola Emmanuel", role: "owner", pts: "1,080" },
    { id: "2", name: "Kolade Pundit", role: "admin", pts: "1,056" },
    { id: "3", name: "Dave Gooner", role: "member", pts: "980" },
    { id: "4", name: "Sarah Striker", role: "member", pts: "940" },
  ];

  function handleSaveSettings() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("League settings updated.");
    }, 600);
  }

  function handleRegenerateCode() {
    const newCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    setInviteCode(newCode);
    toast.success("New invite code generated.");
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── LEAGUE INFORMATION & RULES ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-4"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-wider uppercase font-heading block"
          style={{ color: "var(--text-muted)" }}
        >
          LEAGUE INFORMATION
        </span>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase font-heading block text-[var(--text-muted)]">
            League Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl text-xs font-bold font-heading border border-[var(--surface-border)] bg-[var(--surface-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase font-heading block text-[var(--text-muted)]">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl text-xs font-sans border border-[var(--surface-border)] bg-[var(--surface-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-subtle)]">
          <div>
            <div className="font-bold text-xs font-heading" style={{ color: "var(--text-primary)" }}>
              Lonely Wolf Bonus Mode
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Reward managers who correctly pick solo exact scores (+5 pts bonus)
            </div>
          </div>
          <button
            onClick={() => setLonelyWolf(!lonelyWolf)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              lonelyWolf ? "bg-[var(--color-brand)]" : "bg-[var(--surface-border-strong)]"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                lonelyWolf ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl font-bold text-xs font-heading flex items-center justify-center gap-2"
          style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ── INVITATION CODE MANAGEMENT ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-3"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)]">
          INVITATION CODE
        </span>
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--surface-border)]">
          <span className="font-mono text-sm font-bold tracking-wider">{inviteCode}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteCode);
                setCopied(true);
                toast.success("Invite code copied.");
                setTimeout(() => setCopied(false), 1500);
              }}
              className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs font-bold font-heading"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleRegenerateCode}
              className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs font-bold font-heading"
              title="Reset code"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MEMBER MANAGEMENT ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-4"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase font-heading text-[var(--text-muted)]">
            MEMBERS ({mockMembers.length})
          </span>
        </div>

        <div className="divide-y divide-[var(--surface-border)]">
          {mockMembers.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AvatarDisc name={m.name} size="sm" />
                <div>
                  <div className="font-bold font-heading" style={{ color: "var(--text-primary)" }}>
                    {m.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">{m.pts} pts</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-heading"
                  style={{
                    background: m.role === "owner" ? "var(--warn-surface)" : "var(--accent-surface)",
                    color: m.role === "owner" ? "var(--role-owner)" : "var(--role-admin)",
                  }}
                >
                  {m.role}
                </span>
                {m.role !== "owner" && (
                  <button
                    onClick={() => toast.success(`Removed ${m.name}`)}
                    className="p-1.5 rounded-lg hover:bg-[var(--danger-surface)] text-[var(--text-muted)] hover:text-[var(--danger-text)] transition-colors"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DANGER ZONE ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-3"
        style={{
          background: "var(--danger-surface)",
          border: "1px solid var(--danger-border)",
          color: "var(--danger-text)",
        }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--color-danger)]" />
          <h4 className="font-bold text-xs font-heading">DANGER ZONE</h4>
        </div>
        <p className="text-xs">
          Deleting a league permanently erases all predictions, leaderboards, and custom questions.
        </p>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this league? This cannot be undone.")) {
              toast.error("League deleted.");
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold font-heading bg-[var(--color-danger)] text-white"
        >
          Delete League Permanently
        </button>
      </div>
    </div>
  );
}
