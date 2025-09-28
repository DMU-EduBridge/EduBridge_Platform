'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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

interface ProblemExplanationProps {
  problem: Problem;
  showResult: boolean;
  isCorrect: boolean;
  selectedAnswer: string;
}

export function ProblemExplanation({
  problem,
  showResult,
  isCorrect,
  selectedAnswer,
}: ProblemExplanationProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!showResult || !problem.explanation) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div
          className={`mb-2 text-xl font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
        >
          {isCorrect ? '✓ 정답입니다!' : '✗ 틀렸습니다.'}
        </div>

        <div className="mb-2 text-gray-600">정답: {problem.correctAnswer}</div>

        {!isCorrect && selectedAnswer && (
          <div className="mb-4 text-gray-600">선택한 답: {selectedAnswer}</div>
        )}
      </div>

      <div className="border-t pt-4">
        <Button
          variant="ghost"
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex h-auto items-center gap-2 p-0 text-blue-600 hover:text-blue-700"
        >
          <h4 className="text-lg font-medium">해설</h4>
          {showExplanation ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showExplanation && (
          <div className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">
            {problem.explanation}
          </div>
        )}
      </div>
    </Card>
  );
}
