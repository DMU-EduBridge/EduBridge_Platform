'use client';

import { PageErrorBoundary } from '@/components/ui/error-boundary';
import { PageLoading } from '@/components/ui/loading';
import { ReactNode, Suspense } from 'react';

// 기본 Suspense 래퍼
interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

export function SuspenseWrapper({
  children,
  fallback = <PageLoading />,
  errorBoundary = true,
}: SuspenseWrapperProps) {
  const content = <Suspense fallback={fallback}>{children}</Suspense>;

  if (errorBoundary) {
    return <PageErrorBoundary>{content}</PageErrorBoundary>;
  }

  return content;
}

// 페이지 레벨 Suspense (서버 컴포넌트용)
export function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </PageErrorBoundary>
  );
}

// 컴포넌트 레벨 Suspense (클라이언트 컴포넌트용)
export function ComponentSuspense({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback || <PageLoading />}>{children}</Suspense>;
}

// 데이터 페칭용 Suspense
export function DataSuspense({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback || <PageLoading />}>{children}</Suspense>;
}
