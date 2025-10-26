import { logger } from '@/lib/monitoring';
import { problemsService } from '@/services/problems';
import type { AttemptPostResponse, SolutionResponse } from '@/types/api';
import type { CreateProblemRequest, UpdateProblemRequest } from '@/types/domain/problem';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { problemKeys } from '../keys/problems';

/**
 * 문제 검색 및 필터 파라미터 타입 (서비스 호환)
 */
export interface ProblemFilters {
  search?: string;
  subject?: string;
  difficulty?: string;
  creationType?: string;
  page?: number;
  limit?: number;
}

/**
 * 문제 관리용 통합 훅 (개선된 버전)
 *
 * 주요 개선사항:
 * - 표준화된 에러 처리 및 토스트 알림
 * - 최적화된 캐싱 전략
 * - 로딩 상태 개선
 * - 타입 안정성 강화
 * - 성능 최적화된 쿼리 무효화
 *
 * @param filters 검색 및 필터 파라미터
 */
export function useProblems(filters?: ProblemFilters) {
  const queryClient = useQueryClient();

  // 문제 목록 조회 (최적화된 캐싱)
  const problemsQuery = useQuery({
    queryKey: problemKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await problemsService.getProblems(filters);
        return response.data.data || { problems: [], total: 0 };
      } catch (error) {
        logger.error(
          '문제 목록 조회 실패',
          error instanceof Error ? error : new Error(String(error)),
          { filters },
        );
        throw new Error('문제 목록을 불러올 수 없습니다.');
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 신선한 데이터로 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // 개별 문제 조회 훅 (지연 로딩)
  const useProblem = (id: string) =>
    useQuery({
      queryKey: problemKeys.detail(id),
      queryFn: async () => {
        try {
          const response = await problemsService.getProblem(id);
          return response.data;
        } catch (error) {
          logger.error(
            `문제 ${id} 조회 실패`,
            error instanceof Error ? error : new Error(String(error)),
            { problemId: id },
          );
          throw new Error('문제를 불러올 수 없습니다.');
        }
      },
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10분간 신선한 데이터로 간주
      gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    });

  // 통계 조회 (장기 캐싱)
  const statsQuery = useQuery({
    queryKey: problemKeys.stats,
    queryFn: async () => {
      try {
        const response = await problemsService.getProblemStats();
        return response.data.data || {};
      } catch (error) {
        logger.error('통계 조회 실패', error instanceof Error ? error : new Error(String(error)));
        throw new Error('통계를 불러올 수 없습니다.');
      }
    },
    staleTime: 15 * 60 * 1000, // 15분간 신선한 데이터로 간주
    gcTime: 60 * 60 * 1000, // 1시간간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 새로고침 비활성화
  });

  // 문제 생성 뮤테이션 (개선된 에러 처리)
  const createMutation = useMutation({
    mutationFn: async (data: CreateProblemRequest) => {
      try {
        const response = await problemsService.createProblem(data as any);
        return response.data;
      } catch (error) {
        logger.error('문제 생성 실패', error instanceof Error ? error : new Error(String(error)), {
          data,
        });
        throw new Error('문제 생성에 실패했습니다.');
      }
    },
    onSuccess: (_data) => {
      // 성공 토스트
      toast.success('문제가 성공적으로 생성되었습니다.');

      // 관련 쿼리 무효화 (최적화된 무효화)
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      queryClient.invalidateQueries({ queryKey: problemKeys.list() });

      // 통계도 업데이트
      queryClient.invalidateQueries({ queryKey: problemKeys.stats });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '문제 생성에 실패했습니다.';
      toast.error(errorMessage);
    },
  });

  // 문제 수정 뮤테이션 (개선된 에러 처리)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProblemRequest }) => {
      try {
        const response = await problemsService.updateProblem(id, data as any);
        return response.data;
      } catch (error) {
        logger.error(
          `문제 ${id} 수정 실패`,
          error instanceof Error ? error : new Error(String(error)),
          { problemId: id, data },
        );
        throw new Error('문제 수정에 실패했습니다.');
      }
    },
    onSuccess: (_data, { id }) => {
      toast.success('문제가 성공적으로 수정되었습니다.');

      // 최적화된 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      queryClient.invalidateQueries({ queryKey: problemKeys.list() });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '문제 수정에 실패했습니다.';
      toast.error(errorMessage);
    },
  });

  // 문제 삭제 뮤테이션 (개선된 에러 처리)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await problemsService.deleteProblem(id);
        return id;
      } catch (error) {
        logger.error(
          `문제 ${id} 삭제 실패`,
          error instanceof Error ? error : new Error(String(error)),
          { problemId: id },
        );
        throw new Error('문제 삭제에 실패했습니다.');
      }
    },
    onSuccess: (id) => {
      toast.success('문제가 성공적으로 삭제되었습니다.');

      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      queryClient.invalidateQueries({ queryKey: problemKeys.list() });
      queryClient.invalidateQueries({ queryKey: problemKeys.stats });

      // 삭제된 문제의 상세 정보 캐시 제거
      queryClient.removeQueries({ queryKey: problemKeys.detail(id) });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '문제 삭제에 실패했습니다.';
      toast.error(errorMessage);
    },
  });

  // 해답 조회 훅 (개선된 에러 처리)
  const useSolution = (id: string, enabled: boolean) =>
    useQuery<SolutionResponse>({
      queryKey: problemKeys.solution(id),
      queryFn: async () => {
        try {
          const response = await problemsService.getProblemSolution(id);
          return response.data;
        } catch (error) {
          logger.error(
            `문제 ${id} 해답 조회 실패`,
            error instanceof Error ? error : new Error(String(error)),
            { problemId: id },
          );
          throw new Error('해답을 불러올 수 없습니다.');
        }
      },
      enabled: enabled && !!id,
      staleTime: 30 * 60 * 1000, // 30분간 신선한 데이터로 간주
      gcTime: 60 * 60 * 1000, // 1시간간 캐시 유지
    });

  // 시도 생성 뮤테이션 (개선된 에러 처리)
  const useAttemptMutation = (id: string) =>
    useMutation<AttemptPostResponse, unknown, { selected: string }>({
      mutationKey: problemKeys.attempt(id),
      mutationFn: async (payload: { selected: string }) => {
        try {
          const response = await problemsService.createProblemAttempt(id, payload);
          return response.data;
        } catch (error) {
          logger.error(
            `문제 ${id} 시도 생성 실패`,
            error instanceof Error ? error : new Error(String(error)),
            { problemId: id, payload },
          );
          throw new Error('답안 제출에 실패했습니다.');
        }
      },
      onSuccess: (_data) => {
        toast.success('답안이 성공적으로 제출되었습니다.');

        // 해답 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: problemKeys.solution(id) });

        // 통계 업데이트
        queryClient.invalidateQueries({ queryKey: problemKeys.stats });
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '답안 제출에 실패했습니다.';
        toast.error(errorMessage);
      },
    });

  return {
    // 쿼리들
    problems: problemsQuery,
    problem: useProblem,
    stats: statsQuery,

    // 뮤테이션들
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,

    // 클로저 훅들
    solve: useSolution,
    attempt: useAttemptMutation,

    // 유틸리티 함수들
    utils: {
      // 캐시 무효화 헬퍼
      invalidateAll: () => {
        queryClient.invalidateQueries({ queryKey: problemKeys.all });
      },

      // 특정 문제 캐시 제거
      removeProblem: (id: string) => {
        queryClient.removeQueries({ queryKey: problemKeys.detail(id) });
      },

      // 프리페치 헬퍼
      prefetchProblem: async (id: string) => {
        await queryClient.prefetchQuery({
          queryKey: problemKeys.detail(id),
          queryFn: async () => {
            const response = await problemsService.getProblem(id);
            return response.data;
          },
          staleTime: 10 * 60 * 1000,
        });
      },
    },
  };
}
