"use client";

import Link from "next/link";
import { Loader2, PlusCircle, LogIn } from "lucide-react";
import { useMyRooms } from "@/hooks/use-my-rooms";

export default function RoomsIndexPage() {
  const { data: rooms, isLoading, isError } = useMyRooms();

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Your Rooms</h1>
          </div>
          <p className="mt-2 text-sm text-white/60 font-mono">
            ACCESS ALL YOUR PREDICTION CLUBS IN ONE TERMINAL.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/rooms/join"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-card px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-white/40"
          >
            <LogIn className="h-4 w-4" />
            JOIN ROOM
          </Link>
          <Link
            href="/rooms/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-black transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
          >
            <PlusCircle className="h-4 w-4" />
            CREATE ROOM
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-xs font-mono font-bold tracking-widest text-primary/80 uppercase">Loading Access Cards...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm font-bold">CRITICAL ERROR: Failed to load your rooms.</p>
        </div>
      )}

      {!isLoading && !isError && rooms?.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-card p-12 text-center transition-colors hover:border-primary/50 group">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.05),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
              <PlusCircle className="h-8 w-8 text-white/40" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase">NO ACTIVE MEMBERSHIPS</h3>
            <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">
              You haven&apos;t joined any prediction clubs yet. Create your own group chat, or enter an invite code to gain access.
            </p>
            <Link
              href="/rooms/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,255,102,0.4)]"
            >
              INITIALIZE NEW ROOM
            </Link>
          </div>
        </div>
      )}

      {/* ── Room Cards Grid ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms?.map(({ room, role }) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-6 transition-all hover:scale-[1.02] hover:border-primary/40 shadow-xl hover:shadow-[0_8px_30px_rgba(0,255,102,0.15)] min-h-[180px]"
          >
            {/* Foil Sweep */}
            <div className="pointer-events-none absolute inset-0 z-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-[rgba(0,255,102,0.1)] to-transparent opacity-0 transition-all duration-700 ease-in-out group-hover:translate-x-[150%] group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <h3 className="font-black text-xl text-white uppercase tracking-tight line-clamp-2">{room.name}</h3>
                {role === "admin" && (
                  <span className="rounded-full bg-primary/20 border border-primary/30 px-2.5 py-1 text-[9px] font-black tracking-widest text-primary shrink-0 uppercase">
                    ADMIN
                  </span>
                )}
              </div>
              {room.description && (
                <p className="mt-2 text-sm text-white/60 line-clamp-2">{room.description}</p>
              )}
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase">Invite Code</span>
                <span className="text-sm font-mono font-bold tracking-widest text-primary">{room.invite_code}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-white/40 uppercase">Status</span>
                <span className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66]" />
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
