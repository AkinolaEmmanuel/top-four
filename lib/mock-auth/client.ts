import type { Profile } from "@/types";
import { apiFetch } from "@/lib/api/fetcher";

export type AuthError = { message: string };

export async function signUp(input: {
  email: string;
  displayName: string;
  password: string;
}): Promise<Profile> {
  const data = await apiFetch<{ user: Profile; verificationEmailScheduled: boolean }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      displayName: input.displayName,
      password: input.password,
    }),
  });
  return data.user;
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<Profile> {
  const data = await apiFetch<{ user: Profile; csrfToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });
  return data.user;
}

export async function demoSignIn(): Promise<Profile> {
  const data = await apiFetch<{ profile: Profile }>("/auth/demo", {
    method: "POST",
  });
  return data.profile;
}

export async function signOut(): Promise<void> {
  await apiFetch("/auth/logout", {
    method: "POST",
  });
}

export async function fetchCurrentProfile(): Promise<Profile | null> {
  try {
    const data = await apiFetch<{ profile?: Profile; user?: Profile; csrfToken?: string }>("/auth/me");
    return data?.profile ?? data?.user ?? null;
  } catch (err: any) {
    // Return null when unauthenticated (401 / 404) so TanStack Query caches logged-out state cleanly
    return null;
  }
}
