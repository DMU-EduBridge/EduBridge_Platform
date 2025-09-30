import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { studyId: string };
}): Promise<Metadata> {
  try {
    // studyId로 단원 정보 조회 (현재는 mock 데이터 사용)
    const studyTitle = decodeURIComponent(params.studyId);

    return {
      title: `${studyTitle} - 문제 풀기 | EduBridge`,
      description: `${studyTitle} 단원의 문제를 풀어보세요.`,
      robots: 'noindex, nofollow',
    };
  } catch {
    return {
      title: '문제 풀기 | EduBridge',
    };
  }
}

export default async function StudyProblemsPage({
  params,
  searchParams,
}: {
  params: { studyId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // 학생이 아닌 경우 접근 제한
  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  const studyId = decodeURIComponent(params.studyId);

  // 학습 자료 정보 조회 (존재 여부 확인 용도)
  const learningMaterial = await prisma.learningMaterial.findFirst({
    where: {
      id: studyId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!learningMaterial) {
    redirect('/my/learning?error=material-not-found');
  }

  // 해당 학습 자료의 문제들 조회
  const problems = await prisma.problem.findMany({
    where: {
      materialProblems: {
        some: {
          learningMaterialId: studyId,
        },
      },
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      difficulty: true,
      subject: true,
      points: true,
      timeLimit: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (problems.length === 0) {
    redirect('/my/learning?error=no-problems');
  }

  const encodedStudyId = encodeURIComponent(studyId);

  // 현재 진행 상황 확인
  const progressEntries = await prisma.problemProgress.findMany({
    where: {
      userId: session.user.id,
      studyId,
    },
    orderBy: {
      lastAccessed: 'desc',
    },
  });

  // 최신 시도에서 각 문제의 완료 상태 확인
  const latestAttempts = new Map<string, any>();
  progressEntries.forEach((entry) => {
    if (
      !latestAttempts.has(entry.problemId) ||
      entry.attemptNumber > latestAttempts.get(entry.problemId).attemptNumber ||
      (entry.attemptNumber === latestAttempts.get(entry.problemId).attemptNumber &&
        entry.completedAt &&
        entry.completedAt > latestAttempts.get(entry.problemId).completedAt)
    ) {
      latestAttempts.set(entry.problemId, entry);
    }
  });

  // 모든 문제가 완료되었는지 확인 (시도한 모든 문제를 완료로 계산)
  const completedProblems = Array.from(latestAttempts.values()).length;

  const allProblemsCompleted = completedProblems === problems.length;

  console.log('문제풀기 페이지 진입:', {
    studyId,
    totalProblems: problems.length,
    completedProblems,
    allProblemsCompleted,
    latestAttempts: Array.from(latestAttempts.values()).map((entry) => ({
      problemId: entry.problemId,
      attemptNumber: entry.attemptNumber,
      isCorrect: entry.isCorrect,
    })),
  });

  const firstProblem = problems[0];

  if (!firstProblem) {
    redirect('/my/learning?error=no-problems');
  }

  const retryRequested =
    (typeof searchParams?.retry === 'string' && searchParams.retry === '1') ||
    (Array.isArray(searchParams?.retry) && searchParams.retry.includes('1'));

  if (retryRequested) {
    redirect(`/my/learning/${encodedStudyId}/problems/${firstProblem.id}?startNewAttempt=1`);
  }

  const attemptNumbers = Array.from(
    new Set(progressEntries.map((entry) => entry.attemptNumber)),
  ).sort((a, b) => a - b);

  const latestAttemptNumber =
    attemptNumbers.length > 0 ? attemptNumbers[attemptNumbers.length - 1] : 0;

  const latestAttemptEntries = progressEntries.filter(
    (entry) => entry.attemptNumber === latestAttemptNumber,
  );

  if (latestAttemptEntries.length === 0) {
    redirect(`/my/learning/${encodedStudyId}/problems/${firstProblem.id}`);
  }

  const completedSet = new Set(latestAttemptEntries.map((entry) => entry.problemId));
  const totalProblems = problems.length;

  if (totalProblems > 0 && completedSet.size < totalProblems) {
    const nextProblem = problems.find((problem) => !completedSet.has(problem.id)) ?? firstProblem;
    redirect(`/my/learning/${encodedStudyId}/problems/${nextProblem.id}`);
  }

  redirect(`/my/learning/${encodedStudyId}/results`);
}
