import { ProblemState } from './components/ProblemState';

/**
 * Reached by every `notFound()` in the app, which is deliberately also where a
 * 403 lands: a league you cannot see and a league that does not exist must be
 * indistinguishable, or the difference reveals which leagues exist and who is
 * in them (NFR-20).
 */
export default function NotFound() {
  return (
    <ProblemState
      icon="ghost"
      title="Not found, or no longer available"
      body="This league either does not exist or is not one you can see. TopFour deliberately does not say which — telling you the difference would reveal which leagues exist and who is in them."
      action={{ label: 'Back to my leagues', href: '/leagues' }}
    />
  );
}
