import { learningService, type LearningMaterialResponse } from '@/services/learning';
import type { StudyItem } from '@/types/domain/learning';
import { useQuery } from '@tanstack/react-query';

// 난이도 매핑 함수
function mapDifficultyToLevel(difficulty: string): StudyItem['level'] {
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return '쉬움';
    case 'MEDIUM':
      return '보통';
    case 'HARD':
      return '어려움';
    default:
      return '기초';
  }
}

// API 응답을 StudyItem으로 변환
function transformToStudyItem(material: LearningMaterialResponse): StudyItem {
  return {
    id: material.id,
    title: material.title,
    summary: material.description || material.content || '학습 자료',
    level: mapDifficultyToLevel(material.difficulty),
    estimatedTimeMin: material.estimatedTime || 30,
    createdAt: material.createdAt || new Date().toISOString(),
  };
}

/**
 * 학습 자료 목록을 가져오는 훅
 * StudyItem 타입으로 변환된 데이터를 반환
 */
export function useStudyItems() {
  return useQuery({
    queryKey: ['studyItems'],
    queryFn: async () => {
      const response = await learningService.getStudyItems();
      // API 응답 구조: { success: true, data: { materials: [...] } }
      const materials = response.data.data?.materials || [];
      // API 응답을 StudyItem 형태로 변환
      return materials.map(transformToStudyItem);
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
