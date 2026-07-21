"use client";

import { useQuery } from "@tanstack/react-query";
import { getFixtures } from "@/lib/api-football/client";
import type { Fixture } from "@/lib/api-football/types";

export const fixturesQueryKey = (status?: Fixture["status"], competitionIds?: number[]) =>
  ["fixtures", status ?? "all", competitionIds?.join(",") ?? "all"] as const;

export function useFixtures(status?: Fixture["status"], competitionIds?: number[]) {
  return useQuery<Fixture[], Error>({
    queryKey: fixturesQueryKey(status, competitionIds),
    queryFn: async () => (await getFixtures({ status, competitionIds })).response,
    staleTime: 60 * 1000,
  });
}
