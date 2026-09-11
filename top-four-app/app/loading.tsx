export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[var(--surface-canvas)]">
      <div
        className="w-8 h-8 rounded-full border-2 border-[var(--surface-border-strong)] border-t-[var(--color-brand)] animate-spin"
        aria-label="Loading"
      />
    </div>
  );
}
