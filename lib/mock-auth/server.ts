import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE, type SessionPayload } from "@/lib/mock-auth/session";
import { findUserById, toProfile } from "@/lib/mock-db/store";
import type { Profile } from "@/types";

/**
 * Reads and decodes the receipts_session cookie on the server.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies();
    return decodeSession(store.get(SESSION_COOKIE)?.value);
  } catch (e) {
    return null;
  }
}

/**
 * Returns the current authenticated user profile for Server Components and Layouts.
 * Direct session & store lookup guarantees zero-latency execution on Vercel without
 * failed HTTP loopbacks to localhost:3001.
 */
export const getCurrentUser = cache(async (): Promise<Profile | undefined> => {
  try {
    const session = await getSession();
    if (!session) return undefined;

    const user = findUserById(session.userId);
    if (!user) return undefined;

    return toProfile(user);
  } catch (error) {
    return undefined;
  }
});
