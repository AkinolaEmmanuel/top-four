"use client";

import { useQuery } from "@tanstack/react-query";
import type { Room, RoomRole } from "@/types";
import { apiFetch } from "@/lib/api/fetcher";

export const roomQueryKey = (roomId: string) => ["room", roomId] as const;

export type RoomWithRole = { room: Room; myRole: RoomRole | undefined };

async function fetchRoom(roomId: string): Promise<RoomWithRole> {
  if (roomId === "global") {
    // Special global room case
    return {
      room: {
        id: "global",
        name: "Global",
        description: "Predict against everyone on the platform — no room required.",
        created_by: "",
        invite_code: "",
        is_active: true,
        created_at: "",
        updated_at: "",
        competitions: [],
        scope: { type: "season" },
        join_policy: "always_open",
        lock_preset: "5m",
        enabled_markets: ["match_result", "exact_score", "btts", "total_goals"],
        scoring_config: {
          match_result: 2,
          exact_score: 5,
          btts: 1,
          total_goals: 1,
          custom_question: 3,
        },
        tiebreaker_order: [],
        lonely_wolf_enabled: false,
      },
      myRole: "participant",
    };
  }

  const result = await apiFetch<any>(`/leagues/${roomId}`);
  
  // Map backend league details to frontend Room shape
  const room: Room = {
    id: result.id,
    name: result.name,
    description: result.description,
    created_by: result.ownerUserId || "",
    invite_code: result.id.slice(0, 6).toUpperCase(), // Use start of UUID as simple invite code
    is_active: result.lifecycleState !== "archived",
    created_at: result.createdAt,
    updated_at: result.updatedAt,
    competitions: (result.ruleset?.competitionScopes || []).map((c: any) => c.supportedCompetitionId),
    scope: { type: "season" },
    join_policy: result.invitationSettings?.joinApprovalRequired ? "closes_at_start" : "always_open",
    lock_preset: result.ruleset?.standardLock?.offsetMinutes === 5 ? "5m" : "15m",
    enabled_markets: (result.ruleset?.markets || [])
      .filter((m: any) => m.enabled)
      .map((m: any) => m.marketType === "both_teams_to_score" ? "btts" : m.marketType),
    scoring_config: {
      match_result: 2,
      exact_score: 5,
      btts: 1,
      total_goals: 1,
      custom_question: 3,
    },
    tiebreaker_order: [],
    lonely_wolf_enabled: false,
  };

  // Map backend owner/admin/member to owner/admin/participant RoomRole
  const rawRole = result.membership?.role;
  let myRole: RoomRole | undefined = "participant";
  if (rawRole === "owner") myRole = "owner";
  else if (rawRole === "admin") myRole = "admin";
  else if (rawRole === "member") myRole = "participant";

  return { room, myRole };
}

export function useRoom(roomId: string) {
  return useQuery<RoomWithRole, Error>({
    queryKey: roomQueryKey(roomId),
    queryFn: () => fetchRoom(roomId),
    enabled: !!roomId,
  });
}
