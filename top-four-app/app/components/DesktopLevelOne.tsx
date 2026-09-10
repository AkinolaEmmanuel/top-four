'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useUnreadNotifications } from '@/hooks/api/useNotifications';

export function DesktopLevelOne() {
  const pathname = usePathname() || '';
  const { user } = useAuth();
  const isAuthScreen = pathname === '/' || pathname.startsWith('/sign-up');
  const { data: unreadCount = 0 } = useUnreadNotifications(!isAuthScreen && !!user);

  if (isAuthScreen) {
    return null;
  }

  // Active state logic
  const isPredict = pathname.startsWith('/predict');
  const isHome = pathname === '/home';
  const isLeagues = pathname.startsWith('/leagues') || pathname.startsWith('/fixtures');

  return (
    <div className="hidden md:flex flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] h-[56px] w-full z-50 relative">
    <div className="flex items-center gap-[26px] px-[24px] h-full max-w-[1080px] w-full mx-auto">
      <div className="font-heading font-bold text-[17px] leading-[1] tracking-[-0.6px]">
        TOPFOUR<span className="text-[var(--nav-accent)]">/</span>
      </div>

      <div className="flex items-center gap-[3px] flex-1">
        <Link 
          href="/home" 
          className={`flex items-center px-[13px] py-[7px] rounded-[9px] font-heading font-semibold text-[12.5px] cursor-pointer ${isHome ? 'bg-[var(--nav-fill)]' : 'opacity-[0.66]'}`}
        >
          Home
        </Link>
        <Link 
          href="/predict" 
          className={`flex items-center px-[13px] py-[7px] rounded-[9px] font-heading font-semibold text-[12.5px] cursor-pointer ${isPredict ? 'bg-[var(--nav-fill)]' : 'opacity-[0.66]'}`}
        >
          Predict
        </Link>
        <Link 
          href="/leagues" 
          className={`flex items-center px-[13px] py-[7px] rounded-[9px] font-heading font-semibold text-[12.5px] cursor-pointer ${isLeagues ? 'bg-[var(--nav-fill)]' : 'opacity-[0.66]'}`}
        >
          Leagues
        </Link>
      </div>
      
      <Link
        href="/alerts"
        className={`relative flex items-center justify-center w-[36px] h-[36px] rounded-full flex-none cursor-pointer ${pathname.startsWith('/alerts') ? 'bg-[var(--nav-fill)]' : 'opacity-[0.8] hover:opacity-100'}`}
        aria-label={unreadCount > 0 ? `Alerts, ${unreadCount} unread` : 'Alerts'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-[1px] right-[1px] min-w-[15px] h-[15px] px-[3px] rounded-full bg-[var(--color-danger)] text-[var(--tf-white)] grid place-items-center font-heading font-bold text-[8.5px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      <Link href="/me" className="flex items-center gap-[8px] p-[4px_11px_4px_4px] rounded-full bg-[var(--nav-fill)] flex-none cursor-pointer hover:bg-[rgba(255,255,255,0.15)] transition-colors">
        <div className="w-[26px] h-[26px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[10px]">
          {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
        </div>
        <span className="font-heading font-semibold text-[11.5px]">{user?.displayName || 'User'}</span>
        <span className="text-[9px] text-[var(--nav-text-faint)]">▼</span>
      </Link>
    </div>
    </div>
  );
}
