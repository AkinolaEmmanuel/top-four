import { NextResponse } from "next/server";
import { canAccessRoom, getEffectiveRoom, getAwardPicksForUser, submitAwardPick } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";
import type { AwardCategory } from "@/types";

const AWARD_CATEGORIES: AwardCategory[] = ["golden_boot", "golden_ball", "golden_glove", "young_player"];

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
  return NextResponse.json({ picks: getAwardPicksForUser(roomId, session.userId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (!canAccessRoom(id, session.userId)) {
    return NextResponse.json({ error: "You're not a member of this room." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const award = body?.award as AwardCategory;
  const playerName = typeof body?.playerName === "string" ? body.playerName.trim() : "";

  if (!AWARD_CATEGORIES.includes(award) || !playerName) {
    return NextResponse.json({ error: "Pick a valid award category and player." }, { status: 400 });
  }

  const roomId = id === "global" ? null : id;
  const pick = submitAwardPick({ roomId, userId: session.userId, award, playerName });
  return NextResponse.json({ pick }, { status: 201 });
}
