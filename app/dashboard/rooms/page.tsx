"use client";

import Link from "next/link";
import { Loader2, PlusCircle, LogIn } from "lucide-react";
import { useMyRooms } from "@/hooks/use-my-rooms";

export default function RoomsIndexPage() {
  const { data: rooms, isLoading, isError } = useMyRooms();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Rooms</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every room you&apos;re in, in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/rooms/join"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <LogIn className="h-4 w-4" />
            Join a room
          </Link>
          <Link
            href="/dashboard/rooms/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Create a room
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Failed to load your rooms.</p>}

      {!isLoading && !isError && rooms?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;re not in any rooms yet. Create one for your group chat, or join with an invite code.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms?.map(({ room, role }) => (
          <Link
            key={room.id}
            href={`/dashboard/rooms/${room.id}`}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between">
              <p className="font-semibold text-foreground">{room.name}</p>
              {role === "admin" && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  admin
                </span>
              )}
            </div>
            {room.description && (
              <p className="mt-1.5 text-sm text-muted-foreground">{room.description}</p>
            )}
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Invite: {room.invite_code}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
