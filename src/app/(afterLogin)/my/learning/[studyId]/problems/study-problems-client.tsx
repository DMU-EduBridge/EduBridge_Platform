'use client';

import { LearningErrorBoundary } from '@/components/learning/error-boundary';
import { ProblemDifficulty, ProblemType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

interface ProblemWithAttempt {
  id: string;
  title: string;
  description: string | null;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  subject: string;
  points: number;
  timeLimit: number | null;
  attempt?: {
    isCorrect: boolean;
    attemptedAt: Date;
  };
}

interface LearningMaterial {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  difficulty: string;
}

interface StudyProblemsClientProps {
  studyId: string;
  learningMaterial: LearningMaterial;
  problems: ProblemWithAttempt[];
}

const StudyProblemsClient = memo(function StudyProblemsClient({
  studyId,
  problems,
}: StudyProblemsClientProps) {
  const router = useRouter();

  // 항상 첫 번째 문제로 이동 (새로운 시도 시작)
  useEffect(() => {
    if (problems.length > 0 && problems[0]) {
      router.replace(`/my/learning/${encodeURIComponent(studyId)}/problems/${problems[0].id}`);
    }
  }, [problems, router, studyId]);

  // 로딩 중이거나 문제가 없는 경우
  if (problems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">문제를 찾을 수 없습니다</h1>
          <p className="mt-2 text-gray-600">이 학습 자료에는 문제가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 첫 번째 문제로 이동 중
  return (
    <LearningErrorBoundary>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <h2 className="text-lg font-semibold text-gray-900">문제를 불러오는 중...</h2>
          <p className="mt-2 text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    </LearningErrorBoundary>
  );
});

export default StudyProblemsClient;
