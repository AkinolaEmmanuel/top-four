'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  useSettlementReviews, useResolveSettlementDecision,
  useFactConflicts, useKeepCurrentFacts,
  useProviderIssues, useRetryProviderIssue,
  useExhaustedJobs, useRetryExhaustedJob,
  useFailedNotifications, useRetryFailedNotification,
  usePlatformStatus,
  useLeagueConsistency, useRequestStandingsRebuild, useRequestCompletionRecheck,
  useRequestFixtureFactsRefresh, useRequestFixturePlayersRefresh,
} from '@/hooks/api/useOperator';
import { SETTLE_REASON_CODES, VOID_REASON_CODES } from '@/lib/api/operator';

type QueueId = 'settlement' | 'late' | 'conflicts' | 'provider' | 'jobs' | 'notifications';

const QUEUE_DEFS: { id: QueueId; label: string }[] = [
  { id: 'settlement', label: 'Settlement review' },
  { id: 'late', label: 'Late corrections' },
  { id: 'conflicts', label: 'Fact conflicts' },
  { id: 'provider', label: 'Provider issues' },
  { id: 'jobs', label: 'Exhausted jobs' },
  { id: 'notifications', label: 'Failed notifications' },
];

const COLUMN_HEADERS: Record<QueueId, [string, string, string, string]> = {
  settlement: ['Age', 'Fixture · market', 'Reason', 'Version'],
  late: ['Age', 'Fixture · market', 'Reason', 'Version'],
  conflicts: ['Age', 'Fixture', 'Section', ''],
  provider: ['Age', 'Issue', 'Target', 'Retryable'],
  jobs: ['Age', 'Task', 'Attempts', ''],
  notifications: ['Age', 'Kind', 'Failure code', 'Attempts'],
};

function ageShort(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const short = (id: string | null | undefined) => id ? id.slice(0, 8) : '—';

function formatTarget(t: any): string {
  if (!t) return '—';
  if (t.kind === 'competition') return `Competition ${short(t.competitionId)}`;
  if (t.kind === 'season') return `Season ${short(t.seasonId)}`;
  if (t.kind === 'team') return `Team ${short(t.teamId)}`;
  if (t.kind === 'fixture') return `Fixture ${short(t.fixtureId)}`;
  return '—';
}

export default function OperatorConsolePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [queue, setQueue] = useState<QueueId>('settlement');
  const [tool, setTool] = useState<'consistency' | 'refresh' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [settleAction, setSettleAction] = useState<'settle_current_facts' | 'void'>('settle_current_facts');
  const [settleReason, setSettleReason] = useState<string>(SETTLE_REASON_CODES[0]);
  const [conflictNote, setConflictNote] = useState('');

  const [consistencyLeagueId, setConsistencyLeagueId] = useState('');
  const [refreshFixtureId, setRefreshFixtureId] = useState('');

  const { user, isLoading: authLoading } = useAuth();
  const isOperator = !!user?.isOperator;
  const { data: statusData } = usePlatformStatus(isOperator);

  const settlements = useSettlementReviews(isOperator);
  const conflicts = useFactConflicts(isOperator);
  const providerIssues = useProviderIssues(isOperator);
  const jobs = useExhaustedJobs(isOperator);
  const notifications = useFailedNotifications(isOperator);

  const resolveSettlement = useResolveSettlementDecision();
  const keepFacts = useKeepCurrentFacts();
  const retryProvider = useRetryProviderIssue();
  const retryJob = useRetryExhaustedJob();
  const retryNotification = useRetryFailedNotification();

  const consistency = useLeagueConsistency(consistencyLeagueId);
  const rebuildStandings = useRequestStandingsRebuild();
  const recheckCompletion = useRequestCompletionRecheck();
  const refreshFacts = useRequestFixtureFactsRefresh();
  const refreshPlayers = useRequestFixturePlayersRefresh();

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const settlementItems = settlements.data?.items || [];
  const settlementRows = useMemo(() => settlementItems.filter(s => s.state === 'pending_review'), [settlementItems]);
  const lateRows = useMemo(() => settlementItems.filter(s => s.state !== 'pending_review'), [settlementItems]);

  const isLoadingByQueue: Record<QueueId, boolean> = {
    settlement: settlements.isLoading,
    late: settlements.isLoading,
    provider: providerIssues.isLoading,
    conflicts: conflicts.isLoading,
    jobs: jobs.isLoading,
    notifications: notifications.isLoading,
  };

  const rawItemsByQueue: Record<QueueId, any[]> = {
    settlement: settlementRows,
    late: lateRows,
    conflicts: conflicts.data?.items || [],
    provider: providerIssues.data?.items || [],
    jobs: jobs.data?.items || [],
    notifications: notifications.data?.items || [],
  };

  const rowId = (q: QueueId, item: any): string =>
    q === 'settlement' || q === 'late' ? item.id
      : q === 'conflicts' ? item.id
      : q === 'provider' ? item.issueId
      : q === 'jobs' ? item.id
      : item.id;

  const toCols = (q: QueueId, item: any): [string, string, string, string] => {
    switch (q) {
      case 'settlement':
      case 'late':
        return [ageShort(item.updatedAt), `${short(item.leagueFixtureId)} · ${item.marketType}${item.side ? ` (${item.side})` : ''}`, item.reasonCode, `v${item.version}`];
      case 'conflicts':
        return [ageShort(item.createdAt), short(item.fixtureId), item.section, ''];
      case 'provider':
        return [ageShort(item.createdAt), item.issueKind === 'capability_failure' ? 'Capability failure' : 'Validation quarantine', formatTarget(item.target), item.retryable ? 'Yes' : 'No'];
      case 'jobs':
        return [ageShort(item.createdAt), item.taskIdentifier, `${item.attempts}/${item.maxAttempts}`, ''];
      case 'notifications':
        return [ageShort(item.failedAt), item.notificationKind, item.lastFailureCode || '—', String(item.deliveryAttempts)];
    }
  };

  const queues = QUEUE_DEFS.map(def => {
    const count = def.id === 'settlement' ? (statusData?.settlementReviewBacklog.count ?? rawItemsByQueue.settlement.length)
      : def.id === 'late' ? (statusData?.lateCorrections.count ?? rawItemsByQueue.late.length)
      : def.id === 'provider' ? (statusData?.providerIssues.count ?? rawItemsByQueue.provider.length)
      : def.id === 'jobs' ? (statusData?.exhaustedJobs.count ?? rawItemsByQueue.jobs.length)
      : def.id === 'notifications' ? (statusData?.failedNotifications.count ?? rawItemsByQueue.notifications.length)
      : rawItemsByQueue.conflicts.length;
    const oldestTimestamp = def.id === 'settlement' ? statusData?.settlementReviewBacklog.oldestTimestamp
      : def.id === 'late' ? statusData?.lateCorrections.oldestTimestamp
      : def.id === 'provider' ? statusData?.providerIssues.oldestTimestamp
      : def.id === 'jobs' ? statusData?.exhaustedJobs.oldestTimestamp
      : def.id === 'notifications' ? statusData?.failedNotifications.oldestTimestamp
      : null;
    const hasOldItems = !!oldestTimestamp && (Date.now() - new Date(oldestTimestamp).getTime()) > 24 * 3600 * 1000;
    return { ...def, count, oldest: oldestTimestamp ? ageShort(oldestTimestamp) : (count > 0 ? '—' : 'clear'), warn: hasOldItems && count > 0, danger: (def.id === 'provider' || def.id === 'conflicts') && hasOldItems };
  });

  const qid = queue;
  const rowsData = tool ? [] : rawItemsByQueue[qid];
  const isReady = !isLoadingByQueue[qid];
  const row = selected != null ? rowsData.find(r => rowId(qid, r) === selected) : null;
  const currentQueue = queues.find(q => q.id === queue);

  useEffect(() => {
    if (row && (queue === 'settlement' || queue === 'late')) {
      const codes = settleAction === 'settle_current_facts' ? SETTLE_REASON_CODES : VOID_REASON_CODES;
      if (!(codes as readonly string[]).includes(settleReason)) setSettleReason(codes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settleAction, row]);

  const actionLabel = (): string => {
    switch (queue) {
      case 'settlement':
      case 'late': return settleAction === 'settle_current_facts' ? 'Settle on current facts' : 'Void this market';
      case 'conflicts': return 'Keep current facts';
      case 'provider': return 'Retry sync';
      case 'jobs': return 'Retry job';
      case 'notifications': return 'Retry delivery';
    }
  };

  const canAct = (): boolean => {
    if (!row) return false;
    if (queue === 'conflicts') return conflictNote.trim().length > 0;
    if (queue === 'provider') return !!row.retryable;
    return true;
  };

  const commit = useCallback(() => {
    if (!row) return;
    if (queue === 'settlement' || queue === 'late') {
      resolveSettlement.mutate({ settlementId: row.id, expectedVersion: row.version, action: settleAction, reasonCode: settleReason }, {
        onSuccess: () => { setConfirm(false); setSelected(null); flash('Decision recorded'); },
        onError: () => { setConfirm(false); flash('Could not record that decision — it may have changed since you opened it'); }
      });
    } else if (queue === 'conflicts') {
      keepFacts.mutate({ conflictId: row.id, note: conflictNote }, {
        onSuccess: () => { setConfirm(false); setSelected(null); setConflictNote(''); flash('Kept current facts'); },
        onError: () => { setConfirm(false); flash('Could not resolve that conflict'); }
      });
    } else if (queue === 'provider') {
      retryProvider.mutate({ issueKind: row.issueKind, issueId: row.issueId }, {
        onSuccess: () => { setConfirm(false); setSelected(null); flash('Retry enqueued'); },
        onError: () => { setConfirm(false); flash('Could not retry that issue'); }
      });
    } else if (queue === 'jobs') {
      retryJob.mutate(row.id, {
        onSuccess: () => { setConfirm(false); setSelected(null); flash('Job rescheduled'); },
        onError: () => { setConfirm(false); flash('Could not retry that job'); }
      });
    } else if (queue === 'notifications') {
      retryNotification.mutate(row.id, {
        onSuccess: () => { setConfirm(false); setSelected(null); flash('Delivery retried'); },
        onError: () => { setConfirm(false); flash('Could not retry that notification'); }
      });
    }
  }, [row, queue, settleAction, settleReason, conflictNote, resolveSettlement, keepFacts, retryProvider, retryJob, retryNotification, flash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (confirm) {
        if (k === "escape") setConfirm(false);
        else if (k === "enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
        return;
      }
      if (k === "escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm, commit]);

  const isBusy = resolveSettlement.isPending || keepFacts.isPending || retryProvider.isPending || retryJob.isPending || retryNotification.isPending;

  if (authLoading) {
    return <div className="min-h-[100dvh] grid place-items-center font-['Sora',sans-serif] text-[13px] text-[var(--text-secondary)]">Loading…</div>;
  }

  if (!isOperator) {
    return (
      <div className="min-h-[100dvh] grid place-items-center font-['Sora',sans-serif] p-[24px]">
        <div className="max-w-[380px] flex flex-col items-center text-center gap-[8px]">
          <div className="font-heading font-bold text-[18px]">Operator access required</div>
          <div className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">This account isn't flagged as an operator, so the platform admin API refuses these routes. Sign in with an operator account to use this console.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] box-border p-[32px] flex flex-col gap-[16px] items-center font-['Sora',sans-serif] bg-[var(--dev-backdrop)] ${theme === 'dark' ? 'dark' : ''}`}>

      <div className="w-[1280px] flex items-end gap-[22px]">
        <div className="flex-1 flex flex-col gap-[4px]">
          <div className="font-heading font-bold text-[20px] tracking-[-0.2px] text-[var(--dev-strong)]">Operator console</div>
          <div className="text-[12px] text-[var(--dev-quiet)]">Six review queues plus two per-fixture/league admin tools, wired straight to the platform API. <strong>Esc</strong> closes a decision.</div>
        </div>
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

          <div className="w-[214px] flex-none border-r border-[var(--surface-border)] bg-[var(--surface-canvas)] flex flex-col p-[12px_0] overflow-y-auto">
            <div className="p-[6px_16px_8px] text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Queues</div>
            {queues.map(q => {
              const on = !tool && q.id === queue;
              return (
                <div key={q.id} onClick={() => { setQueue(q.id); setTool(null); setSelected(null); setConfirm(false); }} className={`flex items-center gap-[9px] p-[9px_16px] cursor-pointer border-l-[3px] ${on ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border-transparent'}`}>
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
                <div key={t.id} onClick={() => { setTool(t.id as any); setSelected(null); setConfirm(false); }} className={`flex items-center gap-[9px] p-[9px_16px] cursor-pointer border-l-[3px] ${on ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border-transparent'}`}>
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
                  <div className="flex-1 font-heading font-semibold text-[14px]">{tool ? (tool === 'consistency' ? 'League consistency' : 'Fact refresh') : ((currentQueue?.label || '') + " · " + (currentQueue?.count || 0))}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{tool ? '' : 'newest first'}</div>
                </div>

                {tool === 'consistency' ? (
                  <div className="tf-scroll flex-1 flex flex-col gap-[13px] p-[20px] overflow-y-auto">
                    <div className="max-w-[560px] flex flex-col gap-[10px]">
                      <label className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">League ID</label>
                      <input value={consistencyLeagueId} onChange={e => setConsistencyLeagueId(e.target.value.trim())} placeholder="uuid" className="h-[38px] px-[12px] rounded-[9px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] text-[12.5px] font-mono" />
                    </div>
                    {consistencyLeagueId && (
                      <div className="max-w-[560px] flex flex-col gap-[12px] bg-[var(--surface-canvas)] border border-[var(--surface-border)] rounded-[12px] p-[16px_18px]">
                        {consistency.isLoading ? (
                          <div className="text-[12px] text-[var(--text-muted)]">Loading…</div>
                        ) : consistency.isError ? (
                          <div className="text-[12px] text-[var(--danger-text)]">Couldn't load a consistency report for that league.</div>
                        ) : (
                          <div className="flex flex-col gap-[6px]">
                            {[
                              ['Parent revision mismatches', consistency.data?.parentRevisionMismatches],
                              ['Official outcome ledger mismatches', consistency.data?.officialOutcomeLedgerMismatches],
                              ['Custom resolution ledger mismatches', consistency.data?.customResolutionLedgerMismatches],
                              ['Ledger vs standings mismatches', consistency.data?.ledgerStandingsMismatches],
                              ['Ledger vs competition mismatches', consistency.data?.ledgerCompetitionMismatches],
                              ['Standing version mismatches', consistency.data?.standingVersionMismatches],
                              ['Missing expected markets', consistency.data?.missingExpectedMarketCount],
                              ['Unresolved custom questions', consistency.data?.unresolvedQuestionCount],
                            ].map(([label, value], i) => (
                              <div key={i} className="flex justify-between items-baseline gap-[12px]">
                                <span className="text-[12px] text-[var(--text-secondary)]">{label as string}</span>
                                <span className={`font-heading text-[12px] ${(value as number) > 0 ? 'font-bold text-[var(--danger-text)]' : 'font-semibold'}`}>{value ?? '—'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-[8px]">
                          <div onClick={() => rebuildStandings.mutate(consistencyLeagueId, { onSuccess: () => flash('Standings rebuild enqueued'), onError: () => flash('Could not enqueue a rebuild') })} className="flex-1 min-h-[44px] box-border border border-[var(--surface-border-strong)] rounded-[10px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px]">Rebuild standings</div>
                          <div onClick={() => recheckCompletion.mutate(consistencyLeagueId, { onSuccess: () => flash('Completion recheck enqueued'), onError: () => flash('Could not enqueue a recheck') })} className="flex-1 min-h-[44px] box-border border border-[var(--surface-border-strong)] rounded-[10px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px]">Recheck completion</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : tool === 'refresh' ? (
                  <div className="tf-scroll flex-1 flex flex-col gap-[13px] p-[20px] overflow-y-auto">
                    <div className="max-w-[560px] flex flex-col gap-[10px]">
                      <label className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Canonical fixture ID</label>
                      <input value={refreshFixtureId} onChange={e => setRefreshFixtureId(e.target.value.trim())} placeholder="uuid" className="h-[38px] px-[12px] rounded-[9px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] text-[12.5px] font-mono" />
                      <div className="text-[11.5px] text-[var(--text-secondary)] leading-[1.5]">This is the football fixture's canonical ID, not a specific league's copy of it. Queues a provider re-sync of official facts or squad participation.</div>
                    </div>
                    <div className="max-w-[560px] flex gap-[8px]">
                      <div onClick={() => refreshFixtureId && refreshFacts.mutate(refreshFixtureId, { onSuccess: () => flash('Facts refresh queued'), onError: () => flash('Could not queue a facts refresh') })} className={`flex-1 min-h-[44px] box-border border border-[var(--surface-border-strong)] rounded-[10px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px] ${!refreshFixtureId ? 'opacity-40 pointer-events-none' : ''}`}>Refresh facts</div>
                      <div onClick={() => refreshFixtureId && refreshPlayers.mutate(refreshFixtureId, { onSuccess: () => flash('Squad refresh queued'), onError: () => flash('Could not queue a squad refresh') })} className={`flex-1 min-h-[44px] box-border border border-[var(--surface-border-strong)] rounded-[10px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px] ${!refreshFixtureId ? 'opacity-40 pointer-events-none' : ''}`}>Refresh players</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-none flex gap-[12px] p-[9px_20px] border-b border-[var(--surface-border)] bg-[var(--surface-canvas)]">
                      {COLUMN_HEADERS[qid].map((h, i) => (
                        <span key={i} className={`${i === 0 ? 'w-[70px] flex-none' : i === 1 ? 'flex-1' : i === 2 ? 'w-[190px] flex-none' : 'w-[76px] flex-none text-right'} text-[10px] tracking-[0.08em] uppercase text-[var(--text-secondary)]`}>{h}</span>
                      ))}
                    </div>
                    <div className="tf-scroll flex-1 overflow-y-auto">
                      {!isReady ? (
                        <div className="p-[60px_30px] flex flex-col gap-[6px] items-center text-center">
                          <div className="font-heading font-semibold text-[14px] text-[var(--text-muted)]">Loading…</div>
                        </div>
                      ) : rowsData.map((r: any) => {
                        const id = rowId(qid, r);
                        const on = id === selected;
                        const cols = toCols(qid, r);
                        return (
                          <div key={id} onClick={() => setSelected(id)} className={`flex gap-[12px] items-center p-[12px_20px] cursor-pointer border-b border-[var(--surface-border)] border-l-[3px] ${on ? 'border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border-transparent'}`}>
                            <span className={`w-[70px] flex-none font-heading font-tabular-nums text-[12px] font-semibold text-[var(--text-primary)]`}>{cols[0]}</span>
                            <span className={`flex-1 min-w-0 text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${on ? 'font-heading font-semibold' : ''}`}>{cols[1]}</span>
                            <span className="w-[190px] flex-none text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">{cols[2]}</span>
                            <span className={`w-[76px] flex-none text-right text-[11.5px] font-tabular-nums ${on ? 'font-heading font-semibold' : ''}`}>{cols[3]}</span>
                          </div>
                        );
                      })}
                      {isReady && rowsData.length === 0 && (
                        <div className="p-[60px_30px] flex flex-col gap-[6px] items-center text-center">
                          <div className="font-heading font-semibold text-[14px]">This queue is clear</div>
                          <div className="text-[12px] text-[var(--text-secondary)]">Nothing is waiting on an operator here.</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!tool && (
                <div className="w-[352px] flex-none flex flex-col bg-[var(--surface-canvas)] min-h-0">
                  {row ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex-none p-[14px_18px] border-b border-[var(--surface-border)] flex items-start gap-[10px]">
                        <div className="flex-1 flex flex-col gap-[3px] min-w-0">
                          <div className="font-heading font-semibold text-[14px]">Decision</div>
                          <div className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">{currentQueue?.label}</div>
                        </div>
                        <div onClick={() => setSelected(null)} className="w-[26px] h-[26px] flex-none rounded-full border border-[var(--surface-border-strong)] flex justify-center items-center text-[12px] text-[var(--text-secondary)] cursor-pointer">×</div>
                      </div>
                      <div className="tf-scroll flex-1 overflow-y-auto flex flex-col gap-[14px] p-[14px_18px]">

                        {(queue === 'settlement' || queue === 'late') && (
                          <>
                            <div className="flex flex-col gap-[8px]">
                              <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Evidence</div>
                              {[
                                ['Fixture', short(row.leagueFixtureId)],
                                ['Market', `${row.marketType}${row.side ? ` (${row.side})` : ''}`],
                                ['State', row.state],
                                ['Status', row.status || '—'],
                                ['Current reason', row.reasonCode],
                                ['Version', String(row.version)],
                              ].map(([label, value], i) => (
                                <div key={i} className="flex justify-between items-baseline gap-[12px]">
                                  <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{label}</span>
                                  <span className="text-[11.5px] text-right font-heading font-semibold">{value}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-[8px]">
                              <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Action</div>
                              {[
                                { id: "settle_current_facts", label: "Settle on current facts" },
                                { id: "void", label: "Void this market" }
                              ].map(a => {
                                const on = settleAction === a.id;
                                return (
                                  <div key={a.id} onClick={() => setSettleAction(a.id as any)} className={`flex items-center gap-[10px] p-[11px_13px] rounded-[10px] cursor-pointer min-h-[44px] box-border ${on ? 'border border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border border-[var(--surface-border-strong)] bg-[var(--surface-card)]'}`}>
                                    <span className={`w-[14px] h-[14px] rounded-full flex-none box-border ${on ? 'bg-[var(--color-brand)] border-[3px] border-[var(--surface-card)] shadow-[0_0_0_1px_var(--color-brand)]' : 'border border-[var(--surface-border-strong)]'}`}></span>
                                    <span className={`flex-1 text-[12px] ${on ? 'font-heading font-semibold text-[var(--accent-text-strong)]' : ''}`}>{a.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex flex-col gap-[8px]">
                              <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Reason code</div>
                              {(settleAction === 'settle_current_facts' ? SETTLE_REASON_CODES : VOID_REASON_CODES).map(c => {
                                const on = settleReason === c;
                                return (
                                  <div key={c} onClick={() => setSettleReason(c)} className={`font-mono text-[11px] p-[9px_12px] rounded-[9px] cursor-pointer min-h-[36px] box-border flex items-center ${on ? 'border border-[var(--color-brand)] bg-[var(--accent-surface)] text-[var(--accent-text-strong)]' : 'border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-secondary)]'}`}>
                                    {c}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {queue === 'conflicts' && (
                          <>
                            <div className="flex flex-col gap-[8px]">
                              <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Evidence</div>
                              {[['Fixture', short(row.fixtureId)], ['Section', row.section]].map(([label, value], i) => (
                                <div key={i} className="flex justify-between items-baseline gap-[12px]">
                                  <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{label}</span>
                                  <span className="text-[11.5px] text-right font-heading font-semibold">{value}</span>
                                </div>
                              ))}
                              <pre className="text-[10.5px] leading-[1.5] bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[8px] p-[10px] overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(row.candidate, null, 2)}</pre>
                            </div>
                            <div className="p-[11px_13px] rounded-[10px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
                              <span className="text-[11.5px] text-[var(--text-secondary)] leading-[1.5]">The provider's facts conflict with a protected manual fact. Keeping the current facts resolves this without changing anything.</span>
                            </div>
                            <div className="flex flex-col gap-[8px]">
                              <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Note</div>
                              <textarea value={conflictNote} onChange={e => setConflictNote(e.target.value)} rows={3} placeholder="Why keep the current facts?" className="text-[12px] p-[10px] rounded-[9px] border border-[var(--surface-border-strong)] bg-[var(--surface-card)] resize-none" />
                            </div>
                          </>
                        )}

                        {queue === 'provider' && (
                          <div className="flex flex-col gap-[8px]">
                            <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Evidence</div>
                            {[
                              ['Kind', row.issueKind === 'capability_failure' ? 'Capability failure' : 'Validation quarantine'],
                              ['Target', formatTarget(row.target)],
                              ['Retryable', row.retryable ? 'Yes' : 'No'],
                            ].map(([label, value], i) => (
                              <div key={i} className="flex justify-between items-baseline gap-[12px]">
                                <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{label}</span>
                                <span className="text-[11.5px] text-right font-heading font-semibold">{value}</span>
                              </div>
                            ))}
                            {!row.retryable && (
                              <div className="p-[11px_13px] rounded-[10px] bg-[var(--warn-surface)] border border-[var(--color-warning)] mt-[6px]">
                                <span className="text-[11.5px] text-[var(--text-primary)] leading-[1.5]">Not currently retryable — the sync capability behind this target may have changed since the failure.</span>
                              </div>
                            )}
                          </div>
                        )}

                        {queue === 'jobs' && (
                          <div className="flex flex-col gap-[8px]">
                            <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Evidence</div>
                            {[
                              ['Task', row.taskIdentifier],
                              ['Attempts', `${row.attempts} / ${row.maxAttempts}`],
                              ['Run at', new Date(row.runAt).toLocaleString()],
                              ['Created', new Date(row.createdAt).toLocaleString()],
                            ].map(([label, value], i) => (
                              <div key={i} className="flex justify-between items-baseline gap-[12px]">
                                <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{label}</span>
                                <span className="text-[11.5px] text-right font-heading font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {queue === 'notifications' && (
                          <div className="flex flex-col gap-[8px]">
                            <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Evidence</div>
                            {[
                              ['User', short(row.userId)],
                              ['Kind', row.notificationKind],
                              ['Failure code', row.lastFailureCode || '—'],
                              ['Attempts', String(row.deliveryAttempts)],
                              ['Failed', new Date(row.failedAt).toLocaleString()],
                            ].map(([label, value], i) => (
                              <div key={i} className="flex justify-between items-baseline gap-[12px]">
                                <span className="text-[11.5px] text-[var(--text-secondary)] flex-none">{label}</span>
                                <span className="text-[11.5px] text-right font-heading font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                      <div className="flex-none flex flex-col gap-[8px] p-[14px_18px] border-t border-[var(--surface-border)]">
                        <div onClick={() => canAct() && setConfirm(true)} className={`min-h-[44px] rounded-[11px] flex justify-center items-center font-heading font-semibold text-[13px] text-white ${!canAct() ? 'opacity-40 pointer-events-none bg-[var(--surface-border-strong)]' : (queue === 'settlement' || queue === 'late') && settleAction === 'void' ? 'cursor-pointer bg-[var(--color-danger)]' : 'cursor-pointer bg-[var(--brand-fill)]'}`}>{actionLabel()}</div>
                        <div className="text-[10.5px] text-[var(--text-secondary)] text-center">One more step before anything is written.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-[7px] justify-center items-center p-[30px] text-center">
                      <div className="font-heading font-semibold text-[13.5px]">No decision open</div>
                      <div className="text-[11.5px] text-[var(--text-secondary)] leading-[1.5]">Select a row from the queue.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirm && row && (
        <div className="absolute inset-0 bg-[var(--control-scrim)] flex justify-center items-center p-[24px] box-border z-10">
          <div className="w-[420px] bg-[var(--surface-card)] rounded-[16px] p-[18px_20px] flex flex-col gap-[12px] animate-[tfin_0.16s_ease] shadow-[var(--elev-4)]">
            <div className="font-mono text-[10px] tracking-[0.09em] uppercase text-[var(--text-secondary)]">Confirm step</div>
            <div className="font-heading font-semibold text-[15.5px] leading-[1.35]">{actionLabel()}?</div>
            <div className="flex gap-[8px]">
              <div onClick={() => setConfirm(false)} className="flex-1 min-h-[44px] border border-[var(--surface-border-strong)] rounded-[11px] flex justify-center items-center cursor-pointer font-heading font-semibold text-[12.5px]">Cancel</div>
              <div onClick={commit} className={`flex-1 min-h-[44px] rounded-[11px] flex justify-center items-center gap-[8px] font-heading font-semibold text-[12.5px] text-white ${isBusy ? 'opacity-60 pointer-events-none' : 'cursor-pointer'} ${(queue === 'settlement' || queue === 'late') && settleAction === 'void' ? 'bg-[var(--color-danger)]' : 'bg-[var(--brand-fill)]'}`}>
                <span>{isBusy ? 'Working…' : 'Confirm'}</span>
                <span className="font-mono text-[10px] opacity-75">⌘↵</span>
              </div>
            </div>
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
