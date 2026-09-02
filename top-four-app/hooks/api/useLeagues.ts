import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyLeagues,
  fetchLeagueDetails,
  createLeague,
  joinLeague,
  League,
  LeaguesPage,
  CreateLeaguePayload,
  fetchLeagueMembers,
  fetchJoinRequests,
  updateMemberRole,
  removeMember,
  processJoinRequest,
  createInvitation,
  fetchLeagueInvitations,
  revokeInvitation,
  fetchLeagueFixtures,
  LeagueFixture,
  LeagueFixturesPage,
  publishLeague,
  deleteLeague,
  cloneLeague,
  archiveLeague,
  cancelLeague,
  transferOwnership,
  leaveLeague,
  fetchLeagueDashboard,
  LeagueDashboard
} from '@/lib/api/leagues';

export function useMyLeagues() {
  return useQuery<LeaguesPage, Error>({
    queryKey: ['leagues', 'mine'],
    queryFn: () => fetchMyLeagues(),
  });
}

export function useLeague(id: string) {
  return useQuery<League, Error>({
    queryKey: ['leagues', id],
    queryFn: () => fetchLeagueDetails(id),
    enabled: !!id, // Only run the query if we have an ID
  });
}

export function useLeagueFixtures(leagueId: string) {
  return useQuery<LeagueFixturesPage, Error>({
    queryKey: ['leagues', leagueId, 'fixtures'],
    queryFn: () => fetchLeagueFixtures(leagueId),
    enabled: !!leagueId,
  });
}

export function useCreateLeague() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ idempotencyKey, payload }: { idempotencyKey: string, payload: CreateLeaguePayload }) => 
      createLeague(idempotencyKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] });
    }
  });
}

export function useJoinLeague() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (inviteCode: string) => joinLeague(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] });
    }
  });
}

export function useLeagueMembers(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'members'],
    queryFn: () => fetchLeagueMembers(leagueId),
    enabled: !!leagueId,
  });
}

export function useJoinRequests(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'join-requests'],
    queryFn: () => fetchJoinRequests(leagueId),
    enabled: !!leagueId,
  });
}

export function useUpdateMemberRole(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string, role: string }) => updateMemberRole(leagueId, membershipId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'members'] }),
  });
}

export function useRemoveMember(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => removeMember(leagueId, membershipId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'members'] }),
  });
}

export function useProcessJoinRequest(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string, action: 'approve' | 'reject' }) => processJoinRequest(leagueId, requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'members'] });
    },
  });
}

export function useCreateInvitation(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (useLimit: number = 100) => createInvitation(leagueId, useLimit),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'invitations'] }),
  });
}

export function useLeagueInvitations(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'invitations'],
    queryFn: () => fetchLeagueInvitations(leagueId),
    enabled: !!leagueId,
  });
}

export function useRevokeInvitation(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(leagueId, invitationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'invitations'] }),
  });
}

export function useLeagueDashboard(leagueId: string) {
  return useQuery<LeagueDashboard, Error>({
    queryKey: ['leagues', leagueId, 'dashboard'],
    queryFn: () => fetchLeagueDashboard(leagueId),
    enabled: !!leagueId,
  });
}

export function usePublishLeague() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, idempotencyKey, expectedVersion }: { leagueId: string, idempotencyKey: string, expectedVersion: number }) =>
      publishLeague(leagueId, idempotencyKey, expectedVersion),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leagues', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] });
    },
  });
}

export function useDeleteLeague() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, idempotencyKey, expectedVersion }: { leagueId: string, idempotencyKey: string, expectedVersion: number }) =>
      deleteLeague(leagueId, idempotencyKey, expectedVersion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] }),
  });
}

export function useCloneLeague(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idempotencyKey, payload }: { idempotencyKey: string, payload: { name: string; description?: string } }) =>
      cloneLeague(leagueId, idempotencyKey, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] }),
  });
}

export function useArchiveLeague(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idempotencyKey, expectedVersion }: { idempotencyKey: string, expectedVersion: number }) =>
      archiveLeague(leagueId, idempotencyKey, expectedVersion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', leagueId] }),
  });
}

export function useCancelLeague(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idempotencyKey, expectedVersion }: { idempotencyKey: string, expectedVersion: number }) =>
      cancelLeague(leagueId, idempotencyKey, expectedVersion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', leagueId] }),
  });
}

export function useTransferOwnership(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetMembershipId: string) => transferOwnership(leagueId, targetMembershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'members'] });
    },
  });
}

export function useLeaveLeague(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveLeague(leagueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] }),
  });
}
