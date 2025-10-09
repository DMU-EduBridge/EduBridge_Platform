'use client';

import type { Problem } from '@/types/domain/problem';
import { memo } from 'react';

interface ProblemOptionsProps {
  problem: Problem;
  selectedAnswer: string;
  showResult: boolean;
  onAnswerSelect: (answer: string) => void;
}

export const ProblemOptions = memo(function ProblemOptions({
  problem,
  selectedAnswer,
  showResult,
  onAnswerSelect,
}: ProblemOptionsProps) {
  return (
    <div className="mb-6">
      <div className="space-y-3">
        {problem.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === problem.correctAnswer;
          const isWrong = isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              disabled={showResult}
              className={`
                w-full rounded-lg border-2 p-3 text-left transition-all duration-200 sm:p-4
                ${
                  isSelected
                    ? showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-100 text-green-800'
                        : 'border-red-500 bg-red-100 text-red-800'
                      : 'border-blue-500 bg-blue-100 text-blue-800'
                    : showResult && isCorrect
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }
                ${!showResult && 'cursor-pointer hover:shadow-md'}
                ${showResult && 'cursor-default'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-base font-medium sm:text-lg">
                  {index + 1}. {option}
                </span>
                {showResult && isCorrect && (
                  <span className="ml-auto text-sm font-medium text-green-600 sm:text-base">
                    ✓ 정답
                  </span>
                )}
                {showResult && isWrong && (
                  <span className="ml-auto text-sm font-medium text-red-600 sm:text-base">
                    ✗ 오답
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
