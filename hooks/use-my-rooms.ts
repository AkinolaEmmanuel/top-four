"use client";

import { useQuery } from "@tanstack/react-query";
import type { Room } from "@/types";

export const myRoomsQueryKey = ["my-rooms"] as const;

export type MemberRoom = {
  role: "admin" | "member";
  joined_at: string;
  room: Room;
};

import { apiFetch } from "@/lib/api/fetcher";

async function fetchMyRooms(): Promise<MemberRoom[]> {
  const data = await apiFetch<{ items: any[] }>("/leagues");
  
  // Map backend leagues to frontend MemberRooms structure
  return (data.items || []).map((item) => ({
    role: item.membership?.role === "owner" ? "admin" : item.membership?.role === "admin" ? "admin" : "member",
    joined_at: item.createdAt,
    room: {
      id: item.id,
      name: item.name,
      description: item.description,
      created_by: "",
      invite_code: "",
      is_active: item.lifecycleState !== "archived",
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      competitions: (item.competitions || []).map((c: any) => c.supportedCompetitionId),
      scope: { type: "season" },
      join_policy: "always_open",
      lock_preset: "5m",
      enabled_markets: ["match_result", "exact_score", "btts", "total_goals", "double_chance", "anytime_scorer", "player_card"],
      scoring_config: {
        match_result: 2,
        exact_score: 5,
        btts: 1,
        total_goals: 1,
        double_chance: 1,
        anytime_scorer: 5,
        player_card: 4,
        custom_question: 3,
      },
      tiebreaker_order: [],
      lonely_wolf_enabled: false,
    },
  }));
}


export function useMyRooms() {
  return useQuery<MemberRoom[], Error>({
    queryKey: myRoomsQueryKey,
    queryFn: fetchMyRooms,
    staleTime: 30 * 1000,
  });
}
