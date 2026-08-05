"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentProfile } from "@/lib/mock-auth/client";
import type { Profile } from "@/types";

export const profileQueryKey = ["profile"] as const;

export function useProfile(enabled: boolean = true) {
  return useQuery<Profile | null, Error>({
    queryKey: profileQueryKey,
    queryFn: fetchCurrentProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    enabled,
  });
}
