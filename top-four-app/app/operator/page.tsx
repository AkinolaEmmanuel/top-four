'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOperatorStats, useResolveJob } from '@/hooks/api/useOperator';
import { useAuth } from '@/context/auth-context';

const BRAND = "var(--color-brand)";

const QUEUE_DEFS = [
  { id: "settlement", label: "Settlement review" },
  { id: "late", label: "Late corrections" },
  { id: "provider", label: "Provider issues" },
  { id: "jobs", label: "Exhausted jobs" },
  { id: "notifications", label: "Failed notifications" }
];

const REASON_CODES = ["teamsheet_confirmed", "source_correction_applied", "insufficient_evidence"];

export default function OperatorConsolePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [queue, setQueue] = useState<string>("settlement");
  const [tool, setTool] = useState<string | null>(null);
  
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(0);
  
  const [action, setAction] = useState<string>("settle");
  const [reason, setReason] = useState<string>("teamsheet_confirmed");
  
  const [confirm, setConfirm] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: statsData, isLoading } = useOperatorStats();
  const resolveJob = useResolveJob();
  const { user } = useAuth();

  // Derive queue metadata from live API data
  const queues = QUEUE_DEFS.map(def => {
    const items = statsData ? (statsData as any)[def.id] || [] : [];
    const count = items.length;
    const oldest = count > 0 ? items[0]?.age || "—" : "clear";
    const hasOldItems = items.some((item: any) => item.old);
    return {
      ...def,
      count,
      oldest,
      warn: hasOldItems && count > 0,
      danger: def.id === "provider" && hasOldItems
    };
  });

  const qid = queue;
  const activeRows = statsData ? (statsData as any)[qid] || [] : [];
  const rowsData = tool ? [] : activeRows;
  const sel = selected;
  const isReady = !isLoading;
  const row = sel != null ? rowsData[sel] : null;
  const settle = action === "settle";

  const commit = useCallback(() => {
    if (!confirm && !conflict) return setConfirm(true);
    if (sel === null) return;
    const jobId = rowsData[sel]?.id || 'unknown';
    
    resolveJob.mutate({ jobId, action }, {
      onSuccess: () => {
        setConfirm(false);
        setConflict(false);
        setToast(`Resolved job ${jobId} via ${action}`);
        setTimeout(() => setToast(null), 3000);
      }
    });
  }, [action, confirm, conflict, rowsData, sel, resolveJob]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (conflict) { if (k === "escape" || k === "enter") setConflict(false); return; }
      if (confirm) {
        if (k === "escape") setConfirm(false);
        else if (k === "enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
        return;
      }
      
      if (k === "j") setCursor(c => Math.min(rowsData.length - 1, c + 1));
      else if (k === "k") setCursor(c => Math.max(0, c - 1));
      else if (k === "enter") setSelected(cursor);
      else if (k === "a" && selected != null) setAction("settle");
      else if (k === "r" && selected != null) setAction("void");
      else if (k === "escape") setSelected(null);
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [conflict, confirm, cursor, rowsData, selected, commit]);

  const currentQueue = queues.find(q => q.id === queue);

  return (
    <div className={`min-h-[100dvh] box-border p-[32px] flex flex-col gap-[16px] items-center font-['Sora',sans-serif] bg-[var(--dev-backdrop)] ${theme === 'dark' ? 'dark' : ''}`}>
      
      <div className="w-[1280px] flex items-end gap-[22px]">
        <div className="flex-1 flex flex-col gap-[4px]">
          <div className="font-heading font-bold text-[20px] tracking-[-0.2px] text-[var(--dev-strong)]">Operator console</div>
          <div className="text-[12px] text-[var(--dev-quiet)]">Hi-fi, 1280px. Keyboard first: <strong>J</strong> / <strong>K</strong> move through the queue, <strong>Enter</strong> opens the decision, <strong>A</strong> settles, <strong>R</strong> voids, <strong>⌘↵</strong> confirms, <strong>Esc</strong> closes.</div>
        </div>
        <div onClick={() => setConflict(true)} className="flex-none p-[8px_12px] rounded-[9px] border border-[var(--dev-field)] bg-[var(--dev-card)] font-heading font-semibold text-[12px] text-[var(--dev-text)] cursor-pointer">Simulate a version conflict</div>
        <div className="flex gap-[5px] flex-none">
          {[
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" }
          ].map(t => (
            <div key={t.id} onClick={() => setTheme(t.id as any)} className={`p-[8px_12px] rounded-[9px] text-[12px] font-heading font-semibold cursor-pointer border ${theme === t.id ? 'border-[var(--dev-strong)] bg-[var(--dev-strong)] text-[var(--dev-card)]' : 'border-[var(--dev-field)] bg-[var(--dev-card)] text-[var(--dev-text)]'}`}>{t.label}</div>
          ))}
        </div>
      </div>

      <div className="w-[1280px] h-[760px] rounded-[14px] overflow-hidden relative flex flex-col bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-[var(--elev-4)] text-[var(--text-primary)]">
        
        <div className="flex-none flex items-center gap-[14px] p-[12px_20px] bg-[var(--nav-surface)] border-b border-[var(--surface-border)]">
          <div className="font-heading font-bold text-[15px] text-white">TopFour</div>
          <div className="text-[10px] tracking-[0.12em] uppercase p-[3px_9px] rounded-full bg-[rgba(255,255,255,0.14)] text-white">Operator</div>
          <div className="flex-1"></div>
          <div className="text-[11.5px] text-[rgba(255,255,255,0.65)]">{user?.email || ''}</div>
        </div>

        <div className="flex-1 flex items-stretch min-h-0">
          
          <div className="w-[214px] flex-none border-r border-[var(--surface-border)] bg-[var(--surface-canvas)] flex flex-col p-[12px_0]">
            <div className="p-[6px_16px_8px] text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Queues</div>
            {queues.map(q => {
              const on = !tool && q.id === queue;
              return (
                <div key={q.id} onClick={() => { setQueue(q.id); setTool(null); setCursor(0); setSelected(0); setConfirm(false); }} className={`flex items-center gap-[9px] p-[9px_16px] cursor-pointer border-l-[3px] ${on ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border-transparent'}`}>
                  <span className={`flex-1 text-[12.5px] ${on ? 'font-heading font-semibold text-[var(--accent-text-strong)]' : 'text-[var(--text-secondary)]'}`}>{q.label}</span>
                  <span className={`font-heading font-semibold text-[11.5px] font-tabular-nums ${q.danger ? 'text-[var(--danger-text)]' : on ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-secondary)]'}`}>{q.count}</span>
                </div>
              );
            })}
            
            <div className="p-[18px_16px_8px] text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Tools</div>
            {[
              { id: "consistency", label: "League consistency" },
              { id: "refresh", label: "Fact refresh" }
            ].map(t => {
              const on = tool === t.id;
              return (
                <div key={t.id} onClick={() => { setTool(t.id); setSelected(null); setConfirm(false); }} className={`flex items-center gap-[9px] p-[9px_16px] cursor-pointer border-l-[3px] ${on ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border-transparent'}`}>
                  <span className={`flex-1 text-[12.5px] ${on ? 'font-heading font-semibold text-[var(--accent-text-strong)]' : 'text-[var(--text-secondary)]'}`}>{t.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            
            <div className="flex-none flex gap-[12px] p-[16px_20px] border-b border-[var(--surface-border)]">
              {queues.map(q => {
                const hot = q.danger;
                return (
                  <div key={q.id} className={`flex-1 basis-0 rounded-[12px] p-[12px_14px] flex flex-col gap-[4px] min-w-0 ${hot ? 'border border-[var(--color-danger)] bg-[rgba(239,68,68,0.1)]' : 'border border-[var(--surface-border)]'}`}>
                    <div className={`text-[10px] tracking-[0.08em] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${hot ? 'text-[var(--danger-text)]' : 'text-[var(--text-secondary)]'}`}>{q.label}</div>
                    <div className={`font-heading font-bold text-[22px] tracking-[-0.4px] ${hot ? 'text-[var(--danger-text)]' : q.count === 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{q.count}</div>
                    <div className={`text-[10.5px] ${hot ? 'text-[var(--danger-text)]' : q.warn ? 'text-[var(--warn-text)]' : 'text-[var(--text-secondary)]'}`}>{q.count === 0 ? "clear" : "oldest " + q.oldest}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 flex items-stretch min-h-0">
              
              <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--surface-border)]">
                <div className="flex-none flex items-center gap-[12px] p-[13px_20px] border-b border-[var(--surface-border)]">
                  <div className="flex-1 font-heading font-semibold text-[14px]">{tool ? "League consistency" : ((currentQueue?.label || '') + " · " + (currentQueue?.count || 0))}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">oldest first</div>
                </div>

                {tool ? (
                  <div className="tf-scroll flex-1 flex flex-col gap-[13px] p-[20px] overflow-y-auto">
                    <div className="max-w-[520px] flex flex-col gap-[12px] bg-[var(--surface-canvas)] border border-[var(--surface-border)] rounded-[12px] p-[16px_18px]">
                      <div className="font-heading font-semibold text-[15px]">Premier Predictors</div>
                      <div className="flex flex-col gap-[6px]">
                        {[
                          { label: "Standing total mismatches", value: "—", bad: false },
                          { label: "Ledger orphans", value: "—" },
                          { label: "Missing settlements", value: "—" },
                          { label: "Duplicate awards", value: "—" }
                        ].map((c, i) => (
                          <div key={i} className="flex justify-between items-baseline gap-[12px]">
                            <span className="text-[12px] text-[var(--text-secondary)]">{c.label}</span>
                            <span className={`font-heading text-[12px] ${c.bad ? 'font-bold text-[var(--danger-text)]' : 'font-semibold'}`}>{c.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="min-h-[44px] box-border border border-[var(--surface-border-strong)] rounded-[10px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px]">Rebuild standings</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-none flex gap-[12px] p-[9px_20px] border-b border-[var(--surface-border)] bg-[var(--surface-canvas)]">
                      <span className="w-[101px] flex-none text-[10px] tracking-[0.08em] uppercase text-[var(--text-secondary)]">Age</span>
                      <span className="flex-1 text-[10px] tracking-[0.08em] uppercase text-[var(--text-secondary)]">Fixture</span>
                      <span className="w-[150px] flex-none text-[10px] tracking-[0.08em] uppercase text-[var(--text-secondary)]">Market</span>
                      <span className="w-[170px] flex-none text-[10px] tracking-[0.08em] uppercase text-[var(--text-secondary)]">Reason</span>
                      <span className="w-[76px] flex-none text-right text-[10px] tracking-[0.08em] uppercase text-[var(--text-secondary)]">Affected</span>
                    </div>
                    <div className="tf-scroll flex-1 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-[60px_30px] flex flex-col gap-[6px] items-center text-center">
                          <div className="font-heading font-semibold text-[14px] text-[var(--text-muted)]">Loading…</div>
                        </div>
                      ) : rowsData.map((r: any, i: number) => {
                        const on = i === selected;
                        const cur = i === cursor;
                        return (
                          <div key={r.id || i} onClick={() => { setSelected(i); setCursor(i); }} className={`flex gap-[12px] items-center p-[12px_20px] cursor-pointer border-b border-[var(--surface-border)] border-l-[3px] ${on ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : cur ? 'border-[var(--surface-border-strong)] bg-[var(--surface-subtle)]' : 'border-transparent'}`}>
                            <span className={`w-[101px] flex-none font-heading font-tabular-nums text-[12px] ${r.old ? 'font-bold text-[var(--warn-text)]' : 'font-semibold text-[var(--text-primary)]'}`}>{r.age}</span>
                            <span className={`flex-1 min-w-0 text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${on ? 'font-heading font-semibold' : ''}`}>{r.fixture}</span>
                            <span className="w-[150px] flex-none text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">{r.market}</span>
                            <span className="w-[170px] flex-none text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">{r.reason}</span>
                            <span className={`w-[76px] flex-none text-right text-[11.5px] font-tabular-nums ${on ? 'font-heading font-semibold' : ''}`}>{r.affected}</span>
                          </div>
                        );
                      })}
                      {!isLoading && rowsData.length === 0 && (
                        <div className="p-[60px_30px] flex flex-col gap-[6px] items-center text-center">
                          <div className="font-heading font-semibold text-[14px]">This queue is clear</div>
                          <div className="text-[12px] text-[var(--text-secondary)]">Nothing is waiting on an operator here.</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-none flex items-center justify-between p-[12px_20px] border-t border-[var(--surface-border)]">
                      <span className="text-[11px] text-[var(--text-secondary)]">{rowsData.length} shown</span>
                      <div className="p-[8px_13px] rounded-[10px] border border-[var(--surface-border-strong)] cursor-pointer font-heading font-semibold text-[11.5px]">Load more</div>
                    </div>
                  </>
                )}
              </div>

              <div className="w-[352px] flex-none flex flex-col bg-[var(--surface-canvas)] min-h-0">
                {row ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-none p-[14px_18px] border-b border-[var(--surface-border)] flex items-start gap-[10px]">
                      <div className="flex-1 flex flex-col gap-[3px] min-w-0">
                        <div className="font-heading font-semibold text-[14px]">Decision</div>
                        <div className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">{row.fixture} · {row.market}</div>
                      </div>
                      <div onClick={() => setSelected(null)} className="w-[26px] h-[26px] flex-none rounded-full border border-[var(--surface-border-strong)] flex justify-center items-center text-[12px] text-[var(--text-secondary)] cursor-pointer">×</div>
                    </div>
                    <div className="tf-scroll flex-1 overflow-y-auto flex flex-col gap-[14px] p-[14px_18px]">
                      <div className="flex flex-col gap-[8px]">
                        <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Evidence</div>
                        {[
                          { label: "Review reason", value: row.reason },
                          { label: "Members affected", value: String(row.affected) },
                          { label: "Waiting", value: row.age, warn: true }
                        ].map((e, i) => (
                          <div key={i} className="flex justify-between items-baseline gap-[12px]">
                            <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{e.label}</span>
                            <span className={`text-[11.5px] text-right font-heading font-semibold ${e.warn ? 'text-[var(--warn-text)]' : ''}`}>{e.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-[11px_13px] rounded-[10px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                        <span className="text-[11.5px] text-[var(--text-secondary)] leading-[1.5]">Settling on current facts awards on the teamsheet as it stands. Voiding pays nobody and reverses anything already awarded.</span>
                      </div>
                      <div className="flex flex-col gap-[8px]">
                        <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Action</div>
                        {[
                          { id: "settle", label: "Settle on current facts", key: "A" },
                          { id: "void", label: "Void this market", key: "R" }
                        ].map(a => {
                          const on = action === a.id;
                          return (
                            <div key={a.id} onClick={() => setAction(a.id)} className={`flex items-center gap-[10px] p-[11px_13px] rounded-[10px] cursor-pointer min-h-[44px] box-border ${on ? 'border border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border border-[var(--surface-border-strong)] bg-[var(--surface-card)]'}`}>
                              <span className={`w-[14px] h-[14px] rounded-full flex-none box-border ${on ? 'bg-[var(--color-brand)] border-[3px] border-[var(--surface-card)] shadow-[0_0_0_1px_var(--color-brand)]' : 'border border-[var(--surface-border-strong)]'}`}></span>
                              <span className={`flex-1 text-[12px] ${on ? 'font-heading font-semibold text-[var(--accent-text-strong)]' : ''}`}>{a.label}</span>
                              <span className="font-mono text-[10px] text-[var(--text-secondary)] flex-none">{a.key}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-col gap-[8px]">
                        <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Reason code</div>
                        {REASON_CODES.map(c => {
                          const on = reason === c;
                          return (
                            <div key={c} onClick={() => setReason(c)} className={`font-mono text-[11px] p-[9px_12px] rounded-[9px] cursor-pointer min-h-[36px] box-border flex items-center ${on ? 'border border-[var(--color-brand)] bg-[var(--accent-surface)] text-[var(--accent-text-strong)]' : 'border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-secondary)]'}`}>
                              {c}
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-[11px_13px] rounded-[10px] bg-[var(--warn-surface)] border border-[var(--color-warning)]">
                        <span className="text-[11.5px] text-[var(--text-primary)] leading-[1.5]">{row.affected} members will be notified, even if their points don't change.</span>
                      </div>
                    </div>
                    <div className="flex-none flex flex-col gap-[8px] p-[14px_18px] border-t border-[var(--surface-border)]">
                      <div onClick={() => setConfirm(true)} className={`min-h-[44px] rounded-[11px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[13px] text-white ${settle ? 'bg-[var(--brand-fill)]' : 'bg-[var(--color-danger)]'}`}>Review and confirm</div>
                      <div className="text-[10.5px] text-[var(--text-secondary)] text-center">One more step before anything is written.</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-[7px] justify-center items-center p-[30px] text-center">
                    <div className="font-heading font-semibold text-[13.5px]">No decision open</div>
                    <div className="text-[11.5px] text-[var(--text-secondary)] leading-[1.5]">Select a row, or press <strong>Enter</strong> on the highlighted one.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirm && row && (
        <div className="absolute inset-0 bg-[var(--control-scrim)] flex justify-center items-center p-[24px] box-border z-10">
          <div className="w-[420px] bg-[var(--surface-card)] rounded-[16px] p-[18px_20px] flex flex-col gap-[12px] animate-[tfin_0.16s_ease] shadow-[var(--elev-4)]">
            <div className="font-mono text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Confirm step</div>
            <div className="font-heading font-semibold text-[15.5px] leading-[1.35]">
              {settle ? "Settle " + row.market + " on current facts?" : "Void " + row.market + "?"}
            </div>
            <div className="flex flex-col gap-[6px] p-[12px_14px] rounded-[11px] bg-[var(--surface-canvas)] border border-[var(--surface-border)]">
              {[
                { label: "Members affected", value: String(row.affected) },
                { label: "Action", value: settle ? "Settle on current facts" : "Void this market" }
              ].map((e, i) => (
                <div key={i} className="flex justify-between items-baseline gap-[12px]">
                  <span className="text-[11.5px] text-[var(--text-secondary)]">{e.label}</span>
                  <span className="font-heading font-semibold text-[11.5px] font-tabular-nums">{e.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-[8px]">
              <div onClick={() => setConfirm(false)} className="flex-1 min-h-[44px] border border-[var(--surface-border-strong)] rounded-[11px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px]">Cancel</div>
              <div onClick={commit} className={`flex-1 min-h-[44px] rounded-[11px] flex justify-center items-center gap-[8px] cursor-pointer font-heading font-semibold text-[12.5px] text-white ${settle ? 'bg-[var(--brand-fill)]' : 'bg-[var(--color-danger)]'}`}>
                <span>{settle ? "Settle now" : "Void now"}</span>
                <span className="font-mono text-[10px] opacity-75">⌘↵</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {conflict && (
        <div className="absolute inset-0 bg-[var(--control-scrim)] flex justify-center items-center p-[24px] box-border z-10">
          <div className="w-[420px] bg-[var(--surface-card)] rounded-[16px] p-[18px_20px] flex flex-col gap-[12px] animate-[tfin_0.16s_ease] shadow-[var(--elev-4)]">
            <div className="font-mono text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Version conflict</div>
            <div className="font-heading font-semibold text-[15.5px] leading-[1.35]">The facts changed while you were reading</div>
            <div className="text-[12.5px] text-[var(--text-secondary)] leading-[1.55]">This settlement was updated since you opened it. Re-read it before deciding — the evidence may no longer support the same call.</div>
            <div onClick={() => setConflict(false)} className="min-h-[44px] rounded-[11px] bg-[var(--brand-fill)] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px] text-[var(--color-on-brand)]">Reload this decision</div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute left-[50%] bottom-[22px] translate-x-[-50%] p-[11px_16px] rounded-[11px] bg-[var(--nav-surface)] text-[var(--nav-text)] flex items-center gap-[10px] animate-[tfin_0.16s_ease] shadow-[var(--elev-3)] z-20">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-success)] flex-none"></span>
          <span className="text-[12px]">{toast}</span>
        </div>
      )}
    </div>
  );
}
