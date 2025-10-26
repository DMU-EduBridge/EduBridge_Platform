/**
 * 문제 관련 성능 최적화 훅들
 */

import { problemSearchContext } from '@/lib/patterns/strategy-pattern';
import type { Problem } from '@/types/domain/problem';
import { useMemo } from 'react';

/**
 * 문제 목록을 필터링하고 정렬하는 최적화된 훅 (Strategy Pattern 적용)
 */
export function useOptimizedProblems(
  problems: Problem[],
  filters?: {
    search?: string;
    difficulty?: string;
    subject?: string;
    type?: string;
  },
) {
  return useMemo(() => {
    if (!problems.length) return problems;

    // Strategy Pattern을 사용한 통합 검색/필터링/정렬
    return problemSearchContext.search(
      problems,
      filters?.search || '',
      {
        difficulty: filters?.difficulty,
        subject: filters?.subject,
        type: filters?.type,
      },
      { order: 'desc' }, // 최신순 정렬
    );
  }, [problems, filters]);
}

/**
 * 문제 통계를 계산하는 최적화된 훅
 */
export function useProblemStats(problems: Problem[]) {
  return useMemo(() => {
    const total = problems.length;
    const byDifficulty = problems.reduce(
      (acc, problem) => {
        acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const bySubject = problems.reduce(
      (acc, problem) => {
        acc[problem.subject] = (acc[problem.subject] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      byDifficulty,
      bySubject,
    };
  }, [problems]);
}
