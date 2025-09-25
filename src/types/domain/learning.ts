export type StudyLevel = '쉬움' | '보통' | '어려움' | '기초';

export interface StudyItem {
  id: string;
  title: string;
  summary: string;
  level: StudyLevel;
  estimatedTimeMin: number;
  createdAt: string; // ISO date
}

// 타입 안전한 상수들
export const STUDY_LEVELS = {
  BEGINNER: '기초',
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
} as const;

export const STUDY_LEVEL_CONFIG = {
  [STUDY_LEVELS.BEGINNER]: {
    color: 'bg-gray-100 text-gray-800',
    label: '기초',
    order: 1,
  },
  [STUDY_LEVELS.EASY]: {
    color: 'bg-green-100 text-green-800',
    label: '쉬움',
    order: 2,
  },
  [STUDY_LEVELS.MEDIUM]: {
    color: 'bg-yellow-100 text-yellow-800',
    label: '보통',
    order: 3,
  },
  [STUDY_LEVELS.HARD]: {
    color: 'bg-red-100 text-red-800',
    label: '어려움',
    order: 4,
  },
} as const;

// 타입 가드 함수
export function isValidStudyLevel(level: string): level is StudyLevel {
  return Object.values(STUDY_LEVELS).includes(level as StudyLevel);
}

// 유틸리티 함수들
export function getStudyLevelConfig(level: StudyLevel) {
  return STUDY_LEVEL_CONFIG[level];
}

export function sortByStudyLevel(items: StudyItem[]): StudyItem[] {
  return [...items].sort((a, b) => {
    const aOrder = STUDY_LEVEL_CONFIG[a.level].order;
    const bOrder = STUDY_LEVEL_CONFIG[b.level].order;
    return aOrder - bOrder;
  });
}
