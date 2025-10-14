import { ProblemReviewClient, ProblemReviewViewModel } from '@/components/problems';
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
      title: `${problem.title} - 문제 복습 | EduBridge`,
      description: `${problem.subject} 과목의 ${problem.title} 문제를 복습하세요.`,
      robots: 'noindex, nofollow',
    };
  } catch {
    return {
      title: '문제 복습 | EduBridge',
    };
  }
}

export default async function ProblemReviewPage({ params }: { params: { problemId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    // 학생만 문제 복습 가능
    if (session.user.role !== 'STUDENT') {
      redirect('/dashboard');
    }

    const problem = await problemService.getProblemById(params.problemId);

    if (!problem) {
      notFound();
    }

    // 사용자의 이전 시도 기록 조회
    const attempts = await prisma.attempt.findMany({
      where: {
        problemId: params.problemId,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // 최근 5개 시도만
    });

    const vm: ProblemReviewViewModel = {
      id: problem.id,
      title: problem.title,
      description: problem.description ?? null,
      type: problem.type,
      difficulty: problem.difficulty,
      subject: problem.subject,
      options: problem.options ?? [],
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation ?? null,
      hints: problem.hints ?? [],
      tags: problem.tags ?? [],
      userAnswer: attempts[0]?.selected ?? null,
      isCorrect: attempts[0]?.isCorrect ?? false,
      attemptedAt: attempts[0]?.createdAt ?? null,
    };

    return <ProblemReviewClient problem={vm} />;
  } catch (error) {
    console.error('Error in ProblemReviewPage:', error);
    redirect('/my/learning?error=server-error');
  }
}
