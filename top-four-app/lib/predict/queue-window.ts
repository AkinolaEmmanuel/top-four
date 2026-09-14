/**
 * The window every "what do I owe?" figure is measured over.
 *
 * Home, the Predict headline, the phone tab badge and the leagues list all
 * answer the same question, and for a while they answered it four different
 * ways: 800, 200, 20 and a dash. The window lives here so a screen cannot
 * quietly disagree with the one it links to.
 */
export const QUEUE_DAYS = 7;

/** A ceiling, so a URL cannot ask for the season back. */
export const MAX_QUEUE_WEEKS = 12;

/**
 * An instant the API will accept.
 *
 * `from`/`to` are validated against an explicit-timezone pattern that rejects
 * the six-digit fractional seconds some clocks produce, so the instant is
 * trimmed to whole seconds rather than passed straight from `toISOString`.
 */
export function boundary(atMs: number): string {
  return new Date(atMs).toISOString().replace(/\.\d+Z$/, 'Z');
}

/** `from`/`to` for a number of weeks ahead, ready to append to a query. */
export function queueWindow(nowMs: number, weeks = 1): string {
  const to = nowMs + weeks * QUEUE_DAYS * 24 * 60 * 60 * 1000;
  return `from=${encodeURIComponent(boundary(nowMs))}&to=${encodeURIComponent(boundary(to))}`;
}

/** Clamps a `weeks` query parameter to something the feed can serve. */
export function requestedWeeks(weeks: string | undefined): number {
  const asked = Number.parseInt(weeks ?? '', 10);
  return Number.isFinite(asked) && asked > 0 ? Math.min(asked, MAX_QUEUE_WEEKS) : 1;
}
