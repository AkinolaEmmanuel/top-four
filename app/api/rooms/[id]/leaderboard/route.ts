import { NextResponse } from "next/server";
import {
  canAccessRoom,
  getEffectiveRoom,
  getRoomMembers,
  getParticipantIdsForScope,
  getPredictionsForRoom,
  getCustomQuestionsForRoom,
  getAllAnswersForQuestion,
  getTotalGoalsLinesForRoom,
  findUserById,
} from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";
import { getFixtures } from "@/lib/api-football/client";
import { computeLeaderboard } from "@/lib/predictions/scoring";
import type { Fixture } from "@/lib/api-football/types";
import type { CustomQuestionAnswer } from "@/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const room = getEffectiveRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (!canAccessRoom(id, session.userId)) {
    return NextResponse.json({ error: "You're not a member of this room." }, { status: 403 });
  }

  const roomId = id === "global" ? null : id;

  let participantIds: string[];
  if (id === "global") {
    participantIds = getParticipantIdsForScope(null);
    // Always include the current viewer, even before they've made a pick.
    if (!participantIds.includes(session.userId)) participantIds = [...participantIds, session.userId];
  } else {
    participantIds = getRoomMembers(id).map((m) => m.userId);
  }

  const participants = participantIds
    .map((userId) => {
      const user = findUserById(userId);
      if (!user) return null;
      return { userId, displayName: user.full_name ?? user.username };
    })
    .filter((p): p is { userId: string; displayName: string } => p !== null);

  const { response: fixtures } = await getFixtures();
  const fixturesById = new Map<number, Fixture>(fixtures.map((f) => [f.id, f]));

  const customQuestions = getCustomQuestionsForRoom(roomId);
  const customQuestionAnswers: CustomQuestionAnswer[] = customQuestions.flatMap((q) => getAllAnswersForQuestion(q.id));

  const totalGoalsLines = new Map(getTotalGoalsLinesForRoom(roomId).map((l) => [l.fixture_id, l.line]));

  const leaderboard = computeLeaderboard(
    {
      predictions: getPredictionsForRoom(roomId),
      customQuestions,
      customQuestionAnswers,
      fixturesById,
      scoringConfig: room.scoring_config,
      totalGoalsLines,
      tiebreakerOrder: room.tiebreaker_order,
      lonelyWolfEnabled: room.lonely_wolf_enabled,
    },
    participants
  );

  return NextResponse.json({ leaderboard });
}
