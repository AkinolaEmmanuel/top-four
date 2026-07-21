import type { Profile } from "@/types";

export type AuthError = { message: string };

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
  return data;
}

export async function signUp(input: {
  email: string;
  username: string;
  fullName?: string;
  password: string;
}): Promise<Profile> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(res);
  return data.profile;
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<Profile> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(res);
  return data.profile;
}

export async function demoSignIn(): Promise<Profile> {
  const res = await fetch("/api/auth/demo", { method: "POST" });
  const data = await parseJson(res);
  return data.profile;
}

export async function signOut(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Sign-out failed. Please try again.");
}

export async function fetchCurrentProfile(): Promise<Profile> {
  const res = await fetch("/api/auth/me");
  const data = await parseJson(res);
  return data.profile;
}
