'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ProblemErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Problem Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">문제를 불러올 수 없습니다</h1>
            <p className="mt-2 text-gray-600">
              {this.state.error?.message || '예상치 못한 오류가 발생했습니다.'}
            </p>
            <div className="mt-6 space-x-4">
              <Button onClick={() => window.location.reload()}>새로고침</Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                돌아가기
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 로딩 컴포넌트
export function ProblemLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
      </div>

      {/* 문제 카드 스켈레톤 */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 h-6 w-16 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* 답안 입력 스켈레톤 */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 h-6 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
      </div>

      {/* 버튼 스켈레톤 */}
      <div className="flex justify-center">
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

// 로딩 스피너 컴포넌트
export function LoadingSpinner({
  size = 'md',
  text,
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
}
