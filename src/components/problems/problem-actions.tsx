'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface ProblemActionsProps {
  selectedAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  isLastProblem: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onRetry: () => void;
}

export function ProblemActions({
  selectedAnswer,
  showResult,
  isCorrect,
  isLastProblem,
  onSubmit,
  onNext,
  onRetry,
}: ProblemActionsProps) {
  if (!showResult) {
    return (
      <div className="mb-6 flex justify-center">
        <Button
          onClick={onSubmit}
          disabled={!selectedAnswer}
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
        >
          정답 확인
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 flex justify-center gap-4">
      <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4" />
        다시 풀기
      </Button>
      <Button
        onClick={onNext}
        className={`flex items-center gap-2 ${
          isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
        } rounded-lg px-8 py-3 text-lg text-white`}
      >
        {isLastProblem ? '결과 보기' : '다음 문제'}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
