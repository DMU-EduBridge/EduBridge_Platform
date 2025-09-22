'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';

// React Query 설정
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 캐시 시간 (5분)
        staleTime: 5 * 60 * 1000,
        // 백그라운드에서 데이터 갱신 시간 (10분)
        gcTime: 10 * 60 * 1000,
        // 재시도 횟수
        retry: 3,
        // 재시도 간격 (지수 백오프)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 윈도우 포커스 시 자동 리페치
        refetchOnWindowFocus: false,
        // 네트워크 재연결 시 자동 리페치
        refetchOnReconnect: true,
      },
      mutations: {
        // 뮤테이션 재시도 횟수
        retry: 1,
      },
    },
  });
};

// Query Client Provider
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// 캐시 키 관리
export const cacheKeys = {
  // 사용자 관련
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userStats: () => ['users', 'stats'] as const,

  // 문제 관련
  problems: ['problems'] as const,
  problem: (id: string) => ['problems', id] as const,
  problemStats: () => ['problems', 'stats'] as const,
  problemList: (params: any) => ['problems', 'list', params] as const,

  // 교과서 관련
  textbooks: ['textbooks'] as const,
  textbook: (id: string) => ['textbooks', id] as const,
  textbookList: (params: any) => ['textbooks', 'list', params] as const,

  // 학생 관련
  students: ['students'] as const,
  student: (id: string) => ['students', id] as const,
  studentList: (params: any) => ['students', 'list', params] as const,

  // 리포트 관련
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  reportList: (params: any) => ['reports', 'list', params] as const,

  // 검색 관련
  searchQueries: ['search'] as const,
  searchResults: (query: string) => ['search', 'results', query] as const,

  // AI 관련
  aiStats: ['ai', 'stats'] as const,
  aiUsage: ['ai', 'usage'] as const,
  aiPerformance: ['ai', 'performance'] as const,

  // 대시보드 관련
  dashboard: ['dashboard'] as const,
  dashboardStats: () => ['dashboard', 'stats'] as const,
} as const;

// 캐시 무효화 유틸리티
export function invalidateCache(queryClient: QueryClient, pattern: string) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      return query.queryKey.some((key) => typeof key === 'string' && key.includes(pattern));
    },
  });
}

// 특정 캐시 무효화
export function invalidateUserCache(queryClient: QueryClient, userId?: string) {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.user(userId) });
  }
  queryClient.invalidateQueries({ queryKey: cacheKeys.users });
  queryClient.invalidateQueries({ queryKey: cacheKeys.userStats() });
}

export function invalidateProblemCache(queryClient: QueryClient, problemId?: string) {
  if (problemId) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.problem(problemId) });
  }
  queryClient.invalidateQueries({ queryKey: cacheKeys.problems });
  queryClient.invalidateQueries({ queryKey: cacheKeys.problemStats() });
}

export function invalidateTextbookCache(queryClient: QueryClient, textbookId?: string) {
  if (textbookId) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.textbook(textbookId) });
  }
  queryClient.invalidateQueries({ queryKey: cacheKeys.textbooks });
}

export function invalidateStudentCache(queryClient: QueryClient, studentId?: string) {
  if (studentId) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.student(studentId) });
  }
  queryClient.invalidateQueries({ queryKey: cacheKeys.students });
}

export function invalidateReportCache(queryClient: QueryClient, reportId?: string) {
  if (reportId) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.report(reportId) });
  }
  queryClient.invalidateQueries({ queryKey: cacheKeys.reports });
}

// 캐시 프리페칭 유틸리티
export async function prefetchUserData(queryClient: QueryClient, userId: string) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.user(userId),
    queryFn: () => fetch(`/api/users/${userId}`).then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchProblemData(queryClient: QueryClient, problemId: string) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.problem(problemId),
    queryFn: () => fetch(`/api/problems/${problemId}`).then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchDashboardData(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.dashboardStats(),
    queryFn: () => fetch('/api/dashboard').then((res) => res.json()),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

// 캐시 상태 모니터링
export function getCacheStats(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  const stats = {
    totalQueries: queries.length,
    staleQueries: queries.filter((q) => q.isStale()).length,
    fetchingQueries: queries.filter((q) => q.state.status === 'pending').length,
    errorQueries: queries.filter((q) => q.state.error).length,
    cacheSize: JSON.stringify(queries).length,
  };

  return stats;
}

// 캐시 정리 유틸리티
export function clearExpiredCache(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  queries.forEach((query) => {
    if (query.isStale() && query.state.status !== 'pending') {
      cache.remove(query);
    }
  });
}

// 메모리 사용량 모니터링
export function monitorCacheMemory(queryClient: QueryClient) {
  const stats = getCacheStats(queryClient);

  // 캐시 크기가 10MB를 초과하면 정리
  if (stats.cacheSize > 10 * 1024 * 1024) {
    clearExpiredCache(queryClient);
  }

  return stats;
}

// 자동 캐시 정리 (5분마다)
export function setupAutoCacheCleanup(queryClient: QueryClient) {
  const interval = setInterval(
    () => {
      monitorCacheMemory(queryClient);
    },
    5 * 60 * 1000,
  ); // 5분

  return () => clearInterval(interval);
}

// 오프라인 지원
export function useOfflineSupport(queryClient: QueryClient) {
  useEffect(() => {
    const handleOnline = () => {
      // 온라인 상태로 복귀 시 처리
      console.log('Online - resuming operations');
    };

    const handleOffline = () => {
      // 오프라인 상태 처리
      console.log('Offline - pausing operations');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);
}

// 캐시 히트율 추적
export class CacheHitTracker {
  private static hits = 0;
  private static misses = 0;

  static recordHit() {
    this.hits++;
  }

  static recordMiss() {
    this.misses++;
  }

  static getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  static getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
    };
  }

  static reset() {
    this.hits = 0;
    this.misses = 0;
  }
}

// 캐시 최적화 훅
export function useCacheOptimization() {
  const [stats, setStats] = useState(() => ({
    totalQueries: 0,
    staleQueries: 0,
    fetchingQueries: 0,
    errorQueries: 0,
    cacheSize: 0,
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      // 기본 통계 반환 (실제 QueryClient 없이)
      setStats({
        totalQueries: 0,
        staleQueries: 0,
        fetchingQueries: 0,
        errorQueries: 0,
        cacheSize: 0,
      });
    }, 10000); // 10초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return stats;
}

// 캐시 설정 타입
export interface CacheConfig {
  staleTime: number;
  gcTime: number;
  retry: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

// 환경별 캐시 설정
export const getCacheConfig = (): CacheConfig => {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    staleTime: isDev ? 30 * 1000 : 5 * 60 * 1000, // 개발: 30초, 프로덕션: 5분
    gcTime: isDev ? 2 * 60 * 1000 : 10 * 60 * 1000, // 개발: 2분, 프로덕션: 10분
    retry: isDev ? 1 : 3, // 개발: 1회, 프로덕션: 3회
    refetchOnWindowFocus: isDev, // 개발에서만 활성화
    refetchOnReconnect: true,
  };
};
