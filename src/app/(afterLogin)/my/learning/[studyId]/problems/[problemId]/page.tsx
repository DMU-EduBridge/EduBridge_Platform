import { LearningErrorBoundary } from '@/components/learning/error-boundary';
import { ProblemLoadingSkeleton } from '@/components/problems/error-boundary';
import { authOptions } from '@/lib/core/auth';
import { problemService } from '@/server/services/problem/problem-crud.service';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ProblemDetailClient from './problem-detail-client';

interface ProblemDetailPageProps {
  params: {
    studyId: string;
    problemId: string;
  };
}

export default async function ProblemDetailPage({ params }: ProblemDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // 학생만 접근 가능
  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  try {
    // studyId 디코딩
    const studyId = decodeURIComponent(params.studyId);

    // 문제 정보 가져오기
    const problem = await problemService.getProblemById(params.problemId);

    if (!problem) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">문제를 찾을 수 없습니다</h1>
            <p className="mt-2 text-gray-600">요청하신 문제가 존재하지 않습니다.</p>
          </div>
        </div>
      );
    }

    // 해당 학습 자료의 모든 문제 목록 가져오기 (순서대로)
    const allProblems = await problemService.getProblemsByStudyId(studyId, {
      page: 1,
      limit: 100, // 충분히 큰 수
    });

    // 현재 문제의 인덱스 찾기
    const currentIndex = allProblems.findIndex((p) => p.id === params.problemId);

    // 디버깅 로그
    console.log('=== 문제 인덱스 디버깅 ===');
    console.log('allProblems.length:', allProblems.length);
    console.log('currentIndex:', currentIndex);
    console.log('params.problemId:', params.problemId);
    console.log(
      'allProblems IDs:',
      allProblems.map((p) => p.id),
    );
    console.log('조건: currentIndex < allProblems.length - 1');
    console.log('조건 결과:', currentIndex < allProblems.length - 1);

    const nextProblem =
      currentIndex >= 0 && currentIndex < allProblems.length - 1
        ? allProblems[currentIndex + 1]
        : null;

    console.log('nextProblem:', nextProblem ? nextProblem.id : 'null');
    console.log('=== 디버깅 끝 ===');

    // 학생의 이전 시도 기록 가져오기 (선택사항)
    // const previousAttempts = await attemptService.getAttemptsByProblemAndUser(
    //   params.problemId,
    //   session.user.id
    // );

    // Convert to ProblemDetailClient compatible type
    const formattedProblem = {
      id: problem.id,
      title: problem.title,
      description: problem.description || undefined,
      content: problem.content,
      type: problem.type as
        | 'MULTIPLE_CHOICE'
        | 'SHORT_ANSWER'
        | 'ESSAY'
        | 'TRUE_FALSE'
        | 'CODING'
        | 'MATH',
      difficulty: problem.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
      subject: problem.subject,
      options: Array.isArray(problem.options)
        ? problem.options
        : problem.options
          ? JSON.parse(problem.options as string)
          : [],
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation || undefined,
      hints: problem.hints,
      points: problem.points,
      timeLimit: problem.timeLimit || undefined,
    };

    const formattedNextProblem = nextProblem
      ? {
          id: nextProblem.id,
          title: nextProblem.title,
          description: nextProblem.description || undefined,
          content: nextProblem.content,
          type: nextProblem.type as
            | 'MULTIPLE_CHOICE'
            | 'SHORT_ANSWER'
            | 'ESSAY'
            | 'TRUE_FALSE'
            | 'CODING'
            | 'MATH',
          difficulty: nextProblem.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
          subject: nextProblem.subject,
          options: Array.isArray(nextProblem.options)
            ? nextProblem.options
            : nextProblem.options
              ? JSON.parse(nextProblem.options as string)
              : [],
          correctAnswer: nextProblem.correctAnswer,
          explanation: nextProblem.explanation || undefined,
          hints: nextProblem.hints,
          points: nextProblem.points,
          timeLimit: nextProblem.timeLimit || undefined,
        }
      : undefined;

    return (
      <LearningErrorBoundary>
        <Suspense fallback={<ProblemLoadingSkeleton />}>
          <ProblemDetailClient
            studyId={studyId}
            problemId={params.problemId}
            initialProblem={formattedProblem}
            nextProblem={formattedNextProblem}
            currentIndex={currentIndex + 1}
            totalCount={allProblems.length}
          />
        </Suspense>
      </LearningErrorBoundary>
    );
  } catch (error) {
    console.error('문제 로드 실패:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">문제를 불러올 수 없습니다</h1>
          <p className="mt-2 text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }
}
