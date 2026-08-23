import Link from 'next/link';

interface MobileTabBarProps {
  activeTab?: 'home' | 'predict' | 'leagues' | 'me';
}

const HomeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
    <path d="M9.5 20v-6h5v6" />
  </svg>
);

const BallIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="12" cy="12" r="8" />
    <path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" />
  </svg>
);

const LeaguesIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 3 21 8.5v7L12 21l-9-5.5v-7L12 3Z" />
  </svg>
);

const MeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export default function MobileTabBar({ activeTab = 'home' }: MobileTabBarProps) {
  const navItems = [
    { id: 'home', label: 'HOME', href: '/', icon: HomeIcon },
    { id: 'predict', label: 'PREDICT', href: '/predict', icon: BallIcon, badge: 25 },
    { id: 'leagues', label: 'LEAGUES', href: '/leagues', icon: LeaguesIcon },
    { id: 'me', label: 'ME', href: '/me', icon: MeIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 min-h-[66px] bg-[var(--surface-card)] border-t border-[var(--surface-border)] z-50 grid grid-cols-4 p-[7px_7px_8px] pb-[calc(8px+env(safe-area-inset-bottom))]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`relative flex flex-col items-center justify-center font-heading font-semibold text-[9px] leading-none tracking-[0.01em] transition-colors ${
              isActive ? 'text-[var(--color-brand)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <div className="w-[19px] h-[19px] grid place-items-center">
              <Icon />
            </div>
            <span className="mt-[6px]">{item.label}</span>
            {item.badge && item.id === 'predict' && (
              <span className="absolute top-[2px] left-[calc(50%+6px)] min-w-[15px] h-[15px] px-[3px] rounded-[8px] bg-[var(--color-danger)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[8px]">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
