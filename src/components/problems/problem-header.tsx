'use client';

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

interface ProblemHeaderProps {
  currentIndex: number;
  totalCount: number;
  attemptNumber?: number;
  startTime?: Date;
  isActive?: boolean;
  studyTitle?: string | undefined;
  subject?: string | undefined;
}

export const ProblemHeader = memo(function ProblemHeader({
  currentIndex,
  totalCount,
  startTime,
  studyTitle,
  subject,
}: ProblemHeaderProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 타이머 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 타이머 포맷팅 (MM:SS)
  const formatTimer = () => {
    if (!startTime) return '00:00';
    const diffSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const timeSpent = Number.isFinite(diffSeconds) ? Math.max(0, diffSeconds) : 0;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-6">
      {/* 상단 헤더 - 피그마 디자인 */}
      <div className="mb-6 flex flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">단원별 학습하기</h1>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-base font-semibold text-gray-700 sm:text-lg">
            <span className="text-blue-600">{formatTimer()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/my/learning')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm font-medium sm:text-base">HOME</span>
          </Button>
        </div>
      </div>

      {/* 파란색 네비게이션 바 - 피그마 디자인 */}
      <div className="mb-6 bg-blue-600 p-6 text-white sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-base font-semibold sm:text-lg">
            {studyTitle || '단원별 학습하기'}
            {subject && ` - ${subject}`}
          </div>
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:gap-6 sm:text-sm">
            <span>총 문항 수: {totalCount} 문제</span>
            <span>남은 문항 수: {Math.max(0, totalCount - currentIndex + 1)} 문제</span>
          </div>
        </div>
      </div>
    </div>
  );
});
