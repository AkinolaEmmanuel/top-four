'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PREMIER_LEAGUE_CLUBS = [
  { id: 'ARS', name: 'Arsenal' },
  { id: 'MCI', name: 'Manchester City' },
  { id: 'LIV', name: 'Liverpool' },
  { id: 'CHE', name: 'Chelsea' },
  { id: 'TOT', name: 'Tottenham Hotspur' },
  { id: 'MUN', name: 'Manchester United' },
  { id: 'NEW', name: 'Newcastle United' },
  { id: 'AVL', name: 'Aston Villa' },
  { id: 'BHA', name: 'Brighton & Hove Albion' },
  { id: 'WHU', name: 'West Ham United' },
  { id: 'FUL', name: 'Fulham' },
  { id: 'CRY', name: 'Crystal Palace' },
  { id: 'BOU', name: 'AFC Bournemouth' },
  { id: 'WOL', name: 'Wolverhampton Wanderers' },
  { id: 'EVE', name: 'Everton' },
  { id: 'BRE', name: 'Brentford' },
  { id: 'NFO', name: 'Nottingham Forest' },
  { id: 'LEI', name: 'Leicester City' },
  { id: 'SOU', name: 'Southampton' },
  { id: 'IPS', name: 'Ipswich Town' }
];

function SortableClubItem({ club, index }: { club: { id: string, name: string }, index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: club.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? 'var(--elev-3)' : 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-[12px] p-[12px_var(--gutter)] border-b border-[var(--surface-border)] bg-[var(--surface-canvas)] ${isDragging ? 'opacity-80' : ''}`}
    >
      <div className="flex-none text-[var(--text-muted)] font-heading font-bold text-[14px] w-[24px]">
        {index + 1}
      </div>
      <div
        className="w-[30px] h-[30px] rounded-full border border-[var(--surface-border-strong)] flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-secondary)]"
        style={{ background: `linear-gradient(135deg, var(--surface-subtle), var(--surface-card))` }}
      >
        {club.id}
      </div>
      <div className="flex-1 min-w-0 font-heading font-semibold text-[14px]">
        {club.name}
      </div>
      
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-none w-[40px] h-[40px] flex items-center justify-center cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="9" x2="16" y2="9"></line>
          <line x1="8" y1="15" x2="16" y2="15"></line>
        </svg>
      </div>
    </div>
  );
}

export function StandingsPickerMobile({ onSave, onBack }: { onSave: (standings: string[]) => void, onBack: () => void }) {
  const [clubs, setClubs] = useState(PREMIER_LEAGUE_CLUBS);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setClubs((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(clubs.map(c => c.id));
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] font-['Sora',sans-serif] relative text-[var(--text-primary)]">
      {/* Header */}
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_12px] flex-none z-10 shadow-[var(--elev-2)]">
        <div className="flex items-center gap-[11px]">
          <div onClick={onBack} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]">{"<"}</div>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[15px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">Premier League Standings</div>
            <div className="text-[10px] text-[var(--nav-text-faint)] mt-[2px]">Drag to reorder clubs</div>
          </div>
          <div onClick={handleSave} className="h-[36px] px-[16px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12px] cursor-pointer grid place-items-center">
            Save
          </div>
        </div>
      </header>

      {/* Table list */}
      <div className="flex-1 overflow-auto bg-[var(--surface-canvas)] pb-[100px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={clubs.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {clubs.map((club, index) => (
              <SortableClubItem key={club.id} club={club} index={index} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

    </div>
  );
}
