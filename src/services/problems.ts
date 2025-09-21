import { api } from '@/lib/core/api';
import { AttemptPostBody, AttemptPostResponse, SolutionResponse } from '@/types/api';
import type { Problem } from '@/types/domain/problem';

export const problemsService = {
  getProblems: (params?: {
    search?: string;
    subject?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ problems: Problem[]; total: number }>('/problems', { params }),

  getProblem: (id: string) => api.get<Problem>(`/problems/${id}`),

  createProblem: (data: Omit<Problem, 'id' | 'createdAt' | 'attempts' | 'successRate'>) =>
    api.post<Problem>('/problems', data),

  updateProblem: (id: string, data: Partial<Problem>) => api.put<Problem>(`/problems/${id}`, data),

  deleteProblem: (id: string) => api.delete(`/problems/${id}`),

  getProblemStats: () => api.get('/problems/stats'),

  getProblemAttempts: (id: string) => api.get(`/problems/${id}/attempts`),

  createProblemAttempt: (id: string, data: AttemptPostBody) =>
    api.post<AttemptPostResponse>(`/problems/${id}/attempts`, data),

  getProblemSolution: (id: string) => api.get<SolutionResponse>(`/problems/${id}/solution`),

  createProblemSolution: (id: string, data: SolutionResponse) =>
    api.post(`/problems/${id}/solution`, data),
};
