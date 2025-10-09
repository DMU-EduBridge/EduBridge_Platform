'use client';

import { memo } from 'react';
import type { Problem } from '@/types/domain/problem';

interface ProblemContentProps {
  problem: Problem;
  currentIndex: number;
}

export const ProblemContent = memo(function ProblemContent({
  problem,
  currentIndex,
}: ProblemContentProps) {
  return (
    <div className="mb-8">
      {/* 문제 내용 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-4 sm:p-6">
        <div className="text-base leading-relaxed text-gray-800 sm:text-lg">
          {currentIndex}. {problem.content}
        </div>
        {problem.points && (
          <div className="mt-4 text-right text-xs text-gray-500 sm:text-sm">
            [{problem.points}점]
          </div>
        )}
      </div>
    </div>
  );
});
