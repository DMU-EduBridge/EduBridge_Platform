'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

// 접근성을 고려한 기본 로딩 스피너
export function LoadingSpinner({
  size = 'default',
  className = '',
  'aria-label': ariaLabel,
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  'aria-label'?: string;
}) {
  const t = useTranslations('loading');

  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel || t('page')}
    />
  );
}

// 접근성을 고려한 페이지 로딩 컴포넌트
export const PageLoading = memo(function PageLoading() {
  const t = useTranslations('loading');

  return (
    <div
      className="flex min-h-[400px] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={t('page')}
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600" aria-hidden="true">
          {t('page')}
        </p>
        <span className="sr-only">{t('page')}</span>
      </div>
    </div>
  );
});

// 접근성을 고려한 카드 로딩 스켈레톤
export const CardLoading = memo(function CardLoading() {
  const t = useTranslations('loading');

  return (
    <Card role="status" aria-label={t('content')}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" aria-hidden="true" />
          <Skeleton className="h-4 w-1/2" aria-hidden="true" />
          <Skeleton className="h-20 w-full" aria-hidden="true" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" aria-hidden="true" />
            <Skeleton className="h-8 w-20" aria-hidden="true" />
          </div>
        </div>
        <span className="sr-only">{t('content')}</span>
      </CardContent>
    </Card>
  );
});

// 접근성을 고려한 문제 카드 로딩 스켈레톤
export const ProblemCardLoading = memo(function ProblemCardLoading() {
  const t = useTranslations('loading');

  return (
    <Card className="transition-shadow hover:shadow-md" role="status" aria-label={t('problems')}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" aria-hidden="true" />
              <Skeleton className="h-4 w-1/2" aria-hidden="true" />
            </div>
            <Skeleton className="h-6 w-16" aria-hidden="true" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" aria-hidden="true" />
            <Skeleton className="h-5 w-12" aria-hidden="true" />
            <Skeleton className="h-5 w-16" aria-hidden="true" />
          </div>

          <Skeleton className="h-16 w-full" aria-hidden="true" />

          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" aria-hidden="true" />
            <Skeleton className="h-8 w-20" aria-hidden="true" />
          </div>
        </div>
        <span className="sr-only">{t('problems')}</span>
      </CardContent>
    </Card>
  );
});

// 접근성을 고려한 학습 카드 로딩 스켈레톤
export const StudyCardLoading = memo(function StudyCardLoading() {
  const t = useTranslations('loading');

  return (
    <Card
      className="relative rounded-xl border border-slate-200 p-8"
      role="status"
      aria-label={t('content')}
    >
      <div className="absolute right-6 top-8">
        <Skeleton className="h-6 w-12" aria-hidden="true" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" aria-hidden="true" />
        <Skeleton className="h-4 w-full" aria-hidden="true" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" aria-hidden="true" />
            <Skeleton className="h-4 w-32" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" aria-hidden="true" />
            <Skeleton className="h-4 w-24" aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Skeleton className="h-12 w-full" aria-hidden="true" />
          <Skeleton className="h-12 w-full" aria-hidden="true" />
          <Skeleton className="h-12 w-full" aria-hidden="true" />
        </div>
      </div>
      <span className="sr-only">{t('content')}</span>
    </Card>
  );
});

// 접근성을 고려한 테이블 로딩 스켈레톤
export const TableLoading = memo(function TableLoading({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  const t = useTranslations('loading');

  return (
    <div
      className="space-y-3"
      role="status"
      aria-label={`${t('content')} (${rows}행 ${columns}열)`}
    >
      {/* 테이블 헤더 */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" aria-hidden="true" />
        ))}
      </div>

      {/* 테이블 행들 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-24" aria-hidden="true" />
          ))}
        </div>
      ))}
      <span className="sr-only">{t('content')}</span>
    </div>
  );
});

// 접근성을 고려한 인라인 로딩 (버튼 내부 등)
export const InlineLoading = memo(function InlineLoading({ text }: { text?: string }) {
  const t = useTranslations('loading');
  const loadingText = text || t('processing');

  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <LoadingSpinner size="sm" aria-label={loadingText} />
      <span className="text-sm text-gray-600">{loadingText}</span>
    </div>
  );
});

// 접근성을 고려한 전체 화면 로딩 오버레이
export const FullScreenLoading = memo(function FullScreenLoading({
  message,
}: {
  message?: string;
}) {
  const t = useTranslations('loading');
  const loadingMessage = message || t('page');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      aria-describedby="loading-description"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-600" />
        <h2 id="loading-title" className="text-lg font-medium text-gray-900">
          {loadingMessage}
        </h2>
        <p id="loading-description" className="sr-only">
          {t('page')}
        </p>
      </div>
    </div>
  );
});

// 조건부 로딩 컴포넌트 (접근성 개선)
interface ConditionalLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingText?: string;
}

export function ConditionalLoading({
  isLoading,
  children,
  fallback,
  loadingText,
}: ConditionalLoadingProps) {
  const t = useTranslations('loading');

  if (isLoading) {
    return (
      <>
        {fallback || <PageLoading />}
        <span className="sr-only">{loadingText || t('page')}</span>
      </>
    );
  }

  return <>{children}</>;
}
