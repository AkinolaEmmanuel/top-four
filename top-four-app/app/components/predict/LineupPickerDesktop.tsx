import React from 'react';
import { LineupPickerMobile } from './LineupPickerMobile';

export function LineupPickerDesktop(props: any) {
  return (
    <div className="flex flex-col flex-1 h-full bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)] items-center justify-center">
      <div className="w-full max-w-[400px] h-[844px] rounded-[27px] overflow-hidden shadow-[var(--elev-4)] border border-[var(--surface-border)]">
        <LineupPickerMobile {...props} />
      </div>
    </div>
  );
}
