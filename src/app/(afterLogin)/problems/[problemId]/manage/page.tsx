import ProblemManageClient from '@/components/problems/problem-manage-client';
import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { problemService } from '@/server/services/problem/problem-crud.service';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { problemId: string };
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

    const problem = await problemService.getProblemById(params.problemId);

    if (!problem) {
      notFound();
    }

    // 개별 문제 시도 통계 조회
    const attemptStats = await prisma.attempt.groupBy({
      by: ['isCorrect'],
      where: { problemId: params.problemId },
      _count: { isCorrect: true },
    });

    const totalAttempts = attemptStats.reduce((sum, stat) => sum + stat._count.isCorrect, 0);
    const correctAttempts = attemptStats.find((stat) => stat.isCorrect)?._count.isCorrect || 0;
    const correctRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // 전체 시스템 통계 조회
    const [totalProblems, activeProblems, systemTotalAttempts, systemCorrectAttempts] =
      await Promise.all([
        prisma.problem.count(),
        prisma.problem.count({ where: { isActive: true } }),
        prisma.attempt.count(),
        prisma.attempt.count({ where: { isCorrect: true } }),
      ]);

    const systemCorrectRate =
      systemTotalAttempts > 0 ? Math.round((systemCorrectAttempts / systemTotalAttempts) * 100) : 0;

    return (
      <ProblemManageClient
        problem={{
          ...problem,
          options: problem.options, // 서버에서 이미 파싱된 배열
          hints: problem.hints, // 서버에서 이미 파싱된 배열
          tags: problem.tags, // 서버에서 이미 파싱된 배열
        }}
        stats={{
          totalAttempts,
          correctAttempts,
          correctRate,
          // 전체 시스템 통계
          totalProblems,
          activeProblems,
          systemTotalAttempts,
          systemCorrectRate,
        }}
        userRole={session.user.role}
      />
    );
  } catch (error) {
    console.error('Error in ProblemManagePage:', error);
    redirect('/problems?error=server-error');
  }
}
