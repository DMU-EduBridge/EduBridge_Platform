'use client';

import { memo } from 'react';
import type { Problem } from '@/types/domain/problem';

interface ProblemExplanationProps {
  problem: Problem;
  showResult: boolean;
  isCorrect: boolean;
}

export const ProblemExplanation = memo(function ProblemExplanation({
  problem,
  showResult,
  isCorrect,
}: ProblemExplanationProps) {
  if (!showResult) {
    return null;
  }

  return (
    <div
      className={`mb-8 rounded-lg border-2 ${
        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      } p-4`}
    >
      <div
        className={`mb-3 text-base font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
      >
        풀이
      </div>
      <div className="text-sm leading-relaxed text-gray-800">{problem.explanation}</div>
    </div>
  );
});
