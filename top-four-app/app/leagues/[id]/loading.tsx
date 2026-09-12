/**
 * The league chrome's own shape, held while the league read is in flight.
 *
 * `/leagues/:id` takes about 1.5s against the current API, and until it lands
 * there is nothing to draw a header from. The root loading file stood in for
 * this, but it is shaped like a root screen — so every tab switch replaced the
 * chrome with a dark band of the wrong height and the page moved twice.
 */
export default function LeagueLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-0" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading this league</span>

      <div className="hidden md:block h-[38px] border-b border-[var(--surface-border)] bg-[var(--surface-card)]" />

      <div className="bg-[var(--nav-surface)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[14px] md:p-0 md:bg-[var(--surface-card)]">
        <div className="flex items-center gap-[11px] md:max-w-[1080px] md:mx-auto md:px-[24px] md:h-[54px] md:items-end">
          <div className="w-[40px] h-[40px] rounded-full bg-[var(--nav-fill)] flex-none md:hidden" />
          <div className="min-w-0 flex-1 md:pb-[11px]">
            <div className="h-[15px] w-[180px] rounded-[5px] bg-[var(--nav-fill)] md:bg-[var(--surface-subtle)] animate-[tfpulse_1.4s_ease-in-out_infinite]" />
            <div className="h-[9px] w-[110px] rounded-[5px] bg-[var(--nav-fill)] md:bg-[var(--surface-subtle)] mt-[6px] animate-[tfpulse_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <div className="h-[43px] border-b border-[var(--surface-border)] bg-[var(--surface-card)]" />

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
