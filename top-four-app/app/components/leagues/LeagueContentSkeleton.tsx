/**
 * Stands in for a league screen's content while its own reads are in flight.
 *
 * Paired with a Suspense boundary inside the page, so the chrome above it —
 * which needs only the league read — does not wait for the screen's heavier
 * queries behind it.
 */
export function LeagueContentSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-[18px_var(--gutter)] md:px-0" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-[62px] rounded-[14px] bg-[var(--surface-subtle)] animate-[tfpulse_1.4s_ease-in-out_infinite] mt-[12px] first:mt-0"
        />
      ))}
    </div>
  );
}
