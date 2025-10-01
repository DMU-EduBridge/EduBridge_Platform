'use client';

import { memo } from 'react';

interface Problem {
  id: string;
  title: string;
  description?: string | undefined;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE' | 'CODING' | 'MATH';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  subject: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | undefined;
  hints?: any;
  points: number;
  timeLimit?: number | undefined;
}

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
      <h3 className="mb-4 text-lg font-medium text-gray-800">선택지를 고르세요:</h3>
      <div className="grid gap-3">
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
                rounded-lg border-2 p-4 text-left transition-all duration-200
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
                <div
                  className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                  ${
                    isSelected
                      ? showResult
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                      : showResult && isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }
                `}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1">{option}</span>
                {showResult && isCorrect && (
                  <span className="font-medium text-green-600">✓ 정답</span>
                )}
                {showResult && isWrong && <span className="font-medium text-red-600">✗ 오답</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
