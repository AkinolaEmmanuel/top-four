import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 text-center bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <div className="font-heading font-black text-[52px] leading-none tracking-tight text-[var(--color-brand)]">
        404
      </div>
      <h1 className="font-heading font-bold text-[19px] tracking-[-0.3px] mt-[10px]">Page not found</h1>
      <p className="text-[13px] text-[var(--text-secondary)] mt-[8px] max-w-[360px] leading-[1.5]">
        That page doesn't exist, or it moved. Check the link, or head back home.
      </p>
      <Link
        href="/home"
        className="h-[42px] px-[20px] grid place-items-center rounded-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-heading font-bold text-[13px] mt-[22px] transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
