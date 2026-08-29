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
  { id: 'ARS', name: 'Arsenal', code: 'ARS', color: '#c8182f' },
  { id: 'MCI', name: 'Manchester City', code: 'MCI', color: '#559ac7' },
  { id: 'LIV', name: 'Liverpool', code: 'LIV', color: '#b7152b' },
  { id: 'CHE', name: 'Chelsea', code: 'CHE', color: '#1746a2' },
  { id: 'TOT', name: 'Tottenham Hotspur', code: 'TOT', color: '#17233d' },
  { id: 'MUN', name: 'Manchester United', code: 'MUN', color: '#d1262f' },
  { id: 'NEW', name: 'Newcastle United', code: 'NEW', color: '#20242a' },
  { id: 'AVL', name: 'Aston Villa', code: 'AVL', color: '#670e36' },
  { id: 'BHA', name: 'Brighton & Hove Albion', code: 'BHA', color: '#0057b8' },
  { id: 'WHU', name: 'West Ham United', code: 'WHU', color: '#7a263a' },
  { id: 'FUL', name: 'Fulham', code: 'FUL', color: '#cc0000' },
  { id: 'CRY', name: 'Crystal Palace', code: 'CRY', color: '#1b458f' },
  { id: 'BOU', name: 'AFC Bournemouth', code: 'BOU', color: '#da291c' },
  { id: 'WOL', name: 'Wolverhampton Wanderers', code: 'WOL', color: '#fdb913' },
  { id: 'EVE', name: 'Everton', code: 'EVE', color: '#153c85' },
  { id: 'BRE', name: 'Brentford', code: 'BRE', color: '#e30613' },
  { id: 'NFO', name: 'Nottingham Forest', code: 'NFO', color: '#dd0000' },
  { id: 'LEI', name: 'Leicester City', code: 'LEI', color: '#003090' },
  { id: 'SOU', name: 'Southampton', code: 'SOU', color: '#d71920' },
  { id: 'IPS', name: 'Ipswich Town', code: 'IPS', color: '#003399' }
];

function DesktopSortableClubItem({ club, index }: { club: (typeof PREMIER_LEAGUE_CLUBS)[0]; index: number }) {
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
  };

  const isUCL = index < 4;
  const isRelegation = index >= 17;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-[12px] p-[10px_14px] rounded-[10px] bg-[var(--surface-card)] border select-none cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? 'border-[var(--color-brand)] shadow-[var(--elev-3)] opacity-90 scale-[1.02]'
          : isUCL
          ? 'border-[rgba(59,130,246,0.35)] hover:border-[var(--color-brand)]'
          : isRelegation
          ? 'border-[rgba(239,68,68,0.35)] hover:border-[var(--color-brand)]'
          : 'border-[var(--surface-border)] hover:border-[var(--surface-border-strong)]'
      }`}
    >
      <span
        className={`w-[26px] font-heading font-bold text-[12.5px] font-tabular-nums text-center ${
          isUCL ? 'text-[var(--color-brand)]' : isRelegation ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {index + 1}
      </span>

      <span
        className="w-[28px] h-[28px] rounded-[7px] flex-none grid place-items-center font-heading font-bold text-[10px] text-white"
        style={{ background: club.color }}
      >
        {club.code}
      </span>

      <span className="font-heading font-semibold text-[13px] flex-1 truncate">{club.name}</span>

      <span className="text-[13px] text-[var(--text-muted)] opacity-60">⠿</span>
    </div>
  );
}

export function StandingsPickerDesktop({
  onSave,
  onBack
}: {
  onSave: (standings: string[]) => void;
  onBack: () => void;
}) {
  const [clubs, setClubs] = useState(PREMIER_LEAGUE_CLUBS);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setClubs((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleReset = () => {
    setClubs(PREMIER_LEAGUE_CLUBS);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)] overflow-y-auto">
      <div className="max-w-[1200px] w-full mx-auto p-[32px] flex flex-col gap-[24px]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-[16px] border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-[16px]">
            <button
              onClick={onBack}
              className="h-[38px] px-[14px] rounded-[10px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] text-[13px] font-heading font-semibold flex items-center gap-[6px] transition-colors cursor-pointer"
            >
              <span>‹</span> Back
            </button>
            <div>
              <h1 className="font-heading font-bold text-[18px]">Season Table Prediction</h1>
              <p className="text-[11.5px] text-[var(--text-muted)]">
                Drag and drop clubs into your predicted 1–20 final table order
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              onClick={handleReset}
              className="h-[38px] px-[14px] rounded-[10px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] text-[12px] font-heading font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => onSave(clubs.map((c) => c.id))}
              className="h-[40px] px-[22px] rounded-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-heading font-bold text-[13px] shadow-[var(--elev-glow)] transition-all cursor-pointer"
            >
              Save Table Prediction
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-[20px] text-[11.5px] text-[var(--text-secondary)] bg-[var(--surface-card)] p-[12px_20px] rounded-[12px] border border-[var(--surface-border)]">
          <div className="flex items-center gap-[8px]">
            <span className="w-[10px] h-[10px] rounded-full bg-[var(--color-brand)]" />
            <span>1–4: Champions League</span>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className="w-[10px] h-[10px] rounded-full bg-[var(--color-warning)]" />
            <span>5: Europa League</span>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className="w-[10px] h-[10px] rounded-full bg-[var(--color-danger)]" />
            <span>18–20: Relegation</span>
          </div>
        </div>

        {/* DND 2-Column Table Grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={clubs.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              {/* Left Column (Positions 1-10) */}
              <div className="flex flex-col gap-[8px] bg-[var(--surface-card)]/50 p-[16px] rounded-[16px] border border-[var(--surface-border)]">
                <span className="text-[11px] font-heading font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] pb-[4px]">
                  Top Half (1–10)
                </span>
                {clubs.slice(0, 10).map((club, idx) => (
                  <DesktopSortableClubItem key={club.id} club={club} index={idx} />
                ))}
              </div>

              {/* Right Column (Positions 11-20) */}
              <div className="flex flex-col gap-[8px] bg-[var(--surface-card)]/50 p-[16px] rounded-[16px] border border-[var(--surface-border)]">
                <span className="text-[11px] font-heading font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] pb-[4px]">
                  Bottom Half (11–20)
                </span>
                {clubs.slice(10, 20).map((club, idx) => (
                  <DesktopSortableClubItem key={club.id} club={club} index={idx + 10} />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
