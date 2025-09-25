// 학습 자료 관련 타입 정의
export type MaterialDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type MaterialStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface LearningMaterial {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  subject: string;
  difficulty: string;
  estimatedTime?: number | null;
  files?: string | null;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// 요청/응답 타입
export interface CreateMaterialRequest {
  title: string;
  description?: string;
  content: string;
  subject: string;
  difficulty: string;
  status: string;
  estimatedTime?: number;
  files?: string;
}

export interface UpdateMaterialRequest {
  title?: string;
  description?: string;
  content?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
  estimatedTime?: number;
  files?: string;
}

export interface MaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
}

export type MaterialItem = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  estimatedTime?: number;
  status?: string;
  problemsCount?: number;
};

// 타입 안전한 상수들
export const MATERIAL_DIFFICULTY_CONFIG = {
  EASY: { color: 'bg-green-100 text-green-800', label: '쉬움' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: '보통' },
  HARD: { color: 'bg-red-100 text-red-800', label: '어려움' },
  EXPERT: { color: 'bg-purple-100 text-purple-800', label: '전문가' },
} as const;

export const MATERIAL_STATUS_CONFIG = {
  PUBLISHED: { color: 'bg-green-100 text-green-800', label: '발행됨' },
  DRAFT: { color: 'bg-yellow-100 text-yellow-800', label: '초안' },
  ARCHIVED: { color: 'bg-gray-100 text-gray-800', label: '보관됨' },
} as const;

// 유틸리티 함수들
export function getMaterialDifficultyConfig(difficulty?: string) {
  return (
    MATERIAL_DIFFICULTY_CONFIG[difficulty as keyof typeof MATERIAL_DIFFICULTY_CONFIG] || {
      color: 'bg-gray-100 text-gray-800',
      label: difficulty || '',
    }
  );
}

export function getMaterialStatusConfig(status?: string) {
  return (
    MATERIAL_STATUS_CONFIG[status as keyof typeof MATERIAL_STATUS_CONFIG] || {
      color: 'bg-gray-100 text-gray-800',
      label: status || '',
    }
  );
}
