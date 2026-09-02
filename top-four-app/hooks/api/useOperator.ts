import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSettlementReviews, resolveSettlementDecision,
  fetchFactConflicts, keepCurrentFacts,
  fetchProviderIssues, retryProviderIssue,
  fetchExhaustedJobs, retryExhaustedJob,
  fetchFailedNotifications, retryFailedNotification,
  fetchPlatformStatus,
  fetchLeagueConsistency, requestStandingsRebuild, requestCompletionRecheck,
  requestFixtureFactsRefresh, requestFixturePlayersRefresh,
} from '@/lib/api/operator';

export function usePlatformStatus() {
  return useQuery({ queryKey: ['platform-status'], queryFn: fetchPlatformStatus });
}

export function useSettlementReviews() {
  return useQuery({ queryKey: ['platform-settlements'], queryFn: () => fetchSettlementReviews() });
}

export function useResolveSettlementDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ settlementId, expectedVersion, action, reasonCode }: { settlementId: string; expectedVersion: number; action: 'settle_current_facts' | 'void'; reasonCode: string }) =>
      resolveSettlementDecision(settlementId, expectedVersion, action, reasonCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['platform-status'] });
    },
  });
}

export function useFactConflicts() {
  return useQuery({ queryKey: ['platform-fact-conflicts'], queryFn: () => fetchFactConflicts() });
}

export function useKeepCurrentFacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conflictId, note }: { conflictId: string; note: string }) => keepCurrentFacts(conflictId, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-fact-conflicts'] }),
  });
}

export function useProviderIssues() {
  return useQuery({ queryKey: ['platform-provider-issues'], queryFn: () => fetchProviderIssues() });
}

export function useRetryProviderIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueKind, issueId }: { issueKind: 'capability_failure' | 'validation_quarantine'; issueId: string }) =>
      retryProviderIssue(issueKind, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-provider-issues'] });
      queryClient.invalidateQueries({ queryKey: ['platform-status'] });
    },
  });
}

export function useExhaustedJobs() {
  return useQuery({ queryKey: ['platform-jobs'], queryFn: () => fetchExhaustedJobs() });
}

export function useRetryExhaustedJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => retryExhaustedJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['platform-status'] });
    },
  });
}

export function useFailedNotifications() {
  return useQuery({ queryKey: ['platform-notifications'], queryFn: () => fetchFailedNotifications() });
}

export function useRetryFailedNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => retryFailedNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['platform-status'] });
    },
  });
}

export function useLeagueConsistency(leagueId: string) {
  return useQuery({
    queryKey: ['platform-consistency', leagueId],
    queryFn: () => fetchLeagueConsistency(leagueId),
    enabled: !!leagueId,
  });
}

export function useRequestStandingsRebuild() {
  return useMutation({ mutationFn: (leagueId: string) => requestStandingsRebuild(leagueId) });
}

export function useRequestCompletionRecheck() {
  return useMutation({ mutationFn: (leagueId: string) => requestCompletionRecheck(leagueId) });
}

export function useRequestFixtureFactsRefresh() {
  return useMutation({ mutationFn: (fixtureId: string) => requestFixtureFactsRefresh(fixtureId) });
}

export function useRequestFixturePlayersRefresh() {
  return useMutation({ mutationFn: (fixtureId: string) => requestFixturePlayersRefresh(fixtureId) });
}
