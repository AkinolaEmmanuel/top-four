import { ApiError } from './fetcher';

/**
 * One sentence a member can act on, from whatever a mutation threw.
 *
 * The screens each had their own version of this, or nothing at all. The
 * problem document's `detail` is written for people and is preferred; the
 * status is only consulted for the cases where the server's wording is too
 * general to explain what the person is looking at.
 */
export function failureMessage(error: unknown, fallback = 'That did not save.'): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Changed somewhere else — reopen to see what is stored.';
    if (error.status === 429) {
      const wait = error.retryAfterSeconds;
      return wait ? `Too many attempts. Try again in ${wait}s.` : 'Too many attempts. Try again shortly.';
    }
    if (error.status === 401) return 'Your session expired. Sign in again.';
    if (error.status === 403) return 'You do not have permission to do that.';
    const detail = error.problem?.detail;
    if (detail) return detail;
  }
  // A fetch that never reached the server throws a TypeError with a message
  // ("Failed to fetch") that tells a member nothing.
  if (error instanceof TypeError) return 'No connection. Check your network and try again.';
  return error instanceof Error && error.message ? error.message : fallback;
}
