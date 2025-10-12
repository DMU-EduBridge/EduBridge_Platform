import { api } from '@/lib/core/api';
import type { StudyItem } from '@/types/domain/learning';

export interface LearningMaterialPayload {
  title: string;
  subject: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

// API 응답 타입
export interface LearningMaterialResponse {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  isActive: boolean;
  problemCount: number;
  description?: string | null;
  content?: string;
  estimatedTime?: number | null;
  files?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface LearningMaterialsApiResponse {
  success: boolean;
  data: {
    materials: LearningMaterialResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    total: number;
  };
}

export const learningService = {
  getMaterials: async (params?: {
    search?: string;
    subject?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/learning-materials', { params });
    return response.data.data; // API 응답의 data 필드 반환
  },

  getMaterial: async (id: string) => {
    const response = await api.get(`/learning-materials?id=${id}`);
    return response.data;
  },

  createMaterial: async (data: LearningMaterialPayload) => {
    const response = await api.post('/learning-materials', data);
    return response.data;
  },

  updateMaterial: async (id: string, data: Partial<LearningMaterialPayload>) => {
    const response = await api.put(`/learning-materials/${id}`, data);
    return response.data;
  },

  deleteMaterial: async (id: string) => {
    const response = await api.delete(`/learning-materials/${id}`);
    return response.data;
  },

  getMaterialStats: async () => {
    const response = await api.get('/learning-materials/stats');
    return response.data;
  },

  // StudyItem 관련 메서드들 (기존 API를 StudyItem 형태로 변환)
  getStudyItems: () => api.get<LearningMaterialsApiResponse>('/learning-materials'),

  getStudyItem: (id: string) => api.get<StudyItem>(`/learning-materials?id=${id}`),

  getStudyProgress: (studyId: string) => api.get(`/learning-materials/${studyId}/progress`),
};
