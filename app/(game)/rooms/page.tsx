"use client";

import Link from "next/link";
import { Loader2, PlusCircle, LogIn } from "lucide-react";
import { useMyRooms } from "@/hooks/use-my-rooms";

export default function RoomsIndexPage() {
  const { data: rooms, isLoading, isError } = useMyRooms();

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 py-6 sm:py-8 pb-24 sm:pb-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase font-heading">Your Rooms & Clubs</h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-mono">
            ACCESS ALL YOUR PREDICTION CLUBS IN ONE TERMINAL.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
          <Link
            href="/rooms/join"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-accent active:scale-95 duration-150"
          >
            <LogIn className="h-4 w-4 text-sky-500" />
            JOIN ROOM
          </Link>
          <Link
            href="/rooms/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-sky-600 shadow-glow-sky active:scale-95 duration-150"
          >
            <PlusCircle className="h-4 w-4" />
            CREATE ROOM
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-sky-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">Loading Access Cards...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm font-bold">CRITICAL ERROR: Failed to load your rooms.</p>
        </div>
      )}

      {!isLoading && !isError && rooms?.length === 0 && (
        <div className="space-y-6">
          {/* Pending Invitation Banner */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-sky-500/40 bg-sky-500/10 p-6 sm:p-8 text-left shadow-glow-sky">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/20 px-3 py-0.5 text-[10px] font-mono font-bold text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping shrink-0" />
                  PENDING LEAGUE INVITATION
                </span>
                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-foreground uppercase font-heading">
                  Premier League Pundits Club
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans">
                  You were invited to join this public prediction league! Compete against 148 pundits across Matchday 2.
                </p>
              </div>

              <Link
                href="/rooms/join?code=PL-PUNDITS"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-xs sm:text-sm font-black text-white transition-all hover:bg-sky-600 shadow-glow-sky active:scale-95 shrink-0 w-full sm:w-auto"
              >
                ACCEPT INVITE & JOIN LEAGUE
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card p-8 sm:p-12 text-center transition-colors hover:border-sky-500/50 group">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.05),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border mb-4">
                <PlusCircle className="h-8 w-8 text-sky-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground uppercase font-heading">NO ACTIVE MEMBERSHIPS YET</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                You haven&apos;t joined any prediction clubs yet. Accept the invite above, or enter an invite code to gain access.
              </p>
              <Link
                href="/rooms/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 text-xs sm:text-sm font-black text-foreground transition-all hover:bg-accent active:scale-95"
              >
                CREATE YOUR OWN ROOM
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Room Cards Grid ── */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms?.map(({ room, role }) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all hover:border-sky-500/40 shadow-sm hover:shadow-md active:scale-[0.99] duration-150 min-h-[180px]"
          >
            {/* Foil Sweep */}
            <div className="pointer-events-none absolute inset-0 z-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-[rgba(14,165,233,0.1)] to-transparent opacity-0 transition-all duration-700 ease-in-out group-hover:translate-x-[150%] group-hover:opacity-100" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black text-lg sm:text-xl text-foreground uppercase tracking-tight line-clamp-2 font-heading">{room.name}</h3>
                {role === "admin" && (
                  <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 text-[9px] font-black tracking-widest text-sky-500 shrink-0 uppercase font-mono">
                    ADMIN
                  </span>
                )}
              </div>
              {room.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 font-sans">{room.description}</p>
              )}
            </div>

            <div className="relative z-10 mt-5 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Invite Code</span>
                <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-sky-500">{room.invite_code}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Status</span>
                <span className="text-xs font-black text-foreground uppercase flex items-center gap-1.5 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ACTIVE
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
