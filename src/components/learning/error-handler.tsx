/**
 * 학습 관련 에러 핸들러 컴포넌트
 */

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorHandlerProps {
  error: Error;
  reset: () => void;
  title?: string;
  description?: string;
  showRetryButton?: boolean;
  showGoBackButton?: boolean;
}

/**
 * 에러 발생 시 표시되는 컴포넌트
 * @param props 에러 핸들러 props
 * @returns JSX.Element
 */
export function ErrorHandler({
  error,
  reset,
  title = '오류가 발생했습니다',
  description = '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
  showRetryButton = true,
  showGoBackButton = true,
}: ErrorHandlerProps) {
  const router = useRouter();

  // 에러 로깅
  useEffect(() => {
    console.error('Learning Error:', error);
  }, [error]);

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mb-6 text-gray-600">{description}</p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              개발자 정보 (개발 모드에서만 표시)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-800">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showRetryButton && (
            <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          )}

          {showGoBackButton && (
            <Button onClick={handleGoBack} className="flex items-center gap-2">
              이전 페이지로
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 네트워크 에러용 핸들러
 */
export function NetworkErrorHandler({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorHandler
      error={error}
      reset={reset}
      title="네트워크 연결 오류"
      description="인터넷 연결을 확인하고 다시 시도해주세요."
    />
  );
}

/**
 * 인증 에러용 핸들러
 */
export function AuthErrorHandler({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorHandler
      error={error}
      reset={reset}
      title="인증 오류"
      description="로그인이 필요합니다. 다시 로그인해주세요."
      showRetryButton={false}
    />
  );
}

/**
 * 데이터 로딩 에러용 핸들러
 */
export function DataLoadingErrorHandler({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorHandler
      error={error}
      reset={reset}
      title="데이터 로딩 오류"
      description="데이터를 불러오는 중 오류가 발생했습니다."
    />
  );
}
