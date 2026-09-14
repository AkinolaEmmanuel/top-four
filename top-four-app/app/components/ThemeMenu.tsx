'use client';

import { useEffect, useRef, useState } from 'react';
import { useThemeChoice } from '@/hooks/useThemeChoice';
import type { ThemeChoice } from '@/lib/theme';

/**
 * Appearance, in the chrome rather than buried in settings.
 *
 * The same three choices the row on Me offers, in the one place a member is
 * already looking when the room gets dark. Both read `useThemeChoice`, so the
 * two cannot disagree about what is selected.
 */

const OPTIONS: { id: ThemeChoice; label: string; hint: string; icon: JSX.Element }[] = [
  {
    id: 'system', label: 'System', hint: 'Follows your device',
    icon: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
  },
  {
    id: 'light', label: 'Light', hint: 'Always light',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    id: 'dark', label: 'Dark', hint: 'Always dark',
    icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  },
];

export function ThemeMenu() {
  const [choice, choose] = useThemeChoice();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Close on an outside press or Escape — a popover in the nav that only closes
  // by pressing its own button traps the reader on every other control.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);

  const current = OPTIONS.find(o => o.id === choice) ?? OPTIONS[0];

  return (
    <div ref={box} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Appearance: ${current.label}`}
        className={`flex items-center justify-center w-[36px] h-[36px] rounded-full cursor-pointer ${open ? 'bg-[var(--nav-fill)]' : 'opacity-[0.8] hover:opacity-100'}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {current.icon}
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Appearance"
          className="absolute right-0 top-[42px] w-[196px] rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-primary)] shadow-[var(--elev-3)] p-[6px] z-50"
        >
          {OPTIONS.map(option => {
            const on = choice === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                onClick={() => { choose(option.id); setOpen(false); }}
                className={`w-full flex items-center gap-[10px] p-[8px_9px] rounded-[8px] text-left cursor-pointer ${on ? 'bg-[var(--accent-surface)]' : 'hover:bg-[var(--surface-subtle)]'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-[var(--text-secondary)]">
                  {option.icon}
                </svg>
                <span className="flex-1 min-w-0">
                  <span className={`block font-heading text-[12.5px] ${on ? 'font-bold text-[var(--accent-text-strong)]' : 'font-semibold'}`}>{option.label}</span>
                  <span className="block text-[10.5px] text-[var(--text-muted)] mt-[1px]">{option.hint}</span>
                </span>
                {on && <span aria-hidden="true" className="text-[var(--accent-text)] text-[13px] flex-none">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
