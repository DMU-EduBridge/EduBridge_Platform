import { api } from '@/lib/core/api';
import type { StudyItem } from '@/types/domain/learning';

export interface LearningMaterialPayload {
  title: string;
  subject: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export const learningService = {
  getMaterials: (params?: {
    search?: string;
    subject?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/learning-materials', { params }),

  getMaterial: (id: string) => api.get(`/learning-materials?id=${id}`),

  createMaterial: (data: LearningMaterialPayload) => api.post('/learning-materials', data),

  updateMaterial: (id: string, data: Partial<LearningMaterialPayload>) =>
    api.put(`/learning-materials/${id}`, data),

  deleteMaterial: (id: string) => api.delete(`/learning-materials/${id}`),

  getMaterialStats: () => api.get('/learning-materials/stats'),

  // StudyItem 관련 메서드들 (기존 API를 StudyItem 형태로 변환)
  getStudyItems: () =>
    api.get<{ success: boolean; data: { items: StudyItem[] } }>('/learning-materials'),

  getStudyItem: (id: string) => api.get<StudyItem>(`/learning-materials?id=${id}`),

  getStudyProgress: (studyId: string) => api.get(`/learning-materials/${studyId}/progress`),
};
