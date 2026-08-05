import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { apiFetch, ApiError } from "@/lib/api/fetcher";
import { decodeSession, SESSION_COOKIE, type SessionPayload } from "@/lib/mock-auth/session";
import type { Profile } from "@/types";

/**
 * Legacy session decoder for backwards compatibility with unused mock route handlers.
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
 * Returns the current authenticated user profile by querying the backend API.
 * Safely handles server context and returns undefined if not authenticated.
 */
export const getCurrentUser = cache(async (): Promise<Profile | undefined> => {
  try {
    const data = await apiFetch<{ profile?: Profile; user?: Profile; csrfToken?: string }>("/auth/me", {
      cache: "no-store",
    });
    return data?.profile ?? data?.user;
  } catch (error) {
    return undefined;
  }
});
