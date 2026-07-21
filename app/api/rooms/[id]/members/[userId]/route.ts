import { NextResponse } from "next/server";
import { updateMemberRole, removeMember } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";
import type { RoomRole } from "@/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, userId } = await params;
  const body = await request.json().catch(() => null);
  const role = body?.role as RoomRole;

  if (role !== "admin" && role !== "participant") {
    return NextResponse.json({ error: "Role must be 'admin' or 'participant'." }, { status: 400 });
  }

  try {
    updateMemberRole(id, session.userId, userId, role);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not update role." }, { status: 403 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, userId } = await params;

  try {
    removeMember(id, session.userId, userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not remove member." }, { status: 403 });
  }
}
