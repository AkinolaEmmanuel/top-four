"use client";

import { useQuery } from "@tanstack/react-query";
import type { Room, RoomRole } from "@/types";

export const roomQueryKey = (roomId: string) => ["room", roomId] as const;

export type RoomWithRole = { room: Room; myRole: RoomRole | undefined };

async function fetchRoom(roomId: string): Promise<RoomWithRole> {
  const res = await fetch(`/api/rooms/${roomId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Failed to load room.");
  return { room: data.room, myRole: data.myRole };
}

export function useRoom(roomId: string) {
  return useQuery<RoomWithRole, Error>({
    queryKey: roomQueryKey(roomId),
    queryFn: () => fetchRoom(roomId),
  });
}
