import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import ProblemManageClient from './problem-manage-client';

export async function generateMetadata({ params }: { params: { problemId: string } }): Promise<Metadata> {
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

    return {
      title: `${problem.title} - 문제 관리 | EduBridge`,
      description: `${problem.subject} 과목의 ${problem.title} 문제를 관리하세요.`,
      robots: 'noindex, nofollow',
    };
  } catch {
    return {
      title: '문제 관리 | EduBridge',
    };
  }
}

export default async function ProblemManagePage({ params }: { params: { problemId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    // 교사/관리자만 문제 관리 가능
    if (session.user.role === 'STUDENT') {
      redirect('/my/learning');
    }

    const problem = await prisma.problem.findUnique({
      where: { id: params.problemId },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        type: true,
        difficulty: true,
        subject: true,
        gradeLevel: true,
        unit: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        hints: true,
        tags: true,
        points: true,
        timeLimit: true,
        isActive: true,
        isAIGenerated: true,
        reviewStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!problem) {
      notFound();
    }

    // 문제 시도 통계 조회
    const attemptStats = await prisma.attempt.groupBy({
      by: ['isCorrect'],
      where: { problemId: params.problemId },
      _count: { isCorrect: true },
    });

    const totalAttempts = attemptStats.reduce((sum, stat) => sum + stat._count.isCorrect, 0);
    const correctAttempts = attemptStats.find((stat) => stat.isCorrect)?._count.isCorrect || 0;
    const correctRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    return (
      <ProblemManageClient
        problem={{
          ...problem,
          options: parseJsonArray(problem.options as string),
          hints: parseJsonArray(problem.hints as string),
          tags: parseJsonArray(problem.tags as string),
        }}
        stats={{
          totalAttempts,
          correctAttempts,
          correctRate,
        }}
        userRole={session.user.role}
      />
    );
  } catch (error) {
    console.error('Error in ProblemManagePage:', error);
    redirect('/problems?error=server-error');
  }
}