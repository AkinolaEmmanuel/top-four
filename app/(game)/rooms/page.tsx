"use client";

import Link from "next/link";
import { Loader2, Plus, LogIn, Shield, Users } from "lucide-react";
import { useMyRooms } from "@/hooks/use-my-rooms";

export default function RoomsIndexPage() {
  const { data: rooms, isLoading, isError } = useMyRooms();

  return (
    <div className="space-y-6 pb-24 md:pb-0 w-full min-w-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight font-heading"
            style={{ color: "var(--text-primary)" }}
          >
            Leagues
          </h1>
          <p
            className="mt-1 text-xs sm:text-sm font-sans"
            style={{ color: "var(--text-secondary)" }}
          >
            {rooms ? `${rooms.length} of 20 active memberships` : "Manage and view your leagues"}
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/rooms/join"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold font-heading transition-all duration-150 active:scale-95"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--surface-border-strong)",
              color: "var(--text-primary)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <LogIn className="h-3.5 w-3.5" />
            Join with a code
          </Link>
          <Link
            href="/rooms/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold font-heading transition-all duration-150 active:scale-95"
            style={{
              background: "var(--brand-fill)",
              color: "var(--color-on-brand)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create league
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-brand)]">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="mt-3 text-xs font-sans text-[var(--text-muted)]">Loading leagues...</p>
        </div>
      )}

      {isError && (
        <div
          className="rounded-xl p-5 text-center"
          style={{
            background: "var(--danger-surface)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger-text)",
          }}
        >
          <p className="text-xs font-bold font-heading">Failed to load leagues.</p>
        </div>
      )}

      {!isLoading && !isError && rooms?.length === 0 && (
        <div
          className="rounded-2xl p-8 sm:p-14 text-center max-w-lg mx-auto space-y-4"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--elev-1)",
          }}
        >
          <div
            className="h-12 w-12 rounded-full mx-auto flex items-center justify-center text-lg"
            style={{ background: "var(--surface-subtle)", color: "var(--text-muted)" }}
          >
            ◇
          </div>
          <div>
            <h3
              className="text-lg font-bold font-heading"
              style={{ color: "var(--text-primary)" }}
            >
              No leagues yet
            </h3>
            <p
              className="mt-1.5 text-xs leading-relaxed max-w-sm mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Create one for your group, or join with a code someone shared. You can be in up to twenty at once.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
            <Link
              href="/rooms/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold font-heading transition-transform active:scale-95"
              style={{ background: "var(--brand-fill)", color: "var(--color-on-brand)" }}
            >
              Create a league
            </Link>
            <Link
              href="/rooms/join"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold font-heading transition-transform active:scale-95"
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--surface-border)",
                color: "var(--text-primary)",
              }}
            >
              Join with a code
            </Link>
          </div>
        </div>
      )}

      {/* ── League Cards ── */}
      <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
        {rooms?.map(({ room, role }) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className="group relative flex flex-col justify-between rounded-xl p-4 sm:p-5 transition-all duration-150 active:scale-[0.99]"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--elev-1)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Shield Crest */}
                  <div
                    className="h-9 w-9 flex items-center justify-center font-bold text-xs font-heading shrink-0"
                    style={{
                      clipPath: "var(--crest-clip)",
                      background: "var(--brand-fill)",
                      color: "var(--color-on-brand)",
                    }}
                  >
                    {room.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3
                      className="font-bold text-sm sm:text-base font-heading group-hover:text-[var(--color-brand)] transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[11px] font-sans"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Code: <span className="font-mono font-semibold" style={{ color: "var(--text-secondary)" }}>{room.invite_code}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {role === "admin" && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase font-heading shrink-0"
                    style={{
                      background: "var(--accent-surface)",
                      color: "var(--role-admin)",
                      border: "1px solid var(--accent-border)",
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>

              {room.description && (
                <p
                  className="text-xs line-clamp-2 pt-1 font-sans"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {room.description}
                </p>
              )}
            </div>

            <div
              className="mt-3.5 pt-3 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid var(--surface-border)" }}
            >
              <span
                className="text-[11px] flex items-center gap-1.5 font-sans"
                style={{ color: "var(--text-muted)" }}
              >
                <Users className="h-3 w-3" />
                Active League
              </span>
              <span
                className="text-[11px] font-medium font-heading"
                style={{ color: "var(--color-brand)" }}
              >
                Open →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
