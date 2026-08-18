import { NextResponse } from "next/server";
import { findUserById, toProfile } from "@/lib/mock-db/store";
import { getSession } from "@/lib/mock-auth/server";

export async function GET(request: Request) {
  // 1. Check local session cookie first for instant response
  const session = await getSession();
  if (session) {
    const user = findUserById(session.userId);
    if (user) {
      const profile = toProfile(user);
      return NextResponse.json(
        { profile, user: profile },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
  }

  // 2. If BACKEND_INTERNAL_URL is an external backend http URL, attempt check
  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  if (backendUrl && backendUrl.startsWith("http") && !backendUrl.includes(":3001")) {
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const backendRes = await fetch(`${backendUrl}/v1/auth/me`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      // External backend unreachable
    }
  }

  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
