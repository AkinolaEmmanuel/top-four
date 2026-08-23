'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Shield, Sun, Moon } from 'lucide-react';

interface AppHeaderProps {
  leagueContext?: {
    id: string;
    name: string;
    memberCount: number;
    activeTab?: 'overview' | 'fixtures' | 'table' | 'questions' | 'more';
  };
}

export default function AppHeader({ leagueContext, hideOnMobile = false }: AppHeaderProps & { hideOnMobile?: boolean }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={`w-full bg-[var(--nav-surface)] text-[var(--nav-text)] border-b border-[var(--nav-border)] sticky top-0 z-50 ${hideOnMobile ? 'hidden md:block' : ''}`}>
      {/* Level 1: Primary Navigation (Desktop) */}
      <div className="hidden md:flex max-w-[1080px] mx-auto px-4 h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-[var(--brand-fill)]">
            <span className="w-7 h-7 rounded-lg bg-[var(--brand-fill)] text-black flex items-center justify-center font-extrabold text-sm">4</span>
            TopFour
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-white/10 text-[var(--nav-text)]">
              Home
            </Link>
            <Link href="/predict" className="px-3 py-1.5 rounded-md hover:bg-white/10 text-[var(--nav-text)] flex items-center gap-1.5">
              Predict
              <span className="bg-[var(--color-brand)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full num-tabular">25</span>
            </Link>
            <Link href="/leagues" className="px-3 py-1.5 rounded-md hover:bg-white/10 text-[var(--nav-text)]">
              Leagues
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher Toggle (Light/Dark) */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            className="p-2 rounded-full hover:bg-white/10 text-[var(--nav-muted)] hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-sky-300" />}
            <span className="hidden sm:inline capitalize">{theme}</span>
          </button>

          <button title="Notifications" className="p-2 rounded-full hover:bg-white/10 relative text-[var(--nav-muted)] hover:text-white">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-brand)] rounded-full"></span>
          </button>
          
          <Link href="/me" className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-medium border border-white/10">
            <span className="w-5 h-5 rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] flex items-center justify-center font-bold text-[10px]">KA</span>
            <span>Kolade</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation (Home Header specific) */}
      <div className="md:hidden flex items-center justify-between px-[var(--gutter)] pt-2.5 pb-3">
        <div className="font-heading font-bold text-[19px] leading-none tracking-[-0.7px]">
          TOPFOUR<span className="text-[var(--nav-accent)]">/</span>
        </div>
        <div className="flex items-center gap-[9px]">
          <div className="w-[36px] h-[36px] border border-[var(--nav-border)] rounded-full grid place-items-center relative text-[var(--nav-text-quiet)] text-[14px]">
            <Bell size={16} />
            <span className="absolute -top-[2px] -right-[2px] min-w-[16px] h-[16px] px-1 rounded-[8px] bg-[var(--nav-accent)] text-[var(--nav-on-accent)] grid place-items-center font-heading font-bold text-[9px]">
              4
            </span>
          </div>
          <div className="w-[36px] h-[36px] rounded-full bg-[var(--avatar-surface)] text-[var(--avatar-text)] grid place-items-center font-heading font-bold text-[11.5px]">
            KA
          </div>
        </div>
      </div>

      {/* Level 2: Desktop League Context Subnav */}
      {leagueContext && (
        <div className="bg-[var(--surface-card)] border-t border-[var(--nav-border)] overflow-x-auto tf-scroll hidden md:block">
          <div className="max-w-[1080px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-[var(--text-primary)] leading-tight">{leagueContext.name}</h2>
                <p className="text-xs text-[var(--text-muted)] num-tabular">{leagueContext.memberCount} members · Premier Rules</p>
              </div>
            </div>

            <div className="flex items-center gap-1 border-b border-[var(--surface-border-strong)] text-sm whitespace-nowrap w-full sm:w-auto overflow-x-auto tf-scroll">
              {['overview', 'fixtures', 'table', 'questions', 'more'].map((tab) => {
                const isActive = leagueContext.activeTab === tab;
                return (
                  <Link
                    key={tab}
                    href={`/leagues/${leagueContext.id}/${tab === 'overview' ? '' : tab}`}
                    className={`capitalize px-4 py-2 text-xs font-medium transition-colors relative ${
                      isActive 
                        ? 'text-[var(--text-primary)] font-bold border-b-2 border-[var(--brand-fill)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab}
                    {tab === 'fixtures' && <span className="ml-1.5 text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full">6</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
