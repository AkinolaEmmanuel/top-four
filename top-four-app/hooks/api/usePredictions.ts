import { useQuery } from '@tanstack/react-query';
import { fetchPredictionTasks, PredictionTaskPage } from '@/lib/api/predictions';

export function usePredictionTasks() {
  return useQuery<PredictionTaskPage, Error>({
    queryKey: ['prediction-tasks'],
    queryFn: () => fetchPredictionTasks(),
  });
}
