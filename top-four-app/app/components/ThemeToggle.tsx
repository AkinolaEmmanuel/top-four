'use client';

import { useThemeChoice } from '@/hooks/useThemeChoice';
import type { ThemeChoice } from '@/lib/theme';

const OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function ThemeToggle() {
  const [choice, choose] = useThemeChoice();

  return (
    <div className="flex items-center justify-between p-[14px_var(--gutter)] md:px-0 border-t border-[var(--surface-border)]">
      <div className="min-w-0">
        <div className="font-heading font-semibold text-[13.5px]">Appearance</div>
        <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">
          System follows your device.
        </div>
      </div>
      <div role="radiogroup" aria-label="Appearance" className="flex gap-[4px] flex-none">
        {OPTIONS.map(option => {
          const on = choice === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choose(option.id)}
              className={`h-[30px] px-[11px] rounded-[8px] font-heading font-semibold text-[11px] transition-colors ${
                on
                  ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]'
                  : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
