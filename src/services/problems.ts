import { api } from '@/lib/core/api';
import { AttemptPostBody, AttemptPostResponse, SolutionResponse } from '@/types/api';
import type { LMSProblem } from '@/types/problem';

export const problemsService = {
  getProblems: (params?: {
    search?: string;
    subject?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ problems: LMSProblem[]; total: number }>('/problems', { params }),

  getProblem: (id: string) => api.get<LMSProblem>(`/problems/${id}`),

  createProblem: (data: Omit<LMSProblem, 'id' | 'createdAt' | 'attempts' | 'successRate'>) =>
    api.post<LMSProblem>('/problems', data),

  updateProblem: (id: string, data: Partial<LMSProblem>) =>
    api.put<LMSProblem>(`/problems/${id}`, data),

  deleteProblem: (id: string) => api.delete(`/problems/${id}`),

  getProblemStats: () => api.get('/problems/stats'),

  getProblemAttempts: (id: string) => api.get(`/problems/${id}/attempts`),

  createProblemAttempt: (id: string, data: AttemptPostBody) =>
    api.post<AttemptPostResponse>(`/problems/${id}/attempts`, data),

  getProblemSolution: (id: string) => api.get<SolutionResponse>(`/problems/${id}/solution`),

  createProblemSolution: (id: string, data: SolutionResponse) =>
    api.post(`/problems/${id}/solution`, data),
};
