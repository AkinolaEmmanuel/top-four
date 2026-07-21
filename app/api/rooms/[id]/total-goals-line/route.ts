import { NextResponse } from "next/server";
import { canAccessRoom, getEffectiveRoom, canManageRoom, setTotalGoalsLine, getTotalGoalsLinesForRoom } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

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
  return NextResponse.json({ lines: getTotalGoalsLinesForRoom(roomId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!getEffectiveRoom(id)) return NextResponse.json({ error: "Room not found." }, { status: 404 });
  if (id !== "global" && !canManageRoom(id, session.userId)) {
    return NextResponse.json({ error: "Only the owner or an admin can set the total-goals line." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fixtureId = Number(body?.fixtureId);
  const line = Number(body?.line);

  if (!Number.isFinite(fixtureId) || !Number.isFinite(line) || line < 0) {
    return NextResponse.json({ error: "Enter a valid fixture and line." }, { status: 400 });
  }

  const roomId = id === "global" ? null : id;
  const saved = setTotalGoalsLine(roomId, fixtureId, line);
  return NextResponse.json({ line: saved }, { status: 201 });
}
