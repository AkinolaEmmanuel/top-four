import React from 'react';

interface ChromeHeroProps {
  value: string | number;
  label: string;
  sublabel?: string;
  tone?: 'normal' | 'warning' | 'positive';
}

export default function ChromeHero({ value, label, sublabel, tone = 'normal' }: ChromeHeroProps) {
  const toneClasses = {
    normal: 'text-[var(--nav-text)]',
    warning: 'text-[var(--nav-warning)]',
    positive: 'text-[var(--nav-positive)]',
  };

  return (
    <div className="w-full bg-[var(--nav-surface)] text-center py-6 px-4 border-b border-[var(--nav-border)]">
      <div className={`text-4xl font-extrabold font-heading tracking-tight num-tabular ${toneClasses[tone]}`}>
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-muted)] mt-1">
        {label}
      </div>
      {sublabel && (
        <div className="text-[11px] text-white/50 mt-1">
          {sublabel}
        </div>
      )}
    </div>
  );
}
