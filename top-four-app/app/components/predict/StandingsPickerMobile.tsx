'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { CatalogueTeam, CatalogueCompetition } from '@/lib/api/catalogue';

function DynamicSortableClubItemMobile({ club, index }: { club: CatalogueTeam; index: number }) {
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
      className={`flex items-center gap-[10px] p-[10px_12px] rounded-[10px] bg-[var(--surface-card)] border select-none cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'border-[var(--color-brand)] shadow-md scale-[1.02]'
          : isUCL
          ? 'border-[rgba(59,130,246,0.35)]'
          : isRelegation
          ? 'border-[rgba(239,68,68,0.35)]'
          : 'border-[var(--surface-border)]'
      }`}
    >
      <span
        className={`w-[22px] font-heading font-bold text-[12px] font-tabular-nums text-center ${
          isUCL ? 'text-[var(--color-brand)]' : isRelegation ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {index + 1}
      </span>

      {club.logoUrl ? (
        <div className="w-[24px] h-[24px] relative flex-none rounded-[5px] overflow-hidden bg-[var(--surface-subtle)] p-[2px]">
          <Image src={club.logoUrl} alt={club.displayName} fill className="object-contain" />
        </div>
      ) : (
        <span className="w-[24px] h-[24px] rounded-[6px] flex-none grid place-items-center font-heading font-bold text-[9px] text-white bg-[var(--color-brand)]">
          {club.code || club.displayName.slice(0, 3).toUpperCase()}
        </span>
      )}

      <span className="font-heading font-semibold text-[12.5px] flex-1 truncate">{club.displayName}</span>

      <span className="text-[12px] text-[var(--text-muted)] opacity-50">⠿</span>
    </div>
  );
}

export function StandingsPickerMobile({
  teams = [],
  competitions = [],
  selectedCompId,
  onSelectComp,
  isLoadingTeams = false,
  onSave,
  onBack,
  isSaving = false
}: {
  teams: CatalogueTeam[];
  competitions?: CatalogueCompetition[];
  selectedCompId?: string;
  onSelectComp?: (id: string) => void;
  isLoadingTeams?: boolean;
  onSave: (payload: { mode: string; formattedAnswer: any; rawData: any }) => void;
  onBack: () => void;
  isSaving?: boolean;
}) {
  const [mode, setMode] = useState<'milestones' | 'full_table' | 'ucl'>('milestones');
  const [orderedTeams, setOrderedTeams] = useState<CatalogueTeam[]>(teams);

  // Milestones State
  const [winner, setWinner] = useState('');
  const [top4, setTop4] = useState<string[]>([]);
  const [europe, setEurope] = useState<string[]>([]);
  const [relegated, setRelegated] = useState<string[]>([]);

  // Tournament State
  const [uclWinner, setUclWinner] = useState('');
  const [uclFinalist, setUclFinalist] = useState('');

  useEffect(() => {
    if (teams && teams.length > 0) {
      setOrderedTeams(teams);
      setWinner(teams[0]?.displayName || '');
      setTop4(teams.slice(0, Math.min(4, teams.length)).map((t) => t.displayName));
      setEurope(teams.slice(4, Math.min(6, teams.length)).map((t) => t.displayName));
      if (teams.length >= 3) {
        setRelegated(teams.slice(-3).map((t) => t.displayName));
      }
      setUclWinner(teams[0]?.displayName || '');
      if (teams.length > 1) {
        setUclFinalist(teams[1]?.displayName || '');
      }
    }
  }, [teams]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedTeams((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSavePrediction = () => {
    if (mode === 'full_table') {
      const formattedAnswer = {
        text: orderedTeams.map((c, i) => `${i + 1}. ${c.displayName}`).join(', ')
      };
      onSave({ mode: 'full_table', formattedAnswer, rawData: orderedTeams.map((c) => c.id) });
    } else if (mode === 'milestones') {
      const formattedAnswer = {
        text: `Winner: ${winner} | Top 4: ${top4.join(', ')} | Europe: ${europe.join(', ')} | Relegated: ${relegated.join(', ')}`
      };
      onSave({
        mode: 'milestones',
        formattedAnswer,
        rawData: { winner, top4, europe, relegated }
      });
    } else {
      const formattedAnswer = {
        text: `Tournament Champion: ${uclWinner} | Finalist: ${uclFinalist}`
      };
      onSave({
        mode: 'ucl',
        formattedAnswer,
        rawData: { uclWinner, uclFinalist }
      });
    }
  };

  const toggleMultiSelect = (item: string, currentList: string[], setFn: (l: string[]) => void, max: number) => {
    if (currentList.includes(item)) {
      setFn(currentList.filter((x) => x !== item));
    } else {
      if (currentList.length < max) {
        setFn([...currentList, item]);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)] overflow-hidden">
      {/* Header */}
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[8px_var(--gutter)_12px] flex-none z-10">
        <div className="flex items-center gap-[11px]">
          <button
            onClick={onBack}
            className="w-[36px] h-[36px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-[16px] truncate">Standings Prediction</h1>
            <p className="text-[10.5px] text-[var(--nav-text-faint)]">Dynamic Tournament Teams</p>
          </div>
          <button
            onClick={handleSavePrediction}
            disabled={isSaving || isLoadingTeams || orderedTeams.length === 0}
            className="h-[34px] px-[14px] rounded-[8px] bg-[var(--color-brand)] text-white font-heading font-bold text-[11.5px] shadow-sm flex-none disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-[4px] mt-[12px] overflow-x-auto pb-[2px]">
          {[
            { id: 'milestones', label: 'Key Milestones' },
            { id: 'full_table', label: 'Full Table' },
            { id: 'ucl', label: 'Tournament Road' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`h-[28px] px-[12px] rounded-full text-[11px] font-heading font-semibold whitespace-nowrap flex-none transition-all ${
                mode === tab.id
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'bg-[rgba(255,255,255,0.08)] text-[var(--nav-text-quiet)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-[16px_var(--gutter)] flex flex-col gap-[16px]">
        {isLoadingTeams ? (
          <div className="p-[40px] text-center text-[var(--text-muted)] font-heading font-semibold">
            Loading tournament teams...
          </div>
        ) : (
          <>
            {mode === 'milestones' && (
              <div className="flex flex-col gap-[16px]">
                {/* Champion */}
                <div className="p-[14px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                  <label className="block font-heading font-bold text-[13px] mb-[2px]">🏆 Champion</label>
                  <p className="text-[11px] text-[var(--text-muted)] mb-[8px]">Pick 1st place title winner</p>
                  <select
                    value={winner}
                    onChange={(e) => setWinner(e.target.value)}
                    className="w-full h-[40px] px-[10px] rounded-[8px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13px] font-heading font-semibold text-[var(--text-primary)]"
                  >
                    {orderedTeams.map((c) => (
                      <option key={c.id} value={c.displayName}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Top 4 */}
                <div className="p-[14px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                  <label className="block font-heading font-bold text-[13px] mb-[2px]">
                    🔵 Top 4 Finishers ({top4.length}/4)
                  </label>
                  <div className="grid grid-cols-2 gap-[6px] mt-[8px]">
                    {orderedTeams.map((c) => {
                      const sel = top4.includes(c.displayName);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleMultiSelect(c.displayName, top4, setTop4, 4)}
                          className={`h-[32px] px-[8px] rounded-[6px] text-[11px] font-heading font-semibold text-left flex items-center justify-between border truncate ${
                            sel
                              ? 'bg-[var(--accent-surface)] border-[var(--color-brand)] text-[var(--color-brand)]'
                              : 'bg-[var(--surface-canvas)] border-[var(--surface-border-strong)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <span className="truncate">{c.displayName}</span>
                          {sel && <span className="font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Relegation */}
                <div className="p-[14px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                  <label className="block font-heading font-bold text-[13px] mb-[2px]">
                    🔴 Relegated Clubs ({relegated.length}/3)
                  </label>
                  <div className="grid grid-cols-2 gap-[6px] mt-[8px]">
                    {orderedTeams.map((c) => {
                      const sel = relegated.includes(c.displayName);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleMultiSelect(c.displayName, relegated, setRelegated, 3)}
                          className={`h-[32px] px-[8px] rounded-[6px] text-[11px] font-heading font-semibold text-left flex items-center justify-between border truncate ${
                            sel
                              ? 'bg-[rgba(239,68,68,0.12)] border-[var(--color-danger)] text-[var(--danger-text)]'
                              : 'bg-[var(--surface-canvas)] border-[var(--surface-border-strong)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <span className="truncate">{c.displayName}</span>
                          {sel && <span className="font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {mode === 'full_table' && (
              <div className="flex flex-col gap-[8px]">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={orderedTeams.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {orderedTeams.map((club, idx) => (
                      <DynamicSortableClubItemMobile key={club.id} club={club} index={idx} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {mode === 'ucl' && (
              <div className="flex flex-col gap-[14px]">
                <div className="p-[14px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                  <label className="block font-heading font-bold text-[13px] mb-[2px]">👑 Champion</label>
                  <select
                    value={uclWinner}
                    onChange={(e) => setUclWinner(e.target.value)}
                    className="w-full h-[40px] px-[10px] rounded-[8px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13px] font-heading font-semibold text-[var(--text-primary)]"
                  >
                    {orderedTeams.map((c) => (
                      <option key={c.id} value={c.displayName}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-[14px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                  <label className="block font-heading font-bold text-[13px] mb-[2px]">🥈 Runner-Up</label>
                  <select
                    value={uclFinalist}
                    onChange={(e) => setUclFinalist(e.target.value)}
                    className="w-full h-[40px] px-[10px] rounded-[8px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13px] font-heading font-semibold text-[var(--text-primary)]"
                  >
                    {orderedTeams
                      .filter((c) => c.displayName !== uclWinner)
                      .map((c) => (
                        <option key={c.id} value={c.displayName}>
                          {c.displayName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
