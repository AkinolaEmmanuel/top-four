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
