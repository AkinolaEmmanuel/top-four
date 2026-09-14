/**
 * Shown the moment a navigation starts, for every route that has no loading
 * file of its own.
 *
 * Without one, a Server Component route holds the *previous* page on screen
 * until its reads finish — so a tap looks ignored and then the screen jumps.
 * This also gives `next/link` a boundary to prefetch, which is what makes the
 * second visit feel instant.
 */
export default function Loading() {
  return (
    <div className="flex flex-col flex-1 min-h-[60vh] bg-[var(--surface-canvas)]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>

      <div className="h-[112px] bg-[var(--nav-surface)]" />

      <div className="p-[18px_var(--gutter)] md:max-w-[1080px] md:mx-auto md:w-full md:px-[24px]">
        {[72, 56, 64, 56].map((height, i) => (
          <div
            key={i}
            className="rounded-[14px] bg-[var(--surface-subtle)] animate-[tfpulse_1.4s_ease-in-out_infinite] mt-[12px] first:mt-0"
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}
