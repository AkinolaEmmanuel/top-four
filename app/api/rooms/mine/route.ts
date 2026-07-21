import { NextResponse } from "next/server";
import { getRoomsForUser } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ rooms: getRoomsForUser(session.userId) });
}
