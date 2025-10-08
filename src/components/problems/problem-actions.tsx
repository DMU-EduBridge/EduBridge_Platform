'use client';

import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface ProblemActionsProps {
  selectedAnswer: string;
  showResult: boolean;
  isLastProblem: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
}

export const ProblemActions = memo(function ProblemActions({
  selectedAnswer,
  showResult,
  isLastProblem,
  onSubmit,
  onNext,
  onPrevious,
  currentIndex,
}: ProblemActionsProps) {
  return (
    <div className="flex flex-col gap-3 px-4 px-4 sm:flex-row sm:justify-center sm:gap-4">
      {/* 이전 버튼 */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 1}
        className="w-full rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
      >
        이전
      </Button>

      {/* 제출/다음 버튼 */}
      {!showResult ? (
        <Button
          onClick={onSubmit}
          disabled={!selectedAnswer}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
        >
          제출
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto sm:px-8"
        >
          {isLastProblem ? '완료' : '다음'}
        </Button>
      )}
    </div>
  );
});
