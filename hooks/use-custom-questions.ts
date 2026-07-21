"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomQuestion, CustomQuestionType } from "@/types";
import { leaderboardQueryKey } from "@/hooks/use-leaderboard";

export const customQuestionsQueryKey = (roomId: string) => ["custom-questions", roomId] as const;

export type CustomQuestionsResponse = {
  questions: CustomQuestion[];
  myAnswers: Record<string, string>;
};

async function fetchCustomQuestions(roomId: string): Promise<CustomQuestionsResponse> {
  const res = await fetch(`/api/rooms/${roomId}/questions`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Failed to load questions.");
  return { questions: data.questions, myAnswers: data.myAnswers ?? {} };
}

export function useCustomQuestions(roomId: string) {
  return useQuery<CustomQuestionsResponse, Error>({
    queryKey: customQuestionsQueryKey(roomId),
    queryFn: () => fetchCustomQuestions(roomId),
  });
}

export function useCreateCustomQuestion(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      questionText: string;
      type: CustomQuestionType;
      options?: string[];
      deadline: string;
      points: number;
      context?: string;
    }) => {
      const res = await fetch(`/api/rooms/${roomId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to create question.");
      return data.question as CustomQuestion;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customQuestionsQueryKey(roomId) }),
  });
}

export function useSubmitQuestionAnswer(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { questionId: string; answer: string }) => {
      const res = await fetch(`/api/rooms/${roomId}/questions/${input.questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: input.answer }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit answer.");
      return data.answer;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customQuestionsQueryKey(roomId) }),
  });
}

export function useSettleQuestion(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { questionId: string; correctAnswers: string[] }) => {
      const res = await fetch(`/api/rooms/${roomId}/questions/${input.questionId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctAnswers: input.correctAnswers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to settle question.");
      return data.question as CustomQuestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customQuestionsQueryKey(roomId) });
      queryClient.invalidateQueries({ queryKey: leaderboardQueryKey(roomId) });
    },
  });
}
