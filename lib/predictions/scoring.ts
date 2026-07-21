import type { Fixture } from "@/lib/api-football/types";
import type { CustomQuestion, CustomQuestionAnswer, MarketType, Prediction } from "@/types";

// Lonely Wolf bonus: a house rule (not part of the MVP spec), off by default
// per-room. Sole participant with at least one correct market on a fixture
// gets this on top of their regular points.
export const LONELY_WOLF_BONUS = 2;

export type PredictionGrade = "correct" | "incorrect" | "pending";

function matchOutcome(home: number, away: number): "home" | "away" | "draw" {
  if (home === away) return "draw";
  return home > away ? "home" : "away";
}

/**
 * Grades a single prediction against a fixture. Always reads
 * `fixture.score.fulltime` — never the legacy `goals` field — so knockout
 * ties decided after extra time/penalties are still scored on the 90-minute
 * result ("per-90" scoring).
 */
export function gradePrediction(
  prediction: Prediction,
  fixture: Fixture | undefined,
  points: number,
  totalGoalsLine?: number
): { grade: PredictionGrade; points: number } {
  const fulltime = fixture?.score.fulltime;
  if (!fixture || fixture.status === "NS" || fulltime?.home == null || fulltime?.away == null) {
    return { grade: "pending", points: 0 };
  }

  const actualHome = fulltime.home;
  const actualAway = fulltime.away;
  const value = prediction.value;
  let correct = false;

  switch (value.market) {
    case "match_result":
      correct = value.pick === matchOutcome(actualHome, actualAway);
      break;
    case "exact_score":
      correct = value.home === actualHome && value.away === actualAway;
      break;
    case "btts":
      correct = value.pick === (actualHome > 0 && actualAway > 0);
      break;
    case "total_goals": {
      if (totalGoalsLine == null) return { grade: "pending", points: 0 };
      const total = actualHome + actualAway;
      correct = value.pick === (total > totalGoalsLine ? "over" : "under");
      break;
    }
  }

  return correct ? { grade: "correct", points } : { grade: "incorrect", points: 0 };
}

/** Case/whitespace-insensitive match against the creator's accepted answers. */
export function gradeCustomQuestionAnswer(
  answer: CustomQuestionAnswer,
  question: CustomQuestion
): { grade: PredictionGrade; points: number } {
  if (!question.correct_answer) return { grade: "pending", points: 0 };
  const normalize = (s: string) => s.trim().toLowerCase();
  const accepted = question.correct_answer.map(normalize);
  const correct = accepted.includes(normalize(answer.answer));
  return correct ? { grade: "correct", points: question.points } : { grade: "incorrect", points: 0 };
}

/**
 * Provisional until 24h after an approximated finish time (kickoff + 2h —
 * a mock stand-in for a real "reported FT at" timestamp), then final. No
 * scheduler needed since this is computed on read.
 */
export type SettlementStatus = "pending" | "provisional" | "final";

export function getSettlementStatus(fixture: Fixture): SettlementStatus {
  if (fixture.status === "NS" || fixture.score.fulltime.home == null) return "pending";
  const approxFinishedAt = new Date(fixture.date).getTime() + 2 * 60 * 60 * 1000;
  const verificationWindowEnd = approxFinishedAt + 24 * 60 * 60 * 1000;
  return Date.now() >= verificationWindowEnd ? "final" : "provisional";
}

export type LeaderboardRow = {
  userId: string;
  displayName: string;
  points: number;
  rank: number;
};

type ScoringInputs = {
  predictions: Prediction[];
  customQuestions: CustomQuestion[];
  customQuestionAnswers: CustomQuestionAnswer[];
  fixturesById: Map<number, Fixture>;
  scoringConfig: Record<MarketType | "custom_question", number>;
  totalGoalsLines: Map<number, number>; // fixtureId -> line
  tiebreakerOrder: MarketType[];
  lonelyWolfEnabled: boolean;
};

export function computeLeaderboard(
  inputs: ScoringInputs,
  participants: { userId: string; displayName: string }[]
): LeaderboardRow[] {
  const { predictions, customQuestions, customQuestionAnswers, fixturesById, scoringConfig, totalGoalsLines, tiebreakerOrder, lonelyWolfEnabled } = inputs;

  const pointsByUser = new Map<string, number>();
  for (const participant of participants) pointsByUser.set(participant.userId, 0);

  // Score fixture predictions, grouped by fixture for the Lonely Wolf bonus.
  const byFixture = new Map<number, Prediction[]>();
  for (const prediction of predictions) {
    const list = byFixture.get(prediction.fixture_id) ?? [];
    list.push(prediction);
    byFixture.set(prediction.fixture_id, list);
  }

  for (const [fixtureId, fixturePredictions] of byFixture) {
    const fixture = fixturesById.get(fixtureId);
    const correctUsersOnFixture = new Set<string>();

    for (const prediction of fixturePredictions) {
      const points = scoringConfig[prediction.market];
      const { grade, points: earned } = gradePrediction(prediction, fixture, points, totalGoalsLines.get(fixtureId));
      if (earned > 0) pointsByUser.set(prediction.user_id, (pointsByUser.get(prediction.user_id) ?? 0) + earned);
      if (grade === "correct") correctUsersOnFixture.add(prediction.user_id);
    }

    if (lonelyWolfEnabled && correctUsersOnFixture.size === 1) {
      const soleUserId = [...correctUsersOnFixture][0];
      pointsByUser.set(soleUserId, (pointsByUser.get(soleUserId) ?? 0) + LONELY_WOLF_BONUS);
    }
  }

  // Score custom questions (count toward total points, never toward tiebreakers — see spec).
  for (const answer of customQuestionAnswers) {
    const question = customQuestions.find((q) => q.id === answer.question_id);
    if (!question) continue;
    const { points: earned } = gradeCustomQuestionAnswer(answer, question);
    if (earned > 0) pointsByUser.set(answer.user_id, (pointsByUser.get(answer.user_id) ?? 0) + earned);
  }

  const ranked = participants
    .map((p) => ({ userId: p.userId, displayName: p.displayName, points: pointsByUser.get(p.userId) ?? 0 }))
    .sort((a, b) => b.points - a.points);

  return assignRanks(ranked, tiebreakerOrder, predictions, fixturesById);
}

/** Groups participants by equal points, resolves ties via the configured market order, assigns shared ranks where still tied. */
function assignRanks(
  ranked: { userId: string; displayName: string; points: number }[],
  tiebreakerOrder: MarketType[],
  predictions: Prediction[],
  fixturesById: Map<number, Fixture>
): LeaderboardRow[] {
  const rows: LeaderboardRow[] = [];
  let index = 0;

  while (index < ranked.length) {
    const tiedGroup = [ranked[index]];
    let j = index + 1;
    while (j < ranked.length && ranked[j].points === ranked[index].points) {
      tiedGroup.push(ranked[j]);
      j++;
    }

    if (tiedGroup.length === 1) {
      rows.push({ ...tiedGroup[0], rank: index + 1 });
    } else {
      const subGroups = resolveTiebreakers(
        tiedGroup.map((r) => r.userId),
        tiebreakerOrder,
        predictions,
        fixturesById
      );
      let offset = 0;
      for (const subGroup of subGroups) {
        const rank = index + offset + 1;
        for (const userId of subGroup) {
          const row = tiedGroup.find((r) => r.userId === userId)!;
          rows.push({ ...row, rank });
        }
        offset += subGroup.length;
      }
    }

    index = j;
  }

  return rows;
}

/** Cascades through tiebreakerOrder, splitting the tied group by correct-pick-count on each market in turn. */
function resolveTiebreakers(
  tiedUserIds: string[],
  tiebreakerOrder: MarketType[],
  predictions: Prediction[],
  fixturesById: Map<number, Fixture>
): string[][] {
  if (tiebreakerOrder.length === 0 || tiedUserIds.length <= 1) return [tiedUserIds];

  let groups: string[][] = [tiedUserIds];

  for (const market of tiebreakerOrder) {
    const nextGroups: string[][] = [];
    for (const group of groups) {
      if (group.length <= 1) {
        nextGroups.push(group);
        continue;
      }
      const correctCountByUser = new Map<string, number>();
      for (const userId of group) correctCountByUser.set(userId, 0);

      for (const prediction of predictions) {
        if (prediction.market !== market || !group.includes(prediction.user_id)) continue;
        const fixture = fixturesById.get(prediction.fixture_id);
        const { grade } = gradePrediction(prediction, fixture, 0);
        if (grade === "correct") {
          correctCountByUser.set(prediction.user_id, (correctCountByUser.get(prediction.user_id) ?? 0) + 1);
        }
      }

      const byCount = new Map<number, string[]>();
      for (const [userId, count] of correctCountByUser) {
        const bucket = byCount.get(count) ?? [];
        bucket.push(userId);
        byCount.set(count, bucket);
      }
      const sortedCounts = Array.from(byCount.keys()).sort((a, b) => b - a);
      for (const count of sortedCounts) nextGroups.push(byCount.get(count)!);
    }
    groups = nextGroups;
  }

  return groups;
}
