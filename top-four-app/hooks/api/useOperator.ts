import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOperatorStats, resolveSettlementJob } from '@/lib/api/operator';

export function useOperatorStats() {
  return useQuery({
    queryKey: ['operator-stats'],
    queryFn: fetchOperatorStats,
  });
}

export function useResolveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, action }: { jobId: string, action: string }) => resolveSettlementJob(jobId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-stats'] });
    }
  });
}
