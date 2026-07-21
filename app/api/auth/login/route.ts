import { NextResponse } from "next/server";
import { findUserByEmail, toProfile, verifyPassword } from "@/lib/mock-db/store";
import { COOKIE_OPTIONS, encodeSession, SESSION_COOKIE } from "@/lib/mock-auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const user = email ? findUserByEmail(email) : undefined;

  if (!user || !verifyPassword(user, password)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ profile: toProfile(user) });
  response.cookies.set(SESSION_COOKIE, encodeSession({ userId: user.id }), COOKIE_OPTIONS);
  return response;
}
