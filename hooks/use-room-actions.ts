"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JoinPolicy, LockPreset, MarketType, Room, RoomScope, ScoringConfig } from "@/types";
import { myRoomsQueryKey } from "@/hooks/use-my-rooms";

export type CreateRoomInput = {
  name: string;
  description?: string;
  competitions?: number[];
  scope?: RoomScope;
  join_policy?: JoinPolicy;
  lock_preset?: LockPreset;
  enabled_markets?: MarketType[];
  scoring_config?: ScoringConfig;
  tiebreaker_order?: MarketType[];
  lonely_wolf_enabled?: boolean;
};

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to create room.");
      return data.room as Room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myRoomsQueryKey });
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { code: string }) => {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to join room.");
      return data.room as Room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myRoomsQueryKey });
    },
  });
}

export function useTransferOwnership(roomId: string) {
  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      const res = await fetch(`/api/rooms/${roomId}/transfer-ownership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to transfer ownership.");
      return data;
    },
  });
}

export function useUpdateMemberRole(roomId: string) {
  return useMutation({
    mutationFn: async (input: { userId: string; role: "admin" | "participant" }) => {
      const res = await fetch(`/api/rooms/${roomId}/members/${input.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: input.role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to update role.");
      return data;
    },
  });
}

export function useRemoveMember(roomId: string) {
  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      const res = await fetch(`/api/rooms/${roomId}/members/${input.userId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to remove member.");
      return data;
    },
  });
}
