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

  // 틀린 문제만 필터링(ids) 지원
  const idsParam = typeof searchParams?.ids === 'string' ? searchParams?.ids : undefined;
  const wrongOnly =
    searchParams?.wrongOnly === '1' || searchParams?.wrongOnly === 'true' ? true : false;
  let problems;
  if (idsParam) {
    // ids가 전달되면 studyId 매핑 없이 ids로 직접 조회 (오답세션용)
    const idList = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    problems = await prisma.problem.findMany({
      where: { id: { in: idList }, isActive: true },
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
      orderBy: { createdAt: 'asc' },
    });
  } else {
    // 일반 학습 세션: studyId 기반 조회
    problems = await prisma.problem.findMany({
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
  }

  if (problems.length === 0) {
    redirect('/my/learning?error=no-problems');
  }

  const encodedStudyId = encodeURIComponent(studyId);
  const suffixQuery = (() => {
    const parts: string[] = [];
    if (wrongOnly) parts.push('wrongOnly=1');
    if (idsParam) parts.push(`ids=${encodeURIComponent(idsParam)}`);
    return parts.length ? `?${parts.join('&')}` : '';
  })();

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

  const firstProblem = problems[0];

  if (!firstProblem) {
    redirect('/my/learning?error=no-problems');
  }

  const retryRequested =
    (typeof searchParams?.retry === 'string' && searchParams.retry === '1') ||
    (Array.isArray(searchParams?.retry) && searchParams.retry.includes('1'));

  if (retryRequested) {
    redirect(
      `/my/learning/${encodedStudyId}/problems/${firstProblem.id}?startNewAttempt=1${
        suffixQuery ? `&${suffixQuery.slice(1)}` : ''
      }`,
    );
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
    redirect(`/my/learning/${encodedStudyId}/problems/${firstProblem.id}${suffixQuery}`);
  }

  const completedSet = new Set(latestAttemptEntries.map((entry) => entry.problemId));
  const totalProblems = problems.length;

  if (totalProblems > 0 && completedSet.size < totalProblems) {
    const nextProblem = problems.find((problem) => !completedSet.has(problem.id)) ?? firstProblem;
    redirect(`/my/learning/${encodedStudyId}/problems/${nextProblem.id}${suffixQuery}`);
  }

  redirect(`/my/learning/${encodedStudyId}/results${suffixQuery}`);
}
