// Icon adapted from https://www.svgrepo.com (football-soccer-sport), inlined
// with fill="currentColor" so it can be recolored per usage via text-* classes.
export function FootballBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12 7.75 9" />
      <path d="M12 12 16.25 9" />
      <path d="M12 12v5.5" />
      <path d="M12 17.5 16.5 20" />
      <path d="M12 17.5 7.5 20" />
      <path d="M4 14.5h4" />
      <path d="M20 14.5h-4" />
      <path d="M7.75 9 8.5 4" />
      <path d="M16.25 9l-.75-5" />
    </svg>
  );
}
