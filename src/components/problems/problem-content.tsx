'use client';

import { Card } from '@/components/ui/card';

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

interface ProblemContentProps {
  problem: Problem;
}

export function ProblemContent({ problem }: ProblemContentProps) {
  return (
    <Card className="mb-6 p-6">
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold text-gray-800">{problem.title}</h2>
        {problem.description && <p className="mb-4 text-gray-600">{problem.description}</p>}
      </div>

      <div className="mb-6">
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="whitespace-pre-wrap leading-relaxed text-gray-800">{problem.content}</div>
        </div>
      </div>

      {/* 문제 메타 정보 */}
      <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
        <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">{problem.difficulty}</span>
        <span className="rounded bg-green-100 px-2 py-1 text-green-800">{problem.points}점</span>
        <span className="rounded bg-purple-100 px-2 py-1 text-purple-800">{problem.subject}</span>
      </div>
    </Card>
  );
}
