import type { ApiFootballResponse, Competition, Fixture, Team } from "./types";
import { ALL_TEAMS, COMPETITIONS, MOCK_FIXTURES } from "./mock-data";

// Temporary mock client standing in for the real API-Football REST API
// (https://v3.football.api-sports.io) during development. Each function's
// signature and response envelope mirror the real API so swapping the body
// for an authenticated `fetch(..., { headers: { "x-apisports-key": ... } })`
// later is a drop-in change — consumers (hooks/components) don't need to
// change at all.

const MOCK_LATENCY_MS = 300;

function respond<T>(get: string, response: T[]): Promise<ApiFootballResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ get, parameters: {}, errors: [], results: response.length, response });
    }, MOCK_LATENCY_MS);
  });
}

export async function getCompetitions(): Promise<ApiFootballResponse<Competition>> {
  return respond("leagues", COMPETITIONS);
}

export async function getTeams(): Promise<ApiFootballResponse<Team>> {
  return respond("teams", ALL_TEAMS);
}

export async function getFixtures(params?: {
  status?: Fixture["status"];
  competitionIds?: number[];
  round?: string;
}): Promise<ApiFootballResponse<Fixture>> {
  let fixtures = MOCK_FIXTURES;

  if (params?.status) {
    fixtures = fixtures.filter((f) => f.status === params.status);
  }
  if (params?.competitionIds?.length) {
    const ids = new Set(params.competitionIds);
    fixtures = fixtures.filter((f) => ids.has(f.league.id));
  }
  if (params?.round) {
    fixtures = fixtures.filter((f) => f.round === params.round);
  }

  return respond("fixtures", fixtures);
}
