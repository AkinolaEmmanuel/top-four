import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import {
  fetchCustomQuestions,
  createCustomQuestion,
  submitCustomAnswer,
  resolveCustomQuestion,
  voidCustomQuestion,
  fetchDisclosedAnswers,
  CustomQuestionsPage,
  CreateCustomQuestionPayload,
  CustomAnswerValue,
  fetchOwnCustomAnswer
} from '@/lib/api/custom-questions';

export function useCustomQuestions(leagueId: string) {
  return useQuery<CustomQuestionsPage, Error>({
    queryKey: ['leagues', leagueId, 'custom-questions'],
    queryFn: () => fetchCustomQuestions(leagueId),
    enabled: !!leagueId,
  });
}

export function useOwnCustomAnswer(leagueId: string, questionId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'custom-questions', questionId, 'answer'],
    queryFn: () => fetchOwnCustomAnswer(leagueId, questionId),
    enabled: !!leagueId && !!questionId,
  });
}

export function useOwnCustomAnswers(leagueId: string, questionIds: string[]) {
  return useQueries({
    queries: questionIds.map(id => ({
      queryKey: ['leagues', leagueId, 'custom-questions', id, 'answer'],
      queryFn: () => fetchOwnCustomAnswer(leagueId, id),
      enabled: !!leagueId && !!id,
    })),
  });
}

export function useDisclosedAnswers(leagueId: string, questionId: string | null) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'custom-questions', questionId, 'answers'],
    queryFn: () => fetchDisclosedAnswers(leagueId, questionId as string),
    enabled: !!leagueId && !!questionId,
  });
}

export function useCreateCustomQuestion(leagueId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateCustomQuestionPayload) => createCustomQuestion(leagueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'custom-questions'] });
    }
  });
}

export function useSubmitCustomAnswer(leagueId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, expectedVersion, answer }: { questionId: string, expectedVersion: number, answer: CustomAnswerValue }) => submitCustomAnswer(leagueId, questionId, expectedVersion, answer),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'custom-questions'] });
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'custom-questions', variables.questionId, 'answer'] });
    }
  });
}

export function useResolveCustomQuestion(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, correctAnswer, reason }: { questionId: string, correctAnswer: CustomAnswerValue, reason?: string }) => resolveCustomQuestion(leagueId, questionId, correctAnswer, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'custom-questions'] });
    }
  });
}

export function useVoidCustomQuestion(leagueId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, reason }: { questionId: string, reason: string }) => voidCustomQuestion(leagueId, questionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues', leagueId, 'custom-questions'] });
    }
  });
}
