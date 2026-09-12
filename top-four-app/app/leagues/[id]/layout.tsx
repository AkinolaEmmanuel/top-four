import { notFound } from 'next/navigation';

/**
 * Rejects anything that is not a league id before any read is attempted.
 *
 * A truncated or mistyped link is not a failure at our end, and letting it
 * reach the API turns it into a 400 and then the unexpected-failure screen —
 * which tells the member something untrue. This says the same thing as a league
 * they cannot see, which is also what it is.
 *
 * Deliberately only a shape check: a well-formed id that is not theirs still
 * goes to the API, so the concealment rule stays the API's to enforce.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function LeagueLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  if (!UUID.test(params.id)) notFound();
  return children;
}
