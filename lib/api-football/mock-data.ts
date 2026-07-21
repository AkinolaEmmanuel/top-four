import type { Competition, Fixture, FixtureScoreline, FixtureStatus, Team } from "./types";

// Static placeholder data for local development — NOT live results.
// Swap `lib/api-football/client.ts` for a real fetch against
// https://v3.football.api-sports.io once an API-Football key is available.
//
// League ids below (Premier League 39, La Liga 140, Serie A 135, Bundesliga
// 78, Ligue 1 61, UEFA Champions League 2, FA Cup 45, Copa del Rey 143) are
// the commonly-documented real API-Football ids — verify against a live
// /leagues call before going live, they weren't confirmed via an
// authenticated request this session.

const team = (id: number, name: string, country: string): Team => ({
  id,
  name,
  logo: `/football/teams/${id}.svg`,
  country,
});

// Premier League
const ARSENAL = team(1, "Arsenal", "England");
const MAN_CITY = team(2, "Manchester City", "England");
const LIVERPOOL = team(3, "Liverpool", "England");
const CHELSEA = team(4, "Chelsea", "England");
const SPURS = team(5, "Tottenham Hotspur", "England");
const MAN_UTD = team(6, "Manchester United", "England");
const NEWCASTLE = team(7, "Newcastle United", "England");
const ASTON_VILLA = team(8, "Aston Villa", "England");

// La Liga
const REAL_MADRID = team(20, "Real Madrid", "Spain");
const BARCELONA = team(21, "Barcelona", "Spain");
const ATLETICO = team(22, "Atlético Madrid", "Spain");
const SEVILLA = team(23, "Sevilla", "Spain");

// Serie A
const INTER = team(30, "Inter Milan", "Italy");
const AC_MILAN = team(31, "AC Milan", "Italy");
const JUVENTUS = team(32, "Juventus", "Italy");
const NAPOLI = team(33, "Napoli", "Italy");

// Bundesliga
const BAYERN = team(40, "Bayern Munich", "Germany");
const DORTMUND = team(41, "Borussia Dortmund", "Germany");
const LEIPZIG = team(42, "RB Leipzig", "Germany");
const LEVERKUSEN = team(43, "Bayer Leverkusen", "Germany");

// Ligue 1
const PSG = team(50, "Paris Saint-Germain", "France");
const MARSEILLE = team(51, "Marseille", "France");
const MONACO = team(52, "Monaco", "France");
const LYON = team(53, "Lyon", "France");

export const ALL_TEAMS: Team[] = [
  ARSENAL, MAN_CITY, LIVERPOOL, CHELSEA, SPURS, MAN_UTD, NEWCASTLE, ASTON_VILLA,
  REAL_MADRID, BARCELONA, ATLETICO, SEVILLA,
  INTER, AC_MILAN, JUVENTUS, NAPOLI,
  BAYERN, DORTMUND, LEIPZIG, LEVERKUSEN,
  PSG, MARSEILLE, MONACO, LYON,
];

const fullCoverage = { events: true, lineups: true, standings: true };
// Domestic cups are the real coverage risk for events/lineups data (not for
// plain final-score markets, which is all Phase 1 needs) — modelled here so
// Phase 2 (scorer/card/lineup markets) can gate on it correctly.
const cupCoverage = { events: false, lineups: false, standings: false };

export const COMPETITIONS: Competition[] = [
  { id: 39, name: "Premier League", country: "England", logo: "/football/competitions/39.svg", season: 2025, type: "league", coverage: fullCoverage },
  { id: 140, name: "La Liga", country: "Spain", logo: "/football/competitions/140.svg", season: 2025, type: "league", coverage: fullCoverage },
  { id: 135, name: "Serie A", country: "Italy", logo: "/football/competitions/135.svg", season: 2025, type: "league", coverage: fullCoverage },
  { id: 78, name: "Bundesliga", country: "Germany", logo: "/football/competitions/78.svg", season: 2025, type: "league", coverage: fullCoverage },
  { id: 61, name: "Ligue 1", country: "France", logo: "/football/competitions/61.svg", season: 2025, type: "league", coverage: fullCoverage },
  // API-Football itself types UCL as "Cup" despite the Swiss-model league phase.
  { id: 2, name: "UEFA Champions League", country: "World", logo: "/football/competitions/2.svg", season: 2025, type: "cup", coverage: fullCoverage },
  { id: 45, name: "FA Cup", country: "England", logo: "/football/competitions/45.svg", season: 2025, type: "cup", coverage: cupCoverage },
  { id: 143, name: "Copa del Rey", country: "Spain", logo: "/football/competitions/143.svg", season: 2025, type: "cup", coverage: cupCoverage },
];

const PL = COMPETITIONS[0];
const LA_LIGA = COMPETITIONS[1];
const SERIE_A = COMPETITIONS[2];
const BUNDESLIGA = COMPETITIONS[3];
const LIGUE_1 = COMPETITIONS[4];
const UCL = COMPETITIONS[5];
const FA_CUP = COMPETITIONS[6];
const COPA_DEL_REY = COMPETITIONS[7];

function fixture(
  id: number,
  daysFromNow: number,
  home: Team,
  away: Team,
  status: FixtureStatus,
  competition: Competition,
  round: string,
  fulltime: FixtureScoreline = { home: null, away: null },
  extratime: FixtureScoreline | null = null,
  penalty: FixtureScoreline | null = null
): Fixture {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  // Real API-Football's `goals` field reflects the current/final effective
  // score (i.e. the shootout result decides it, not the 90-minute score).
  const goals = penalty ?? extratime ?? fulltime;
  return {
    id,
    date: date.toISOString(),
    status,
    venue: `${home.name} Stadium`,
    round,
    league: { id: competition.id, name: competition.name, logo: competition.logo },
    teams: { home, away },
    goals,
    score: { fulltime, extratime, penalty },
  };
}

export const MOCK_FIXTURES: Fixture[] = [
  // Premier League
  fixture(101, -2, ARSENAL, CHELSEA, "FT", PL, "Regular Season - 1", { home: 2, away: 1 }),
  fixture(102, -1, LIVERPOOL, MAN_UTD, "FT", PL, "Regular Season - 1", { home: 1, away: 1 }),
  fixture(103, 1, MAN_CITY, NEWCASTLE, "NS", PL, "Regular Season - 2"),
  fixture(104, 2, SPURS, ASTON_VILLA, "NS", PL, "Regular Season - 2"),
  fixture(105, 3, CHELSEA, LIVERPOOL, "NS", PL, "Regular Season - 2"),
  fixture(106, 5, ARSENAL, MAN_CITY, "NS", PL, "Regular Season - 2"),
  fixture(107, 2, NEWCASTLE, MAN_UTD, "PST", PL, "Regular Season - 2"), // postponed — reopens on reschedule

  // La Liga
  fixture(201, -3, REAL_MADRID, SEVILLA, "FT", LA_LIGA, "Jornada 1", { home: 3, away: 0 }),
  fixture(202, 4, BARCELONA, ATLETICO, "NS", LA_LIGA, "Jornada 2"),

  // Serie A
  fixture(301, -2, INTER, JUVENTUS, "FT", SERIE_A, "Giornata 1", { home: 2, away: 2 }),
  fixture(302, 3, AC_MILAN, NAPOLI, "NS", SERIE_A, "Giornata 2"),

  // Bundesliga
  fixture(401, -1, BAYERN, DORTMUND, "FT", BUNDESLIGA, "Matchday 1", { home: 4, away: 1 }),
  fixture(402, 4, LEIPZIG, LEVERKUSEN, "NS", BUNDESLIGA, "Matchday 2"),

  // Ligue 1
  fixture(501, -4, PSG, MARSEILLE, "FT", LIGUE_1, "Matchday 1", { home: 3, away: 1 }),
  fixture(502, 5, MONACO, LYON, "NS", LIGUE_1, "Matchday 2"),

  // UEFA Champions League — 601 demonstrates the "per-90" rule: 90 minutes
  // finished 1-1, extra time added nothing, Man City won 4-3 on penalties.
  // Grading must read score.fulltime (1-1, a draw), never `goals` (4-3).
  fixture(601, -5, MAN_CITY, REAL_MADRID, "PEN", UCL, "Round of 16", { home: 1, away: 1 }, { home: 1, away: 1 }, { home: 4, away: 3 }),
  fixture(602, 6, BAYERN, PSG, "NS", UCL, "Quarter-final"),
  fixture(603, 7, BARCELONA, INTER, "NS", UCL, "League Phase - 8"),

  // FA Cup (coverage.events/lineups is false — fine for Phase 1, which only needs the final score)
  fixture(701, -6, ASTON_VILLA, NEWCASTLE, "FT", FA_CUP, "Fourth Round", { home: 2, away: 0 }),
  fixture(702, 8, SPURS, CHELSEA, "NS", FA_CUP, "Fifth Round"),

  // Copa del Rey
  fixture(801, 9, SEVILLA, REAL_MADRID, "NS", COPA_DEL_REY, "Round of 16"),
];
