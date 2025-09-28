import { logger } from '../monitoring';

/**
 * 쿼리 최적화 유틸리티
 */

// 기본 선택 필드들 (성능 최적화)
export const DEFAULT_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
} as const;

export const DEFAULT_PROBLEM_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  difficulty: true,
  subject: true,
  gradeLevel: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
} as const;

export const DEFAULT_CLASS_SELECT = {
  id: true,
  name: true,
  description: true,
  subject: true,
  gradeLevel: true,
  schoolYear: true,
  semester: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * 페이지네이션 최적화
 */
export interface OptimizedPaginationOptions {
  page: number;
  limit: number;
  maxLimit?: number;
}

export function optimizePagination(options: OptimizedPaginationOptions) {
  const { page, limit, maxLimit = 100 } = options;

  const optimizedPage = Math.max(1, page);
  const optimizedLimit = Math.min(Math.max(1, limit), maxLimit);
  const skip = (optimizedPage - 1) * optimizedLimit;

  return {
    page: optimizedPage,
    limit: optimizedLimit,
    skip,
  };
}

/**
 * 쿼리 조건 최적화
 */
export function optimizeWhereClause<T extends Record<string, any>>(
  where: T,
  options: {
    excludeNull?: boolean;
    excludeEmpty?: boolean;
  } = {},
): any {
  const { excludeNull = true, excludeEmpty = true } = options;
  const optimized: any = {};

  for (const [key, value] of Object.entries(where)) {
    if (value === null && excludeNull) continue;
    if (value === '' && excludeEmpty) continue;
    if (value === undefined) continue;

    optimized[key] = value;
  }

  return optimized;
}

/**
 * 관계 데이터 로딩 최적화
 */
export interface OptimizedIncludeOptions {
  includeCreator?: boolean;
  // includeMembers?: boolean;
  includeAssignments?: boolean;
  includeAttempts?: boolean;
  includeStats?: boolean;
  // memberLimit?: number;
  assignmentLimit?: number;
  attemptLimit?: number;
}

export function getOptimizedInclude(options: OptimizedIncludeOptions = {}) {
  const {
    includeCreator = false,
    includeAssignments = false,
    includeStats = false,
    assignmentLimit = 20,
  } = options;

  const include: any = {};

  if (includeCreator) {
    include.creator = {
      select: DEFAULT_USER_SELECT,
    };
  }

  if (includeAssignments) {
    include.assignments = {
      take: assignmentLimit,
      include: {
        problem: {
          select: DEFAULT_PROBLEM_SELECT,
        },
        assigner: {
          select: DEFAULT_USER_SELECT,
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    };
  }

  if (includeStats) {
    include._count = {
      select: {
        assignments: true,
        materialProblems: true,
        progressEntries: true, // ProblemProgress 관계 추가
      },
    };
  }

  return include;
}

/**
 * 정렬 최적화
 */
export function getOptimizedOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
  const validSortFields = ['createdAt', 'updatedAt', 'name', 'title'];

  if (!sortBy || !validSortFields.includes(sortBy)) {
    return { createdAt: 'desc' };
  }

  return { [sortBy]: sortOrder };
}

/**
 * 쿼리 실행 시간 측정
 */
export async function measureQueryTime<T>(
  queryName: string,
  queryFn: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      logger.warn(`느린 쿼리 감지: ${queryName}`, { duration });
    } else {
      logger.info(`쿼리 실행 완료: ${queryName}`, { duration });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`쿼리 실행 실패: ${queryName}`, undefined, {
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * 배치 쿼리 최적화
 */
export async function executeBatchQueries<T>(
  queries: Array<() => Promise<T>>,
  options: {
    concurrency?: number;
    timeout?: number;
  } = {},
): Promise<T[]> {
  const { concurrency = 5, timeout = 10000 } = options;

  const results: T[] = [];
  const errors: Error[] = [];

  // 동시 실행 제한
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);

    try {
      const batchResults = await Promise.allSettled(
        batch.map((query) =>
          Promise.race([
            query(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeout),
            ),
          ]),
        ),
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[i + index] = result.value;
        } else {
          errors.push(new Error(`Query ${i + index} failed: ${result.reason}`));
        }
      });
    } catch (error) {
      logger.error('배치 쿼리 실행 실패', undefined, {
        batchIndex: i,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  if (errors.length > 0) {
    logger.warn('일부 쿼리 실행 실패', { errorCount: errors.length });
  }

  return results;
}
