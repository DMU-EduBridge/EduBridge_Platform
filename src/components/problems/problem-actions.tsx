'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';

interface ProblemActionsProps {
  selectedAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  isLastProblem: boolean;
  onSubmit: () => void;
  onNext: () => void;
  timeSpent?: number;
}

export const ProblemActions = memo(function ProblemActions({
  selectedAnswer,
  showResult,
  isCorrect,
  isLastProblem,
  onSubmit,
  onNext,
  timeSpent,
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
    <div className="mb-6">
      {/* 결과 피드백 */}
      <div className="mb-4 rounded-lg p-4 text-center">
        <div className={`mb-2 text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? '🎉 정답입니다!' : '😔 틀렸습니다'}
        </div>

        {/* 상세 피드백 */}
        <div className="space-y-2 text-sm text-gray-600">
          {timeSpent && (
            <div>
              소요 시간: {Math.floor(timeSpent / 60)}분 {timeSpent % 60}초
            </div>
          )}
          {isCorrect ? (
            <div className="text-green-600">잘하셨습니다! 다음 문제로 넘어가세요.</div>
          ) : (
            <div className="text-red-600">다시 시도해보세요. 해설을 확인해보는 것도 좋습니다.</div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-center">
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
    </div>
  );
});
