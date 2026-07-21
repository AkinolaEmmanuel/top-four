import { NextResponse } from "next/server";
import { canAccessRoom, deleteRoom, getEffectiveRoom, getMemberRole } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

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

  // Global has no real membership — everyone participates on equal footing.
  const myRole = id === "global" ? "participant" : getMemberRole(id, session.userId);

  return NextResponse.json({ room, myRole });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (id === "global") {
    return NextResponse.json({ error: "Global can't be deleted." }, { status: 400 });
  }

  try {
    deleteRoom(id, session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not delete room." }, { status: 403 });
  }
}
