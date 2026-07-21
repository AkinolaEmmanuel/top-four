"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJoinRoom } from "@/hooks/use-room-actions";

export default function JoinRoomPage() {
  const router = useRouter();
  const joinRoom = useJoinRoom();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    joinRoom.mutate(
      { code },
      {
        onSuccess: (room) => router.push(`/dashboard/rooms/${room.id}`),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Join a room</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the invite code your group chat shared.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="code">Invite code</Label>
          <Input
            id="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="4F92XQ"
            className="font-mono tracking-widest"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={joinRoom.isPending}>
          {joinRoom.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Join room
        </Button>
      </form>
    </div>
  );
}
