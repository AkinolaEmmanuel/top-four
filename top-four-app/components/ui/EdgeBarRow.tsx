import React from 'react';

interface EdgeBarRowProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  obligation?: 'brand' | 'warning' | 'danger';
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function EdgeBarRow({
  title,
  subtitle,
  badge,
  obligation = 'brand',
  onClick,
  children
}: EdgeBarRowProps) {
  const edgeColors = {
    brand: 'shadow-[inset_3px_0_0_0_var(--color-brand)]',
    warning: 'shadow-[inset_3px_0_0_0_var(--color-warning)]',
    danger: 'shadow-[inset_3px_0_0_0_var(--color-danger)]',
  };

  return (
    <div
      onClick={onClick}
      className={`w-full bg-[var(--surface-card)] border-b border-[var(--surface-border)] p-3.5 flex items-center justify-between transition-colors hover:bg-white/5 cursor-pointer ${edgeColors[obligation]}`}
    >
      <div className="flex-1 pr-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
          {badge && (
            <span className="text-[10px] bg-sky-500/20 text-sky-400 font-bold px-1.5 py-0.5 rounded num-tabular">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
