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

function DynamicSortableClubItem({ club, index }: { club: CatalogueTeam; index: number }) {
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

      {club.logoUrl ? (
        <div className="w-[28px] h-[28px] relative flex-none rounded-[6px] overflow-hidden bg-[var(--surface-subtle)] p-[2px]">
          <Image src={club.logoUrl} alt={club.displayName} fill className="object-contain" />
        </div>
      ) : (
        <span className="w-[28px] h-[28px] rounded-[7px] flex-none grid place-items-center font-heading font-bold text-[10px] text-white bg-[var(--color-brand)]">
          {club.code || club.displayName.slice(0, 3).toUpperCase()}
        </span>
      )}

      <span className="font-heading font-semibold text-[13px] flex-1 truncate">{club.displayName}</span>

      <span className="text-[13px] text-[var(--text-muted)] opacity-60">⠿</span>
    </div>
  );
}

export function StandingsPickerDesktop({
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

  // Tournament / Knockout State
  const [uclWinner, setUclWinner] = useState('');
  const [uclFinalist, setUclFinalist] = useState('');
  const [uclSemis, setUclSemis] = useState<string[]>([]);

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
      if (teams.length > 3) {
        setUclSemis(teams.slice(2, 4).map((t) => t.displayName));
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

  const handleReset = () => {
    setOrderedTeams(teams);
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
        text: `Tournament Champion: ${uclWinner} | Finalist: ${uclFinalist} | Semi-Finalists: ${uclWinner}, ${uclFinalist}, ${uclSemis.join(', ')}`
      };
      onSave({
        mode: 'ucl',
        formattedAnswer,
        rawData: { uclWinner, uclFinalist, uclSemis }
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

  const selectedComp = competitions?.find((c) => c.id === selectedCompId) || competitions?.[0];
  const compName = selectedComp?.displayName || 'League';
  const isCup = selectedComp?.kind === 'tournament' || selectedComp?.kind === 'cup' || selectedComp?.slug?.includes('champions');

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
              <h1 className="font-heading font-bold text-[18px]">{compName} Season Prediction</h1>
              <p className="text-[11.5px] text-[var(--text-muted)]">
                Dynamically fetched from catalogue tournament squads ({orderedTeams.length} teams)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[12px]">
            {mode === 'full_table' && (
              <button
                onClick={handleReset}
                className="h-[38px] px-[14px] rounded-[10px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] text-[12px] font-heading font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                Reset Table
              </button>
            )}
            <button
              onClick={handleSavePrediction}
              disabled={isSaving || isLoadingTeams || orderedTeams.length === 0}
              className="h-[40px] px-[22px] rounded-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-heading font-bold text-[13px] shadow-[var(--elev-glow)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save as Custom Question Answer'}
            </button>
          </div>
        </div>

        {/* Competition Selector */}
        {competitions && competitions.length > 0 && (
          <div className="flex items-center gap-[8px] overflow-x-auto pb-[4px]">
            <span className="text-[11.5px] font-heading font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mr-[4px]">
              Tournament:
            </span>
            {competitions.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectComp && onSelectComp(c.id)}
                className={`h-[32px] px-[14px] rounded-[8px] text-[12px] font-heading font-semibold transition-all cursor-pointer ${
                  selectedCompId === c.id
                    ? 'bg-[var(--color-brand)] text-white shadow-sm'
                    : 'bg-[var(--surface-card)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {c.displayName}
              </button>
            ))}
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-[8px] bg-[var(--surface-card)] p-[4px] rounded-[12px] border border-[var(--surface-border)] self-start">
          {[
            { id: 'milestones', label: `1. ${compName} Milestones (Champion / Top Spots)` },
            { id: 'full_table', label: `2. Complete Table Order (${orderedTeams.length} Clubs)` },
            { id: 'ucl', label: `3. ${isCup ? compName : 'Tournament'} Knockout Road` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`h-[34px] px-[16px] rounded-[8px] text-[12px] font-heading font-semibold transition-all cursor-pointer ${
                mode === tab.id
                  ? 'bg-[var(--color-brand)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoadingTeams || orderedTeams.length === 0 ? (
          <div className="p-[60px] text-center text-[var(--text-muted)] font-heading font-semibold">
            Fetching tournament clubs from catalogue...
          </div>
        ) : (
          <>
            {/* Mode 1: Milestones */}
            {mode === 'milestones' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                {/* League Winner & Top 4 */}
                <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)] flex flex-col gap-[20px]">
                  <div>
                    <label className="block font-heading font-bold text-[13.5px] mb-[4px]">
                      🏆 1. Champion / 1st Place
                    </label>
                    <p className="text-[11.5px] text-[var(--text-muted)] mb-[10px]">Select the title winner (25 pts)</p>
                    <select
                      value={winner}
                      onChange={(e) => setWinner(e.target.value)}
                      className="w-full h-[44px] px-[12px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13.5px] font-heading font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)]"
                    >
                      {orderedTeams.map((c) => (
                        <option key={c.id} value={c.displayName}>
                          {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-[16px] border-t border-[var(--surface-border)]">
                    <label className="block font-heading font-bold text-[13.5px] mb-[4px]">
                      🔵 2. Top 4 Finishers (Champions League Spots)
                    </label>
                    <p className="text-[11.5px] text-[var(--text-muted)] mb-[10px]">
                      Pick 4 clubs to secure UCL qualification ({top4.length}/4 selected)
                    </p>
                    <div className="grid grid-cols-2 gap-[8px] max-h-[260px] overflow-y-auto pr-[2px]">
                      {orderedTeams.map((c) => {
                        const sel = top4.includes(c.displayName);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleMultiSelect(c.displayName, top4, setTop4, 4)}
                            className={`h-[36px] px-[10px] rounded-[8px] text-[12px] font-heading font-semibold text-left flex items-center justify-between border transition-all cursor-pointer ${
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
                </div>

                {/* European Spots & Relegation */}
                <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)] flex flex-col gap-[20px]">
                  <div>
                    <label className="block font-heading font-bold text-[13.5px] mb-[4px]">
                      🟠 3. European Qualification (5th & 6th Place)
                    </label>
                    <p className="text-[11.5px] text-[var(--text-muted)] mb-[10px]">
                      Pick 2 clubs for Europa / Conference League ({europe.length}/2 selected)
                    </p>
                    <div className="grid grid-cols-2 gap-[8px] max-h-[140px] overflow-y-auto pr-[2px]">
                      {orderedTeams.map((c) => {
                        const sel = europe.includes(c.displayName);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleMultiSelect(c.displayName, europe, setEurope, 2)}
                            className={`h-[36px] px-[10px] rounded-[8px] text-[12px] font-heading font-semibold text-left flex items-center justify-between border transition-all cursor-pointer ${
                              sel
                                ? 'bg-[var(--warn-surface)] border-[var(--color-warning)] text-[var(--warn-text)]'
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

                  <div className="pt-[16px] border-t border-[var(--surface-border)]">
                    <label className="block font-heading font-bold text-[13.5px] mb-[4px]">
                      🔴 4. Relegation Spots
                    </label>
                    <p className="text-[11.5px] text-[var(--text-muted)] mb-[10px]">
                      Pick the 3 relegated clubs ({relegated.length}/3 selected)
                    </p>
                    <div className="grid grid-cols-2 gap-[8px] max-h-[180px] overflow-y-auto pr-[2px]">
                      {orderedTeams.map((c) => {
                        const sel = relegated.includes(c.displayName);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleMultiSelect(c.displayName, relegated, setRelegated, 3)}
                            className={`h-[36px] px-[10px] rounded-[8px] text-[12px] font-heading font-semibold text-left flex items-center justify-between border transition-all cursor-pointer ${
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
              </div>
            )}

            {/* Mode 2: Full Drag & Drop Table */}
            {mode === 'full_table' && (
              <div className="flex flex-col gap-[16px]">
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
                    <span>Bottom: Relegation</span>
                  </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={orderedTeams.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                      <div className="flex flex-col gap-[8px] bg-[var(--surface-card)]/50 p-[16px] rounded-[16px] border border-[var(--surface-border)]">
                        <span className="text-[11px] font-heading font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] pb-[4px]">
                          Top Half
                        </span>
                        {orderedTeams.slice(0, Math.ceil(orderedTeams.length / 2)).map((club, idx) => (
                          <DynamicSortableClubItem key={club.id} club={club} index={idx} />
                        ))}
                      </div>

                      <div className="flex flex-col gap-[8px] bg-[var(--surface-card)]/50 p-[16px] rounded-[16px] border border-[var(--surface-border)]">
                        <span className="text-[11px] font-heading font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] pb-[4px]">
                          Bottom Half
                        </span>
                        {orderedTeams.slice(Math.ceil(orderedTeams.length / 2)).map((club, idx) => (
                          <DynamicSortableClubItem
                            key={club.id}
                            club={club}
                            index={idx + Math.ceil(orderedTeams.length / 2)}
                          />
                        ))}
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Mode 3: Tournament / Knockout Road */}
            {mode === 'ucl' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)] flex flex-col gap-[12px]">
                  <h2 className="font-heading font-bold text-[14px]">👑 Tournament Champion</h2>
                  <p className="text-[11.5px] text-[var(--text-muted)]">Select Champion (30 pts)</p>
                  <select
                    value={uclWinner}
                    onChange={(e) => setUclWinner(e.target.value)}
                    className="w-full h-[44px] px-[12px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13.5px] font-heading font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)]"
                  >
                    {orderedTeams.map((c) => (
                      <option key={c.id} value={c.displayName}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)] flex flex-col gap-[12px]">
                  <h2 className="font-heading font-bold text-[14px]">🥈 Runner-Up Finalist</h2>
                  <p className="text-[11.5px] text-[var(--text-muted)]">Select the other finalist (20 pts)</p>
                  <select
                    value={uclFinalist}
                    onChange={(e) => setUclFinalist(e.target.value)}
                    className="w-full h-[44px] px-[12px] rounded-[10px] bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] text-[13.5px] font-heading font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)]"
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

                <div className="rounded-[18px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[24px] shadow-[var(--elev-2)] flex flex-col gap-[12px]">
                  <h2 className="font-heading font-bold text-[14px]">🛡 Semi-Finalists (Other 2)</h2>
                  <p className="text-[11.5px] text-[var(--text-muted)]">
                    Pick the other 2 semi-finalists ({uclSemis.length}/2)
                  </p>
                  <div className="flex flex-col gap-[6px] max-h-[220px] overflow-y-auto pr-[2px]">
                    {orderedTeams
                      .filter((c) => c.displayName !== uclWinner && c.displayName !== uclFinalist)
                      .map((c) => {
                        const sel = uclSemis.includes(c.displayName);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleMultiSelect(c.displayName, uclSemis, setUclSemis, 2)}
                            className={`h-[34px] px-[10px] rounded-[8px] text-[12px] font-heading font-semibold text-left flex items-center justify-between border transition-all cursor-pointer ${
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
