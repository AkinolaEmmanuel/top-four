import { cookies } from 'next/headers';
import { ApiError } from './fetcher';

/**
 * Reads the API from a Server Component, as the signed-in member.
 *
 * The browser's `apiFetch` cannot be reused here for two reasons. Its base URL
 * defaults to the relative `/api`, which only resolves through the Next rewrite
 * in a browser; and it relies on the browser attaching the session cookie, which
 * the server has to forward by hand.
 *
 * Reads only. Every mutation stays on the client, because the CSRF token the API
 * requires for them is issued to the browser session and held in memory there.
 */

/** Absolute, because a server-side fetch has no origin to resolve `/api` against. */
const SERVER_API_BASE = process.env.API_TARGET_URL || 'https://api.topfour.app/v1';

/** Both names exist: production sets the `__Host-` prefix, local cannot (it needs Secure). */
const SESSION_COOKIES = ['__Host-tf.sid', 'tf.sid'] as const;

function sessionCookieHeader(): string | null {
  const jar = cookies();
  const present = SESSION_COOKIES
    .map(name => jar.get(name))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map(c => `${c.name}=${c.value}`);
  return present.length > 0 ? present.join('; ') : null;
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super('No session cookie on this request.');
    this.name = 'NotAuthenticatedError';
  }
}

/**
 * `revalidate` is per call because these resources age very differently: a
 * league's frozen ruleset is immutable for the league's life, while a fixture's
 * availability changes as deadlines pass. Defaults to no caching, so a screen
 * has to opt in rather than accidentally serve a stale deadline.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: { revalidate?: number | false } = {},
): Promise<T> {
  const cookieHeader = sessionCookieHeader();
  if (!cookieHeader) throw new NotAuthenticatedError();

  const response = await fetch(`${SERVER_API_BASE}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
    cache: options.revalidate === undefined ? 'no-store' : undefined,
    next: options.revalidate === undefined ? undefined : { revalidate: options.revalidate },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    const message =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : `Request failed (HTTP ${response.status})`;
    throw new ApiError(response.status, message, body);
  }

  return response.json() as Promise<T>;
}

/**
 * The same read, but `null` instead of throwing when the member is signed out or
 * the resource is not theirs — so a screen can render its own empty state rather
 * than collapsing the whole route into an error boundary.
 */
export async function serverFetchOrNull<T>(
  endpoint: string,
  options: { revalidate?: number | false } = {},
): Promise<T | null> {
  try {
    return await serverFetch<T>(endpoint, options);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return null;
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      return null;
    }
    throw error;
  }
}
