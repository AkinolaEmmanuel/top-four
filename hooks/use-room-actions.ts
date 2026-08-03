"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JoinPolicy, LockPreset, MarketType, Room, RoomScope, ScoringConfig } from "@/types";
import { myRoomsQueryKey } from "@/hooks/use-my-rooms";
import { apiFetch } from "@/lib/api/fetcher";

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
      // Map configuration fields to NestJS backend schema
      const mappedMarkets = (input.enabled_markets || ["match_result", "exact_score", "btts", "total_goals"]).map((m) => {
        let marketType = m;
        // Map btts -> both_teams_to_score
        if (m === "btts") marketType = "both_teams_to_score" as any;
        return {
          marketType,
          enabled: true,
          points: input.scoring_config?.[m] || 2,
        };
      });

      const payload = {
        name: input.name,
        description: input.description || null,
        invitationSettings: {
          enabled: true,
          joinApprovalRequired: input.join_policy === "closes_at_start",
        },
        configuration: {
          lateJoinPolicy: input.join_policy === "always_open" ? "allow" : "deny",
          competitionScopes: (input.competitions || []).map((id) => ({
            supportedCompetitionId: id,
          })),
          markets: mappedMarkets,
          totalGoalsLine: 2.5,
          standardLock: {
            kind: `minutes_${input.lock_preset === "5m" ? "5" : input.lock_preset === "15m" ? "15" : input.lock_preset === "30m" ? "30" : "60"}`,
          },
          tiebreakers: [],
        },
      };

      const result = await apiFetch<any>("/leagues", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Automatically publish/activate the league so it leaves draft status
      try {
        await apiFetch(`/leagues/${result.id}/publication`, {
          method: "POST",
        });
      } catch (e) {
        // Skip fallback publish failures if already active
      }

      return {
        id: result.id,
        name: result.name,
        description: result.description,
        is_active: true,
      } as unknown as Room;
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
      // 1. Submit invitation intent (sets HttpOnly cookie)
      await apiFetch("/invitation-intents", {
        method: "POST",
        body: JSON.stringify({
          joinCode: input.code,
        }),
      });

      // 2. Consume intent to complete the join flow
      const result = await apiFetch<any>("/invitation-intents/consume", {
        method: "POST",
      });

      return {
        id: result.leagueId || "",
        name: "Joined League",
        is_active: true,
      } as unknown as Room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myRoomsQueryKey });
    },
  });
}

export function useTransferOwnership(roomId: string) {
  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      return await apiFetch(`/leagues/${roomId}/ownership-transfer`, {
        method: "POST",
        body: JSON.stringify({
          targetUserId: input.userId,
        }),
      });
    },
  });
}

export function useUpdateMemberRole(roomId: string) {
  return useMutation({
    mutationFn: async (input: { userId: string; role: "admin" | "participant" }) => {
      // Map participant -> member/admin role
      return await apiFetch(`/leagues/${roomId}/members/${input.userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: input.role === "participant" ? "member" : "admin",
        }),
      });
    },
  });
}

export function useRemoveMember(roomId: string) {
  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      return await apiFetch(`/leagues/${roomId}/members/${input.userId}`, {
        method: "DELETE",
      });
    },
  });
}
