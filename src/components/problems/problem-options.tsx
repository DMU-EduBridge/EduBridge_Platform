'use client';

import type { Problem } from '@/types/domain/problem';
import { memo } from 'react';

interface ProblemOptionsProps {
  problem: Problem;
  selectedAnswer: string;
  showResult: boolean;
  onAnswerSelect: (answer: string, index: number) => void;
}

export const ProblemOptions = memo(function ProblemOptions({
  problem,
  selectedAnswer,
  showResult,
  onAnswerSelect,
}: ProblemOptionsProps) {
  // 디버깅을 위한 로그
  console.log('ProblemOptions - problem:', problem);
  console.log('ProblemOptions - problem.options:', problem.options);
  console.log('ProblemOptions - problem.options type:', typeof problem.options);
  console.log('ProblemOptions - problem.options length:', problem.options?.length);
  console.log('ProblemOptions - selectedAnswer:', selectedAnswer);
  console.log('ProblemOptions - selectedAnswer type:', typeof selectedAnswer);

  // options가 없거나 빈 배열인 경우 처리
  if (!problem.options || problem.options.length === 0) {
    return (
      <div className="mb-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-center text-yellow-800">
            이 문제에는 선택지가 없습니다. (문제 타입: {problem.type})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="space-y-3">
        {problem.options.map((option, index) => {
          // selectedAnswer가 인덱스+1 문자열이므로 비교 로직 수정
          const selectedIndex = selectedAnswer ? parseInt(selectedAnswer) - 1 : -1;
          const isSelected = selectedIndex === index;
          const correctAnswerIndex = problem.options.findIndex(
            (opt) => opt === problem.correctAnswer,
          );
          const isCorrect = index === correctAnswerIndex;
          const isWrong = isSelected && !isCorrect;

          // 디버깅 로그
          console.log(`옵션 ${index + 1}:`, {
            option,
            selectedAnswer,
            selectedIndex,
            isSelected,
            correctAnswer: problem.correctAnswer,
            isCorrect,
          });

          return (
            <button
              key={index}
              onClick={() => {
                console.log('옵션 클릭:', { option, index, indexPlusOne: index + 1 });
                onAnswerSelect(option, index);
              }}
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
