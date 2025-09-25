import { ProblemReviewClient, ProblemReviewViewModel } from '@/components/problems';
import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      select: { title: true, subject: true },
    });

    if (!problem) {
      return {
        title: '문제를 찾을 수 없습니다 | EduBridge',
      };
    }

    return {
      title: `${problem.title} - 오답체크 | EduBridge`,
      description: `${problem.subject} 과목의 ${problem.title} 문제 오답체크 페이지입니다.`,
      robots: 'noindex, nofollow', // 개인 학습 페이지
    };
  } catch {
    return {
      title: '오답체크 | EduBridge',
    };
  }
}

export default async function ProblemReviewPage({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        hints: true,
        subject: true,
        difficulty: true,
      },
    });

    if (!problem) {
      notFound();
    }

    // 학생의 이전 답안 조회
    const attempt = await prisma.attempt.findFirst({
      where: {
        problemId: params.id,
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

    const vm: ProblemReviewViewModel = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      type: problem.type,
      options: parseJsonArray(problem.options as string),
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation ?? null,
      hints: parseJsonArray(problem.hints as string),
      subject: problem.subject,
      difficulty: problem.difficulty,
      userAnswer: attempt?.selected ?? null,
      isCorrect: attempt?.isCorrect ?? false,
      attemptedAt: attempt?.createdAt ?? null,
    };

    return <ProblemReviewClient problem={vm} />;
  } catch (error) {
    console.error('Error in ProblemReviewPage:', error);
    redirect('/problems?error=server-error');
  }
}
