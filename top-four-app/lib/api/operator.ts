import { apiFetch } from './fetcher';

export interface SettlementJob {
  id: string;
  age: string;
  old?: boolean;
  fixture: string;
  market: string;
  reason: string;
  affected: number;
}

export interface OperatorStats {
  settlement: SettlementJob[];
  late: SettlementJob[];
  provider: SettlementJob[];
  jobs: SettlementJob[];
  notifications: SettlementJob[];
}

export async function fetchOperatorStats(): Promise<OperatorStats> {
  return apiFetch<OperatorStats>('/operator/stats');
}

export async function resolveSettlementJob(jobId: string, action: string, reason?: string): Promise<void> {
  await apiFetch<void>(`/operator/jobs/${jobId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ action, reason }),
  });
}
