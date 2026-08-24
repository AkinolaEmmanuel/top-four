'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useUnreadNotifications } from '@/hooks/api/useNotifications';

export function DesktopLevelOne() {
  const pathname = usePathname() || '';
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotifications();
  if (pathname === '/' || pathname.startsWith('/sign-up')) {
    return null;
  }

  // Active state logic
  const isPredict = pathname.startsWith('/predict');
  const isHome = pathname === '/home';
  const isLeagues = pathname.startsWith('/leagues') || pathname.startsWith('/fixtures');

  return (
    <div className="hidden md:flex flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] items-center gap-[26px] px-[24px] h-[56px] w-full z-50 relative">
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
      
      {/* Alerts feature temporarily removed pending backend implementation */}
      
      <Link href="/me" className="flex items-center gap-[8px] p-[4px_11px_4px_4px] rounded-full bg-[var(--nav-fill)] flex-none cursor-pointer hover:bg-[rgba(255,255,255,0.15)] transition-colors">
        <div className="w-[26px] h-[26px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[10px]">
          {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
        </div>
        <span className="font-heading font-semibold text-[11.5px]">{user?.displayName || 'User'}</span>
        <span className="text-[9px] text-[var(--nav-text-faint)]">▼</span>
      </Link>
    </div>
  );
}
