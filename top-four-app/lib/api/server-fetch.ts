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
 *
 * SERVER ONLY. `cookies()` exists solely in a Server Component, so importing
 * this from anything marked `'use client'` is a mistake — the build complains,
 * but not always loudly. Client code wants `apiFetch` from ./fetcher instead.
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

/**
 * Follows `nextCursor` until the resource is exhausted.
 *
 * Several list endpoints page at twenty, and page one is the *earliest* slice —
 * so a screen that reads only the first page under-reports badly: a league whose
 * first twenty fixtures are mostly played looks as though it has two left.
 *
 * The envelope keys its rows `data` on some endpoints and `items` on others, so
 * both are read. `first` is the first page whole, for the fields that live
 * beside the rows rather than in them — `serverTime`, counts, limits.
 *
 * Bounded, because an unbounded follow is a denial of service against our own
 * API if a cursor ever fails to terminate.
 */
type PageEnvelope<T> = { nextCursor: string | null } & ({ data: T[] } | { items: T[] });

function rowsOf<T>(page: PageEnvelope<T>): T[] {
  return 'data' in page ? page.data : page.items;
}

export async function serverFetchAllPages<T, P extends PageEnvelope<T> = PageEnvelope<T>>(
  endpoint: string,
  options: { revalidate?: number | false; maxPages?: number } = {},
): Promise<{ items: T[]; truncated: boolean; first: P }> {
  const maxPages = options.maxPages ?? 10;
  const separator = endpoint.includes('?') ? '&' : '?';

  // Deliberately the throwing read: a signed-out or forbidden member must reach
  // the page's own redirect, not be handed an empty list as if they had no work.
  const first = await serverFetch<P>(endpoint, options);
  const items: T[] = [...rowsOf(first)];
  let cursor: string | null = first.nextCursor;

  for (let page = 1; cursor && page < maxPages; page++) {
    const next: P = await serverFetch<P>(
      `${endpoint}${separator}cursor=${encodeURIComponent(cursor)}`,
      options,
    );
    items.push(...rowsOf(next));
    cursor = next.nextCursor;
  }

  // Never silently: a short list that claims to be the whole list is exactly
  // the defect this helper exists to fix.
  if (cursor) console.warn(`[serverFetchAllPages] stopped at ${maxPages} pages, ${endpoint} has more`);
  return { items, truncated: cursor !== null, first };
}

/**
 * The paginated read's tolerant sibling, mirroring `serverFetchOrNull`: an
 * empty list rather than a throw when the member is signed out or the resource
 * is not theirs, so one optional panel cannot collapse a whole route.
 */
export async function serverFetchAllPagesOrEmpty<T, P extends PageEnvelope<T> = PageEnvelope<T>>(
  endpoint: string,
  options: { revalidate?: number | false; maxPages?: number } = {},
): Promise<{ items: T[]; truncated: boolean; first: P | null }> {
  try {
    return await serverFetchAllPages<T, P>(endpoint, options);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return { items: [], truncated: false, first: null };
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      return { items: [], truncated: false, first: null };
    }
    throw error;
  }
}
