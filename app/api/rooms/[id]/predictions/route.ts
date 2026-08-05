import { NextResponse } from "next/server";
import {
  canAccessRoom,
  getEffectiveRoom,
  getPredictionsForUser,
  getTotalGoalsLine,
  submitPrediction,
} from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";
import { getFixtures } from "@/lib/api-football/client";
import type { MarketType, PredictionValue } from "@/types";

function parseValue(market: MarketType, raw: unknown): PredictionValue | null {
  const value = raw as Record<string, unknown> | null;

  switch (market) {
    case "match_result": {
      const pick = value?.pick;
      if (pick !== "home" && pick !== "draw" && pick !== "away") return null;
      return { market, pick };
    }
    case "exact_score": {
      const home = Number(value?.home);
      const away = Number(value?.away);
      if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return null;
      return { market, home, away };
    }
    case "btts": {
      const pick = value?.pick;
      if (typeof pick !== "boolean" && pick !== "yes" && pick !== "no") return null;
      return { market, pick: pick === true || pick === "yes" ? "yes" : "no" } as any;
    }
    case "total_goals": {
      const pick = value?.pick;
      if (pick !== "over" && pick !== "under") return null;
      return { market, pick };
    }
    case "double_chance": {
      const pick = value?.pick;
      if (pick !== "1X" && pick !== "12" && pick !== "X2") return null;
      return { market, pick } as any;
    }
    default:
      return null;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (!canAccessRoom(id, session.userId)) {
    return NextResponse.json({ error: "You're not a member of this room." }, { status: 403 });
  }

  const roomId = id === "global" ? null : id;
  return NextResponse.json({ predictions: getPredictionsForUser(roomId, session.userId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const room = getEffectiveRoom(id);
  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (!canAccessRoom(id, session.userId)) {
    return NextResponse.json({ error: "You're not a member of this room." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fixtureId = Number(body?.fixtureId);
  const market = body?.market as MarketType;

  if (!Number.isFinite(fixtureId)) {
    return NextResponse.json({ error: "Invalid fixture." }, { status: 400 });
  }
  if (!room.enabled_markets.includes(market)) {
    return NextResponse.json({ error: "This market isn't enabled for this room." }, { status: 400 });
  }

  const roomId = id === "global" ? null : id;

  if (market === "total_goals" && getTotalGoalsLine(roomId, fixtureId) === undefined) {
    return NextResponse.json({ error: "No total-goals line has been set for this fixture yet." }, { status: 400 });
  }

  const value = parseValue(market, body?.value);
  if (!value) {
    return NextResponse.json({ error: "Enter a valid prediction." }, { status: 400 });
  }

  const { response: fixtures } = await getFixtures();
  const fixture = fixtures.find((f) => f.id === fixtureId);

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found." }, { status: 404 });
  }
  if (fixture.status !== "NS") {
    return NextResponse.json({ error: "🔒 Receipt locked — this fixture has kicked off." }, { status: 400 });
  }

  const prediction = submitPrediction({ roomId, userId: session.userId, fixtureId, market, value });
  return NextResponse.json({ prediction }, { status: 201 });
}
