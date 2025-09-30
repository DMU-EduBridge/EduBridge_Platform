'use client';

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProblemHeaderProps {
  currentIndex: number;
  totalCount: number;
  progressData: {
    total: number;
    completed: number;
  };
  attemptNumber?: number;
  elapsedTime?: number; // 초 단위
}

export function ProblemHeader({
  currentIndex,
  totalCount,
  progressData,
  attemptNumber,
  elapsedTime,
}: ProblemHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      {/* 네비게이션 버튼들 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/my/learning')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            학습 목록
          </Button>
        </div>
      </div>

      {/* 진행률 정보 */}
      <div className="mb-4 rounded-lg bg-blue-50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-blue-700">
          <span>총 문항 수: {progressData.total} 문제</span>
          <span>완료된 문항: {progressData.completed} 문제</span>
          <span>남은 문항 수: {Math.max(0, progressData.total - progressData.completed)} 문제</span>
        </div>

        {/* 진행 상황 표시 */}
        <div className="mb-2">
          <div className="text-center text-sm text-blue-600">
            {progressData.completed} / {progressData.total} 문제 완료
          </div>
          {typeof attemptNumber === 'number' && attemptNumber > 0 && (
            <div className="mt-1 text-center text-xs text-blue-500">
              {attemptNumber}번째 시도 진행 중
            </div>
          )}
          {typeof elapsedTime === 'number' && (
            <div className="mt-1 text-center text-xs text-blue-500">
              경과 시간: {Math.floor(elapsedTime / 60)}분 {elapsedTime % 60}초
            </div>
          )}
        </div>
      </div>

      {/* 현재 문제 정보 */}
      <div className="text-center text-gray-600">
        문제 {currentIndex} / {totalCount}
        {progressData.completed === progressData.total && (
          <span className="ml-2 font-medium text-green-600">(모든 문제 완료)</span>
        )}
      </div>
    </div>
  );
}
