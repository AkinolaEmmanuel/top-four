import { NextResponse } from "next/server";
import { joinRoomByInviteCode } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json({ error: "Enter an invite code." }, { status: 400 });
  }

  try {
    const room = joinRoomByInviteCode(session.userId, code);
    return NextResponse.json({ room });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not join room." },
      { status: 400 }
    );
  }
}
