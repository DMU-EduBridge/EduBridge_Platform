'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProblemHeaderProps {
  studyId: string;
  currentIndex: number;
  totalCount: number;
  progressData: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export function ProblemHeader({
  studyId,
  currentIndex,
  totalCount,
  progressData,
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
            onClick={() => router.push(`/my/learning/${encodeURIComponent(studyId)}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            학습 홈으로 이동
          </Button>
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
          <span>남은 문항 수: {progressData.total - progressData.completed} 문제</span>
        </div>

        {/* 진행률 바 */}
        <div className="mb-2 h-2 w-full rounded-full bg-blue-200">
          <div
            className="h-2 rounded-full bg-white transition-all duration-300"
            style={{
              width: `${progressData.percentage}%`,
            }}
          />
        </div>

        <div className="text-center text-sm text-blue-600">진행률: {progressData.percentage}%</div>
      </div>

      {/* 현재 문제 정보 */}
      <div className="text-center text-gray-600">
        문제 {currentIndex} / {totalCount}
      </div>
    </div>
  );
}
