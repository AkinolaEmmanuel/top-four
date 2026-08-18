import { NextResponse } from "next/server";
import { createUser, findUserByEmail, toProfile } from "@/lib/mock-db/store";
import { COOKIE_OPTIONS, encodeSession, SESSION_COOKIE } from "@/lib/mock-auth/session";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

  // 1. Attempt connection to external topfour-api backend register endpoint if configured
  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  if (backendUrl && backendUrl.startsWith("http") && !backendUrl.includes(":3001")) {
    try {
      const idempotencyKey = request.headers.get("idempotency-key") || crypto.randomUUID();
      const backendRes = await fetch(`${backendUrl}/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ email, displayName, password }),
        signal: AbortSignal.timeout(1500),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        const response = NextResponse.json(data, { status: 201 });
        const setCookie = backendRes.headers.get("set-cookie");
        if (setCookie) {
          response.headers.set("set-cookie", setCookie);
        }
        return response;
      }
    } catch (e) {
      // Backend unavailable, fallback to local store
    }
  }

  // 2. Local auth store fallback
  if (findUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const user = createUser({ email, displayName, password });
  const profile = toProfile(user);

  const response = NextResponse.json({ profile, user: profile }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, encodeSession({ userId: user.id }), COOKIE_OPTIONS);
  return response;
}
