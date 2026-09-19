/**
 * Presentation helpers shared across screens, so the same value is never
 * written two different ways on two halves of the same product.
 */

/** 1st, 2nd, 3rd, 4th — and 11th/12th/13th, which break the last-digit rule. */
export function ordinal(n: number): string {
  const teens = n % 100;
  if (teens >= 11 && teens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** "1 member" / "12 members" — the singular case is common enough to matter. */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * How long until a deadline, the way the queue says it: "7h 10m", "45m", or
 * "Thu 16:30" once it is more than a day out.
 *
 * Deliberately never a bare clock time. Every other screen shows a fixture's
 * kickoff, so "13:00" beside a fixture reads as kickoff even when it is the
 * lock two hours earlier — two screens quoting the same fixture differently.
 */
/**
 * A countdown, in the largest units that still say something.
 *
 * Hours alone stop being readable somewhere around the second day: "100h 28m"
 * is four days away and reads as a fault. Days lead once there is a day to
 * lead with, and seconds only appear in the last minute, where they are the
 * only thing still moving.
 */
export function countdownLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function timeUntilLabel(deadlineAt: string | null, nowMs: number): string {
  if (!deadlineAt) return '—';
  const deadline = Date.parse(deadlineAt);
  if (Number.isNaN(deadline)) return '—';

  const diffMs = deadline - nowMs;
  if (diffMs <= 0) return 'Closed';

  const DAY_MS = 24 * 60 * 60 * 1000;
  if (diffMs >= DAY_MS) {
    return new Date(deadline).toLocaleString([], {
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`;
}

/**
 * A deadline as a clock time a member can check against their own day.
 *
 * The countdown beside it says how long is left; this says when. Same day drops
 * the weekday, because "Locks 14:55" is unambiguous on the day it happens.
 */
export function lockLabel(deadlineAt: string, nowMs: number = Date.now()): string {
  const at = new Date(deadlineAt);
  if (Number.isNaN(at.getTime())) return '';
  const today = new Date(nowMs);
  const sameDay = at.getFullYear() === today.getFullYear()
    && at.getMonth() === today.getMonth()
    && at.getDate() === today.getDate();
  const time = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return sameDay ? time : `${at.toLocaleDateString([], { weekday: 'short' })} ${time}`;
}

/**
 * Reverses HTML-entity escaping.
 *
 * The football data provider's own player names sometimes arrive already
 * escaped — the API returns `"M. O&apos;Riley"` verbatim, not `"M. O'Riley"`
 * — presumably from wherever the provider last rendered the name as HTML
 * before storing it. React does not decode entities in text content (that
 * is what `dangerouslySetInnerHTML` is for, and using it here over a name
 * would be a real XSS hole for the sake of an apostrophe), so left alone
 * the literal six characters `&apos;` are what a member sees. This runs
 * once, at the point each name enters the app, rather than downstream at
 * every place a name is displayed.
 */
export function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', '\'')
    .replaceAll('&#x27;', '\'')
    .replaceAll('&apos;', '\'');
}

/**
 * The two letters on someone's avatar.
 *
 * First letters of the first two words — "Kolade Amire" is KA, which is what
 * the design draws and what anybody would write. Taking the first two
 * characters instead gave KO, and five places were doing that while the
 * standings and the account menu disagreed with each other.
 */
export function personInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const words = name.trim().split(/\s+/).filter(word => /[a-z0-9]/i.test(word));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'U';
}
