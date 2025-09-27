import { ProblemReviewClient, ProblemReviewViewModel } from '@/components/problems';
import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

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
        options: true,
        correctAnswer: true,
        explanation: true,
        hints: true,
        tags: true,
        points: true,
        timeLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
      description: problem.description,
      content: problem.content,
      type: problem.type,
      difficulty: problem.difficulty,
      subject: problem.subject,
      options: parseJsonArray(problem.options as string),
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation,
      hints: parseJsonArray(problem.hints as string),
      tags: parseJsonArray(problem.tags as string),
      points: problem.points,
      timeLimit: problem.timeLimit,
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        answer: attempt.answer,
        isCorrect: attempt.isCorrect,
        timeSpent: attempt.timeSpent,
        createdAt: attempt.createdAt,
      })),
    };

    return <ProblemReviewClient problem={vm} />;
  } catch (error) {
    console.error('Error in ProblemReviewPage:', error);
    redirect('/my/learning?error=server-error');
  }
}