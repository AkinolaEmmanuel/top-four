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
  createInvitation
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
