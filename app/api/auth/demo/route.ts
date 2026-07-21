import { NextResponse } from "next/server";
import { getOrCreateDemoUser, toProfile } from "@/lib/mock-db/store";
import { COOKIE_OPTIONS, encodeSession, SESSION_COOKIE } from "@/lib/mock-auth/session";

export async function POST() {
  const user = getOrCreateDemoUser();

  const response = NextResponse.json({ profile: toProfile(user) });
  response.cookies.set(SESSION_COOKIE, encodeSession({ userId: user.id }), COOKIE_OPTIONS);
  return response;
}
