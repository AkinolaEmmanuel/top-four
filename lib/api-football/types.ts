// Shapes loosely mirror the real API-Football (api-football.com / v3.football.api-sports.io)
// response conventions so the mock client can be swapped for live fetch calls later
// without touching consumers.

export type Team = {
  id: number;
  name: string;
  logo: string;
  country: string;
};

export type CompetitionType = "league" | "cup";

/**
 * What the real API-Football /leagues response's `coverage` object exposes
 * per competition/season. Top-5 leagues + UCL are fully covered; domestic
 * cups (FA Cup, Copa del Rey) are the real risk for events/lineups data,
 * especially in early rounds — that's why those flags are false for cups
 * below, even though Phase 1 markets don't consume events/lineups yet.
 */
export type CompetitionCoverage = {
  events: boolean;
  lineups: boolean;
  standings: boolean;
};

export type Competition = {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: number;
  type: CompetitionType;
  coverage: CompetitionCoverage;
};

export type League = {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: number;
};

// Trimmed to the subset we actually demo. The real API has ~18 status codes
// (TBD, NS, 1H, HT, 2H, ET, BT, P, SUSP, INT, FT, AET, PEN, PST, CANC, ABD,
// AWD, WO, LIVE) — add more here as Phase 2 needs them (e.g. SUSP/INT for
// live-in-progress edge cases).
export type FixtureStatus = "NS" | "1H" | "HT" | "2H" | "ET" | "PEN" | "FT" | "AET" | "PST" | "CANC" | "LIVE";

export type FixtureScoreline = {
  home: number | null;
  away: number | null;
};

/**
 * Real API-Football splits the score into fulltime/extratime/penalty. Grading
 * must always read `fulltime` (never the legacy `goals` field below) — that's
 * the mechanism for "per-90" scoring on knockout ties decided after ET/pens.
 */
export type FixtureScore = {
  fulltime: FixtureScoreline;
  extratime: FixtureScoreline | null;
  penalty: FixtureScoreline | null;
};

export type Fixture = {
  id: number;
  date: string; // ISO timestamp (kickoff)
  status: FixtureStatus;
  venue: string;
  /** e.g. "Regular Season - 4" or "Round of 16" — what league-scope (gameweek/range) filters against. */
  round: string;
  league: Pick<League, "id" | "name" | "logo">;
  teams: {
    home: Team;
    away: Team;
  };
  /** Current/final effective score (what a scoreboard shows). Do not use for grading — see `score.fulltime`. */
  goals: FixtureScoreline;
  score: FixtureScore;
};

export type ApiFootballResponse<T> = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: T[];
};
