/**
 * 학습 관련 에러 처리를 위한 커스텀 훅
 */

import { ERROR_MESSAGES } from '@/lib/constants/learning';
import { useCallback } from 'react';

interface LearningError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

interface UseLearningErrorReturn {
  handleError: (error: unknown) => LearningError;
  isNetworkError: (error: unknown) => boolean;
  isAuthError: (error: unknown) => boolean;
  isValidationError: (error: unknown) => boolean;
  getErrorMessage: (error: unknown) => string;
}

/**
 * 학습 관련 에러 처리를 위한 커스텀 훅
 * @returns 에러 처리 함수들
 */
export function useLearningError(): UseLearningErrorReturn {
  const handleError = useCallback((error: unknown): LearningError => {
    console.error('Learning Error:', error);

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        details: { stack: error.stack },
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR',
      };
    }

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      return {
        message: (errorObj.message as string) || ERROR_MESSAGES.PROGRESS_FETCH_FAILED,
        code: (errorObj.code as string) || 'OBJECT_ERROR',
        details: errorObj,
      };
    }

    return {
      message: ERROR_MESSAGES.PROGRESS_FETCH_FAILED,
      code: 'UNKNOWN_ERROR',
    };
  }, []);

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.name === 'TypeError'
      );
    }
    return false;
  }, []);

  const isAuthError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('unauthorized') ||
        error.message.includes('forbidden') ||
        error.message.includes('401') ||
        error.message.includes('403')
      );
    }
    return false;
  }, []);

  const isValidationError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('validation') ||
        error.message.includes('invalid') ||
        error.message.includes('required')
      );
    }
    return false;
  }, []);

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      const handledError = handleError(error);

      if (isNetworkError(error)) {
        return '네트워크 연결을 확인하고 다시 시도해주세요.';
      }

      if (isAuthError(error)) {
        return '인증이 필요합니다. 다시 로그인해주세요.';
      }

      if (isValidationError(error)) {
        return '입력한 정보를 확인해주세요.';
      }

      return handledError.message;
    },
    [handleError, isNetworkError, isAuthError, isValidationError],
  );

  return {
    handleError,
    isNetworkError,
    isAuthError,
    isValidationError,
    getErrorMessage,
  };
}
