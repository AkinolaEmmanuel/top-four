"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { useJoinRoom } from "@/hooks/use-room-actions";

export default function JoinRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinRoom = useJoinRoom();

  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
    }
  }, [initialCode]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    joinRoom.mutate(
      { code: code || "PL-PUNDITS" },
      {
        onSuccess: (room) => router.push(`/rooms/${room.id}`),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 space-y-6 font-sans">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight font-heading"
          style={{ color: "var(--text-primary)" }}
        >
          Join a league
        </h1>
        <p
          className="text-xs sm:text-sm font-sans mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          Enter the invite code shared with you to join your friends.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl p-6 shadow-elev-1"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--surface-border)",
        }}
      >
        <div className="space-y-2">
          <label
            htmlFor="code"
            className="text-[10px] font-bold uppercase font-heading block"
            style={{ color: "var(--text-muted)" }}
          >
            Invite Code
          </label>
          <input
            id="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. PP-2026"
            className="w-full h-11 px-4 rounded-xl font-mono tracking-widest text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            style={{
              background: "var(--surface-subtle)",
              border: "1px solid var(--surface-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {error && (
          <p
            className="rounded-xl px-3.5 py-2 text-xs font-bold font-heading"
            style={{
              background: "var(--danger-surface)",
              color: "var(--danger-text)",
              border: "1px solid var(--danger-border)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={joinRoom.isPending}
          className="w-full h-11 rounded-xl font-bold text-xs font-heading flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          style={{
            background: "var(--brand-fill)",
            color: "var(--color-on-brand)",
            boxShadow: "var(--elev-1)",
          }}
        >
          {joinRoom.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining league...
            </>
          ) : (
            <>
              Join league
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
