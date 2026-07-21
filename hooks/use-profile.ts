"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentProfile } from "@/lib/mock-auth/client";
import type { Profile } from "@/types";

export const profileQueryKey = ["profile"] as const;

export function useProfile() {
  return useQuery<Profile, Error>({
    queryKey: profileQueryKey,
    queryFn: fetchCurrentProfile,
    staleTime: 5 * 60 * 1000, // 5 min — profile data is low-churn
    retry: 1,
  });
}
