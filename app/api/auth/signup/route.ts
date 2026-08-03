import { NextResponse } from "next/server";
import { createUser, findUserByEmail, toProfile } from "@/lib/mock-db/store";
import { COOKIE_OPTIONS, encodeSession, SESSION_COOKIE } from "@/lib/mock-auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !displayName || password.length < 6) {
    return NextResponse.json(
      { error: "Enter a valid email, display name, and a password of at least 6 characters." },
      { status: 400 }
    );
  }

  if (findUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const user = createUser({ email, displayName, password });
  const profile = toProfile(user);

  const response = NextResponse.json({ profile }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, encodeSession({ userId: user.id }), COOKIE_OPTIONS);
  return response;
}
