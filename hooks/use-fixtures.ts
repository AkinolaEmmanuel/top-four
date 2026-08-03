"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import type { Fixture, Team, FixtureStatus } from "@/lib/api-football/types";

export const fixturesQueryKey = (leagueId?: string) =>
  ["fixtures", leagueId || "default"] as const;

export function useFixtures(leagueId?: string) {
  return useQuery<Fixture[], Error>({
    queryKey: fixturesQueryKey(leagueId),
    queryFn: async () => {
      if (!leagueId) {
        // Fallback to empty list if no leagueId provided
        return [];
      }

      // 1. Fetch fixtures availability from NestJS backend
      const availabilityData = await apiFetch<{ data: any[] }>(
        `/leagues/${leagueId}/fixtures/availability`
      );

      const backendFixtures = availabilityData.data || [];
      if (backendFixtures.length === 0) return [];

      // 2. Fetch team catalogue for the active season to resolve team names & logoUrls
      const seasonId = backendFixtures[0].seasonId || backendFixtures[0].season_id;
      let teamsMap: Record<string, any> = {};

      if (seasonId) {
        try {
          const catalogueTeams = await apiFetch<any[]>(
            `/football/catalogue/seasons/${seasonId}/teams`
          );
          catalogueTeams.forEach((t) => {
            teamsMap[t.id] = t;
          });
        } catch (e) {
          // Fallback if catalogue fails
        }
      }

      // 3. Map backend shapes to expected frontend Fixture structure
      return backendFixtures.map((bf) => {
        const homeTeam = teamsMap[bf.homeTeamId] || {
          displayName: `Home (${bf.homeTeamId.slice(0, 4)})`,
          logoUrl: "/football/teams/default.svg",
        };
        const awayTeam = teamsMap[bf.awayTeamId] || {
          displayName: `Away (${bf.awayTeamId.slice(0, 4)})`,
          logoUrl: "/football/teams/default.svg",
        };

        return {
          id: bf.leagueFixtureId,
          date: bf.kickoff?.at || new Date().toISOString(),
          status: (bf.fixtureState || "NS") as FixtureStatus,
          venue: `${homeTeam.displayName} Stadium`,
          round: "Regular Season",
          league: {
            id: 39,
            name: "Premier League",
            logo: "/football/competitions/39.svg",
          },
          teams: {
            home: {
              id: bf.homeTeamId,
              name: homeTeam.displayName,
              logo: homeTeam.logoUrl || "/football/teams/default.svg",
              country: "England",
            },
            away: {
              id: bf.awayTeamId,
              name: awayTeam.displayName,
              logo: awayTeam.logoUrl || "/football/teams/default.svg",
              country: "England",
            },
          },
          goals: { home: null, away: null },
          score: {
            fulltime: { home: null, away: null },
            extratime: null,
            penalty: null,
          },
        } as unknown as Fixture;
      });
    },
    staleTime: 30 * 1000,
    enabled: !!leagueId,
  });
}
