import { NextResponse } from "next/server";
import { findUserByEmail, toProfile, verifyPassword } from "@/lib/mock-db/store";
import { COOKIE_OPTIONS, encodeSession, SESSION_COOKIE } from "@/lib/mock-auth/session";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  // 1. Attempt connection to external topfour-api backend endpoint if configured
  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  if (backendUrl && backendUrl.startsWith("http") && !backendUrl.includes(":3001")) {
    try {
      const backendRes = await fetch(`${backendUrl}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(1500),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        const response = NextResponse.json(data);
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
  const user = email ? findUserByEmail(email) : undefined;

  if (!user || !verifyPassword(user, password)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ profile: toProfile(user), user: toProfile(user) });
  response.cookies.set(SESSION_COOKIE, encodeSession({ userId: user.id }), COOKIE_OPTIONS);
  return response;
}
