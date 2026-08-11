"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase font-heading">
            Join a Prediction Group
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">
          Enter the invite code shared in your WhatsApp or Telegram group chat.
        </p>
      </div>

      {/* Featured Invite Link Preview Card if URL parameter is present */}
      {code && (
        <div className="rounded-2xl border-2 border-sky-500/40 bg-sky-500/10 p-5 space-y-3 shadow-glow-sky">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              INVITATION DETECTED
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">CODE: {code}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground font-heading">
              {code.includes("ELITE") ? "Champions League Elite Pundits" : "Premier League Pundits Club"}
            </h3>
            <p className="text-xs text-muted-foreground font-sans">
              Invited by <span className="text-foreground font-bold">Dave_Gooner99</span> • 148 Active Predictors
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-xs font-bold uppercase text-foreground">Invite Code</Label>
          <Input
            id="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="E.g. PL-PUNDITS"
            className="h-12 font-mono tracking-widest text-lg font-bold bg-background text-foreground"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={joinRoom.isPending}
          className="w-full h-12 bg-sky-500 hover:bg-sky-600 font-bold text-white shadow-glow-sky active:scale-95 transition-transform"
        >
          {joinRoom.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              JOINING GROUP...
            </>
          ) : (
            <>
              JOIN GROUP NOW
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
