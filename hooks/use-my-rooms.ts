"use client";

import { useQuery } from "@tanstack/react-query";
import type { Room } from "@/types";

export const myRoomsQueryKey = ["my-rooms"] as const;

export type MemberRoom = {
  role: "admin" | "member";
  joined_at: string;
  room: Room;
};

async function fetchMyRooms(): Promise<MemberRoom[]> {
  const res = await fetch("/api/rooms/mine");
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.error ?? "Failed to load rooms.");
  return data.rooms;
}

export function useMyRooms() {
  return useQuery<MemberRoom[], Error>({
    queryKey: myRoomsQueryKey,
    queryFn: fetchMyRooms,
    staleTime: 30 * 1000,
  });
}
