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

  // 페이지 로드 시 자동으로 적절한 문제로 이동
  useEffect(() => {
    const findNextProblem = async () => {
      if (problems.length > 0 && problems[0]) {
        try {
          // 서버에서 완료 상태 확인
          const response = await fetch(
            `/api/learning/complete?studyId=${encodeURIComponent(studyId)}`,
          );
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              // 모든 문제가 완료된 경우 결과 페이지로 이동
              if (result.data.isCompleted) {
                router.replace(`/my/learning/${encodeURIComponent(studyId)}/results`);
                return;
              }

              // 완료된 문제 ID 목록
              const completedProblemIds = result.data.attempts.map(
                (attempt: any) => attempt.problemId,
              );

              // 완료되지 않은 첫 번째 문제 찾기
              const incompleteProblem = problems.find((p) => !completedProblemIds.includes(p.id));
              if (incompleteProblem) {
                router.replace(
                  `/my/learning/${encodeURIComponent(studyId)}/problems/${incompleteProblem.id}`,
                );
                return;
              }
            }
          }
        } catch (error) {
          console.error('학습 완료 상태 확인 실패:', error);
        }

        // 기본적으로 첫 번째 문제로 이동
        router.replace(`/my/learning/${encodeURIComponent(studyId)}/problems/${problems[0].id}`);
      }
    };

    findNextProblem();
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
