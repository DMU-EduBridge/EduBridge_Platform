import { LearningErrorBoundary } from '@/components/learning/error-boundary';
import { ProblemLoadingSkeleton } from '@/components/problems/error-boundary';
import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
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
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ProblemDetailPage({ params, searchParams }: ProblemDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  try {
    const studyId = decodeURIComponent(params.studyId);
    const problemId = params.problemId;

    const problem = await problemService.getProblemById(problemId);

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

    const allProblems = await problemService.getProblemsByStudyId(studyId, {
      page: 1,
      limit: 100,
    });
    // ids 필터(wrongOnly 세션) 적용
    const idsParam =
      typeof searchParams?.ids === 'string' ? (searchParams?.ids as string) : undefined;
    const filterIds = idsParam
      ? new Set(
          idsParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      : null;
    const problems = filterIds ? allProblems.filter((p) => filterIds.has(p.id)) : allProblems;

    const currentIndex = problems.findIndex((p) => p.id === problemId);

    const nextProblem =
      currentIndex >= 0 && currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;

    const progressEntries = await prisma.problemProgress.findMany({
      where: {
        userId: session.user.id,
        studyId,
      },
      orderBy: [{ attemptNumber: 'asc' }, { completedAt: 'asc' }],
    });

    const attemptNumbers = Array.from(
      new Set(progressEntries.map((entry) => entry.attemptNumber)),
    ).sort((a, b) => a - b);

    const latestAttemptNumber =
      attemptNumbers.length > 0 ? attemptNumbers[attemptNumbers.length - 1] : 0;

    const startNewAttemptParam =
      (typeof searchParams?.startNewAttempt === 'string' && searchParams.startNewAttempt !== '') ||
      (Array.isArray(searchParams?.startNewAttempt) && searchParams.startNewAttempt.length > 0);

    // startNewAttempt가 있으면 해당 시도 번호 사용, 없으면 최신 시도 번호 사용
    const targetAttemptNumber = startNewAttemptParam
      ? typeof searchParams?.startNewAttempt === 'string'
        ? parseInt(searchParams.startNewAttempt)
        : latestAttemptNumber
      : latestAttemptNumber;

    const latestAttemptEntries = progressEntries.filter(
      (entry) => entry.attemptNumber === targetAttemptNumber,
    );

    const totalProblems = problems.length;
    // 모든 문제가 실제로 완료되었는지 확인 (중복 제거)
    const uniqueCompletedProblems = new Set(latestAttemptEntries.map((entry) => entry.problemId))
      .size;
    const latestCompleted = totalProblems > 0 && uniqueCompletedProblems >= totalProblems;

    // 남은 문항 수 계산 (현재 사용하지 않음)
    // const remainingProblems = Math.max(0, totalProblems - uniqueCompletedProblems);

    // 오답체크나 오답노트가 아닌 경우에만 리다이렉트 (from=results 또는 from=incorrect 파라미터가 있으면 해당 플로우)
    const fromResults = searchParams?.from === 'results';
    const fromIncorrect = searchParams?.from === 'incorrect';

    if (
      !startNewAttemptParam &&
      !fromResults &&
      !fromIncorrect &&
      latestCompleted &&
      latestAttemptEntries.length > 0
    ) {
      // 쿼리 보존
      const sp = new URLSearchParams();
      const startNewAttemptVal = searchParams?.startNewAttempt;
      if (typeof startNewAttemptVal === 'string' && startNewAttemptVal === '1') {
        sp.set('startNewAttempt', '1');
      }
      if (idsParam) sp.set('ids', idsParam);
      const w =
        typeof searchParams?.wrongOnly === 'string' &&
        (searchParams?.wrongOnly as string) &&
        ((searchParams?.wrongOnly as string) === '1' ||
          (searchParams?.wrongOnly as string) === 'true');
      if (w) sp.set('wrongOnly', '1');
      const suffix = sp.toString() ? `?${sp.toString()}` : '';
      redirect(`/my/learning/${encodeURIComponent(studyId)}/results${suffix}`);
    }

    if (
      !startNewAttemptParam &&
      !fromResults &&
      !fromIncorrect &&
      latestAttemptEntries.length > 0
    ) {
      const existingEntry = latestAttemptEntries.find((entry) => entry.problemId === problemId);

      if (existingEntry) {
        // 쿼리 보존
        const sp = new URLSearchParams();
        if (idsParam) sp.set('ids', idsParam);
        const w =
          typeof searchParams?.wrongOnly === 'string' &&
          (searchParams?.wrongOnly as string) &&
          ((searchParams?.wrongOnly as string) === '1' ||
            (searchParams?.wrongOnly as string) === 'true');
        if (w) sp.set('wrongOnly', '1');
        const suffix = sp.toString() ? `?${sp.toString()}` : '';
        redirect(
          `/my/learning/${encodeURIComponent(studyId)}/problems/${problemId}/review${suffix}`,
        );
      }
    }

    const formattedProblem = {
      id: problem.id,
      title: problem.title,
      description: problem.description || null,
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
      explanation: problem.explanation || null,
      hints: problem.hints,
      points: problem.points,
      timeLimit: problem.timeLimit || null,
    };

    const formattedNextProblem = nextProblem
      ? {
          id: nextProblem.id,
          title: nextProblem.title,
          description: nextProblem.description || null,
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
            problemId={problemId}
            initialProblem={formattedProblem}
            nextProblem={formattedNextProblem}
            currentIndex={currentIndex + 1}
            totalCount={problems.length}
          />
        </Suspense>
      </LearningErrorBoundary>
    );
  } catch (error) {
    const digest = (error as { digest?: string })?.digest;
    if (digest && digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

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
