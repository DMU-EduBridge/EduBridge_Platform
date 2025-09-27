import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import StudyProblemsClient from './study-problems-client';

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

export default async function StudyProblemsPage({ params }: { params: { studyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    // 학생이 아닌 경우 접근 제한
    if (session.user.role !== 'STUDENT') {
      redirect('/dashboard');
    }

    const studyId = decodeURIComponent(params.studyId);

    // 학습 자료 정보 조회
    const learningMaterial = await prisma.learningMaterial.findFirst({
      where: {
        id: studyId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        difficulty: true,
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

    // 학생의 이전 시도 기록 조회
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: session.user.id,
        problemId: {
          in: problems.map((p) => p.id),
        },
      },
      select: {
        problemId: true,
        isCorrect: true,
        createdAt: true,
      },
    });

    // 문제별 시도 기록 매핑
    const attemptMap = new Map(
      attempts.map((attempt) => [
        attempt.problemId,
        {
          isCorrect: attempt.isCorrect,
          attemptedAt: attempt.createdAt,
        },
      ]),
    );

    const problemsWithAttempts = problems.map((problem) => {
      const attempt = attemptMap.get(problem.id);
      return attempt ? { ...problem, attempt } : { ...problem };
    });

    return (
      <StudyProblemsClient
        studyId={studyId}
        learningMaterial={learningMaterial}
        problems={problemsWithAttempts}
      />
    );
  } catch (error) {
    console.error('Error in StudyProblemsPage:', error);
    redirect('/my/learning?error=server-error');
  }
}
