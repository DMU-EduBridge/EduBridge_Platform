import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';

/**
 * 공통 쿼리 옵션 타입
 */
export interface CommonQueryOptions<_T> {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
}

/**
 * 공통 뮤테이션 옵션 타입
 */
export interface CommonMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 공통 쿼리 훅 생성기
 */
export function createQueryHook<TData, TVariables = void>(
  queryKeyFactory: (variables?: TVariables) => readonly (string | number | boolean)[],
  queryFn: (variables?: TVariables) => Promise<ApiResponse<TData>>,
  defaultOptions?: CommonQueryOptions<TData>,
) {
  return function useQueryHook(
    variables?: TVariables,
    options?: Partial<
      UseQueryOptions<
        ApiResponse<TData>,
        Error,
        ApiResponse<TData>,
        readonly (string | number | boolean)[]
      >
    >,
  ) {
    const queryKey = queryKeyFactory(variables);

    return useQuery({
      queryKey,
      queryFn: () => queryFn(variables),
      enabled: options?.enabled ?? defaultOptions?.enabled ?? true,
      staleTime: options?.staleTime ?? defaultOptions?.staleTime ?? 5 * 60 * 1000, // 5분
      gcTime: options?.gcTime ?? defaultOptions?.gcTime ?? 10 * 60 * 1000, // 10분
      refetchOnWindowFocus:
        options?.refetchOnWindowFocus ?? defaultOptions?.refetchOnWindowFocus ?? false,
      retry: options?.retry ?? defaultOptions?.retry ?? 3,
    });
  };
}

/**
 * 공통 뮤테이션 훅 생성기
 */
export function createMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    invalidateQueries?: (variables: TVariables) => (string | number | boolean)[][];
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  },
) {
  return function useMutationHook(
    customOptions?: Partial<UseMutationOptions<ApiResponse<TData>, Error, TVariables>>,
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,
      onSuccess: (data, variables) => {
        // 쿼리 무효화
        if (options?.invalidateQueries) {
          const queryKeys = options.invalidateQueries(variables);
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }

        // 커스텀 성공 핸들러
        if (options?.onSuccess && data.success && data.data) {
          options.onSuccess(data.data, variables);
        }

        // 사용자 정의 성공 핸들러
        if (customOptions?.onSuccess) {
          customOptions.onSuccess(data, variables, undefined);
        }
      },
      onError: (error, variables) => {
        // 커스텀 에러 핸들러
        if (options?.onError) {
          options.onError(error, variables);
        }

        // 사용자 정의 에러 핸들러
        if (customOptions?.onError) {
          customOptions.onError(error, variables, undefined);
        }
      },
      ...customOptions,
    });
  };
}

/**
 * CRUD 작업을 위한 통합 훅 생성기
 */
export function createCrudHooks<TData, TCreateData, TUpdateData>(config: {
  // 쿼리 키 팩토리
  queryKeys: {
    list: (params?: any) => readonly (string | number | boolean)[];
    detail: (id: string) => readonly (string | number | boolean)[];
    all: () => readonly (string | number | boolean)[];
  };
  // API 함수들
  api: {
    list: (params?: any) => Promise<ApiResponse<PaginatedResponse<TData>>>;
    detail: (id: string) => Promise<ApiResponse<TData>>;
    create: (data: TCreateData) => Promise<ApiResponse<TData>>;
    update: (id: string, data: TUpdateData) => Promise<ApiResponse<TData>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
  };
  // 기본 옵션
  defaultOptions?: CommonQueryOptions<TData>;
}) {
  // 목록 조회 훅
  const useList = createQueryHook(config.queryKeys.list, config.api.list, config.defaultOptions);

  // 상세 조회 훅
  const useDetail = createQueryHook(
    (id?: string) => (id ? config.queryKeys.detail(id) : []),
    (id?: string) =>
      id ? config.api.detail(id) : Promise.resolve({ success: false, error: 'ID is required' }),
    { ...config.defaultOptions, enabled: false },
  );

  // 생성 뮤테이션 훅
  const useCreate = createMutationHook(config.api.create, {
    invalidateQueries: () => [config.queryKeys.all(), config.queryKeys.list()] as any,
  });

  // 수정 뮤테이션 훅
  const useUpdate = createMutationHook(
    ({ id, data }: { id: string; data: TUpdateData }) => config.api.update(id, data),
    {
      invalidateQueries: ({ id }) =>
        [config.queryKeys.all(), config.queryKeys.list(), config.queryKeys.detail(id)] as any,
    },
  );

  // 삭제 뮤테이션 훅
  const useDelete = createMutationHook((id: string) => config.api.delete(id), {
    invalidateQueries: () => [config.queryKeys.all(), config.queryKeys.list()] as any,
  });

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}

/**
 * 에러 메시지 추출 헬퍼
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * API 응답에서 데이터 추출 헬퍼
 */
export function extractApiData<T>(response: ApiResponse<T>): T | null {
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

/**
 * 로딩 상태 관리 훅
 */
export function useLoadingState(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}

/**
 * 에러 상태 관리 훅
 */
export function useErrorState() {
  const [error, setError] = useState<string | null>(null);

  const setErrorState = useCallback((error: string | null) => setError(error), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    error,
    setError: setErrorState,
    clearError,
  };
}
