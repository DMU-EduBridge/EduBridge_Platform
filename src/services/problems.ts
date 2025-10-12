import { api } from '@/lib/core/api';
import { AttemptPostBody, AttemptPostResponse, SolutionResponse } from '@/types/api';
import type {
  LLMProblemGenerationRequest,
  LLMProblemGenerationResponse,
  Problem,
} from '@/types/domain/problem';

export const problemsService = {
  getProblems: (params?: {
    search?: string;
    subject?: string;
    difficulty?: string;
    creationType?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{ success: boolean; data: { problems: Problem[]; total: number } }>('/problems', {
      params,
    }),

  getProblem: (id: string) => api.get<Problem>(`/problems/${id}`),

  createProblem: (data: Omit<Problem, 'id' | 'createdAt' | 'attempts' | 'successRate'>) =>
    api.post<Problem>('/problems', data),

  createProblems: (data: Omit<Problem, 'id' | 'createdAt' | 'attempts' | 'successRate'>[]) =>
    api.post<Problem[]>('/problems/batch', data),

  updateProblem: (id: string, data: Partial<Problem>) => api.put<Problem>(`/problems/${id}`, data),

  deleteProblem: (id: string) => api.delete(`/problems/${id}`),

  getProblemStats: () => api.get<{ success: boolean; data: any }>('/problems/stats'),

  getProblemAttempts: (id: string) => api.get(`/problems/${id}/attempts`),

  createProblemAttempt: (id: string, data: AttemptPostBody) =>
    api.post<AttemptPostResponse>(`/problems/${id}/attempts`, data),

  getProblemSolution: (id: string) => api.get<SolutionResponse>(`/problems/${id}/solution`),

  createProblemSolution: (id: string, data: SolutionResponse) =>
    api.post(`/problems/${id}/solution`, data),

  // LLM 문제 생성 관련
  generateProblems: (request: LLMProblemGenerationRequest) =>
    api.post<LLMProblemGenerationResponse>('/problems/generate', request),

  generateAndSaveProblems: (request: LLMProblemGenerationRequest) =>
    api.post<Problem[]>('/problems/generate-and-save', request),
};
