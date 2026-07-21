import type { NextRequest } from "next/server";

// Mock session codec — a base64 JSON cookie standing in for a real
// signed/opaque session token until a real backend is wired up. Kept
// framework-runtime-agnostic (no next/headers) so it can be imported from
// both middleware (Edge) and Route Handlers / Server Components (Node).

export const SESSION_COOKIE = "receipts_session";

export type SessionPayload = {
  userId: string;
};

export function encodeSession(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeSession(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof parsed?.userId === "string") return { userId: parsed.userId };
    return null;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  return decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
