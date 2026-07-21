import "server-only";
import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE, type SessionPayload } from "@/lib/mock-auth/session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
