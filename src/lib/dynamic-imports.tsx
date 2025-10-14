'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { ComponentType, lazy, Suspense } from 'react';

// 로딩 컴포넌트
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
}

// 기본 로딩 컴포넌트
export function DefaultLoading() {
  return <LoadingSpinner text="로딩 중..." />;
}

// 에러 바운더리 컴포넌트
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={() => this.setState({ hasError: false, error: undefined as any })}
        />
      );
    }

    return this.props.children;
  }
}

// 기본 에러 폴백 컴포넌트
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="mb-2 text-lg font-semibold text-red-600">오류가 발생했습니다</h2>
      <p className="mb-4 text-sm text-gray-600">{error.message}</p>
      <button
        onClick={resetError}
        className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      >
        다시 시도
      </button>
    </div>
  );
}

// 동적 임포트 래퍼
interface DynamicImportProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

export function DynamicImport({
  children,
  fallback: Fallback = DefaultLoading,
}: DynamicImportProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// 페이지별 동적 임포트
export const DynamicDashboard = lazy(() => import('@/app/(afterLogin)/dashboard/page'));
export const DynamicProblems = lazy(() => import('@/app/(afterLogin)/problems/page'));
export const DynamicProblemDetail = lazy(
  () => import('@/app/(afterLogin)/problems/[problemId]/page'),
);
export const DynamicStudents = lazy(() => import('@/app/(afterLogin)/students/page'));
export const DynamicReports = lazy(() => import('@/app/(afterLogin)/reports/page'));
export const DynamicSettings = lazy(() => import('@/app/(afterLogin)/settings/page'));

// 컴포넌트별 동적 임포트 (실제 존재하는 컴포넌트만)
export const DynamicFileUpload = lazy(() =>
  import('@/components/ui/file-upload').then((module) => ({ default: module.FileUpload })),
);

// 차트 라이브러리 동적 임포트
export const DynamicLineChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.LineChart })),
);
export const DynamicBarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart })),
);
export const DynamicPieChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.PieChart })),
);

// 에디터 컴포넌트 동적 임포트 (실제 존재하는 컴포넌트만)
// export const DynamicRichTextEditor = lazy(() => import('@/components/ui/rich-text-editor'));
// export const DynamicCodeEditor = lazy(() => import('@/components/ui/code-editor'));

// 유틸리티 함수들
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType,
) {
  const LazyComponent = lazy(importFunc);

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <DynamicImport fallback={fallback || DefaultLoading}>
        <LazyComponent {...props} />
      </DynamicImport>
    );
  };
}

// 조건부 동적 임포트
export function conditionalImport<T>(
  condition: boolean,
  importFunc: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (condition) {
    return importFunc();
  }
  return Promise.resolve(fallback);
}

// 프리로딩 유틸리티
export function preloadComponent(importFunc: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // 브라우저에서만 프리로딩
    importFunc();
  }
}

// 페이지 프리로딩
export function preloadPage(path: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  }
}

// 컴포넌트 프리로딩
export function preloadComponents() {
  if (typeof window !== 'undefined') {
    // 자주 사용되는 컴포넌트들을 프리로딩
    preloadComponent(() => import('@/components/ui/file-upload'));
  }
}

// 라우트 프리로딩
export function preloadRoutes() {
  if (typeof window !== 'undefined') {
    // 자주 사용되는 페이지들을 프리로딩
    preloadPage('/dashboard');
    preloadPage('/problems');
    preloadPage('/students');
  }
}

// 초기화 시 프리로딩 실행
if (typeof window !== 'undefined') {
  // 페이지 로드 후 프리로딩 실행
  setTimeout(() => {
    preloadComponents();
    preloadRoutes();
  }, 1000);
}
