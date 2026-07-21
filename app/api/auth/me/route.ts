import { NextResponse } from "next/server";
import { findUserById, toProfile } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function GET() {
  const session = await getSession();
  const user = session ? findUserById(session.userId) : undefined;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ profile: toProfile(user) });
}
