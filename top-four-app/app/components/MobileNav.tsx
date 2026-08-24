'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname() || '';

  const tabs = [
    { label: "HOME", ic: "home", path: "/home" },
    { label: "PREDICT", ic: "ball", path: "/predict" },
    { label: "LEAGUES", ic: "leagues", path: "/leagues" },
    { label: "ME", ic: "me", path: "/me" }
  ];

  const IconMap: Record<string, React.FC> = {
    home: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    ball: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a14.5 14.5 0 0 0 0 20"></path>
        <path d="M2 12h20"></path>
      </svg>
    ),
    leagues: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5.5-3.6 10.5-8 12-4.4-1.5-8-6.5-8-12V6l8-4z"></path>
      </svg>
    ),
    me: () => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )
  };

  return (
    <nav className="flex-none bg-[var(--surface-card)] border-t border-[var(--surface-border)] grid grid-cols-4 pt-[7px] px-[7px] pb-[calc(8px+env(safe-area-inset-bottom))] min-h-[66px] md:hidden">
      {tabs.map((t, i) => {
        const RenderIcon = IconMap[t.ic];
        // Calculate active state
        const isActive = t.path === '/home' 
          ? pathname === '/home'
          : pathname.startsWith(t.path) || (t.path === '/leagues' && pathname.startsWith('/fixtures'));
        const color = isActive ? 'var(--text-primary)' : 'var(--nav-text-quiet)';
        
        // Mocking badge for Predict for now
        const badge = '';

        return (
          <Link href={t.path} key={i} className="relative flex flex-col items-center justify-center font-heading font-semibold text-[9px] leading-[1]" style={{ color }}>
            <div className="w-[19px] h-[19px] grid place-items-center"><RenderIcon /></div>
            <span className="mt-[6px] tracking-[0.01em]">{t.label}</span>
            {badge && (
              <span className="absolute top-[2px] left-[calc(50%+6px)] min-w-[15px] h-[15px] px-[3px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[8px]">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
