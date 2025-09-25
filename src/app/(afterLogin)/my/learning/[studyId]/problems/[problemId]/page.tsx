import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import StudyProblemSolveClient from './study-problem-solve-client';

export async function generateMetadata({
  params,
}: {
  params: { studyId: string; problemId: string };
}): Promise<Metadata> {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.problemId },
      select: { title: true, subject: true },
    });

    if (!problem) {
      return {
        title: '문제를 찾을 수 없습니다 | EduBridge',
      };
    }

    const studyTitle = decodeURIComponent(params.studyId);

    return {
      title: `${problem.title} - ${studyTitle} | EduBridge`,
      description: `${studyTitle} 단원의 ${problem.title} 문제를 풀어보세요.`,
      robots: 'noindex, nofollow',
    };
  } catch {
    return {
      title: '문제 풀기 | EduBridge',
    };
  }
}

export default async function StudyProblemSolvePage({
  params,
}: {
  params: { studyId: string; problemId: string };
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    // 학생만 문제 풀이 가능
    if (session.user.role !== 'STUDENT') {
      redirect('/dashboard');
    }

    const studyId = decodeURIComponent(params.studyId);
    const problemId = params.problemId;

    // 문제가 해당 단원에 속하는지 확인
    const problem = await prisma.problem.findUnique({
      where: {
        id: problemId,
        unit: studyId, // 단원이 일치하는지 확인
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        type: true,
        difficulty: true,
        subject: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        hints: true,
        points: true,
        timeLimit: true,
      },
    });

    if (!problem) {
      notFound();
    }

    // 학생의 이전 시도 기록 조회
    const attempt = await prisma.attempt.findFirst({
      where: {
        problemId: problemId,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        selected: true,
        isCorrect: true,
        createdAt: true,
      },
    });

    // 단원 내 다른 문제들 조회 (진행률 계산용)
    const unitProblems = await prisma.problem.findMany({
      where: {
        unit: studyId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const unitAttempts = await prisma.attempt.findMany({
      where: {
        userId: session.user.id,
        problemId: {
          in: unitProblems.map((p) => p.id),
        },
        isCorrect: true,
      },
      select: {
        problemId: true,
      },
    });

    const completedProblems = new Set(unitAttempts.map((a) => a.problemId));
    const progressPercentage =
      unitProblems.length > 0
        ? Math.round((completedProblems.size / unitProblems.length) * 100)
        : 0;

    return (
      <StudyProblemSolveClient
        studyId={studyId}
        problem={{
          ...problem,
          options: parseJsonArray(problem.options as string),
          hints: parseJsonArray(problem.hints as string),
        }}
        {...(attempt ? { attempt } : {})}
        progress={{
          completed: completedProblems.size,
          total: unitProblems.length,
          percentage: progressPercentage,
        }}
        userId={session.user.id}
      />
    );
  } catch (error) {
    console.error('Error in StudyProblemSolvePage:', error);
    redirect(`/my/learning/${encodeURIComponent(params.studyId)}/problems?error=server-error`);
  }
}
