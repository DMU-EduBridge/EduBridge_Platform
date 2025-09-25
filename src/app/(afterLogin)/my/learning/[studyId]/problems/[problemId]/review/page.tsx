import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import StudyProblemReviewClient from './study-problem-review-client';

export async function generateMetadata({
  params,
}: {
  params: { studyId: string; problemId: string };
}): Promise<Metadata> {
  try {
    const studyTitle = decodeURIComponent(params.studyId);
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
      title: `${studyTitle} - ${problem.title} 오답체크 | EduBridge`,
      description: `${studyTitle} 단원의 ${problem.title} 문제 오답체크 페이지입니다.`,
      robots: 'noindex, nofollow', // 개인 학습 페이지
    };
  } catch {
    return {
      title: '오답체크 | EduBridge',
    };
  }
}

export default async function StudyProblemReviewPage({
  params,
}: {
  params: { studyId: string; problemId: string };
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    // 학생만 접근 가능
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
        isActive: true,
      },
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

    return (
      <StudyProblemReviewClient
        studyId={studyId}
        problem={{
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
        }}
        userAnswer={attempt?.selected ?? null}
        isCorrect={attempt?.isCorrect ?? false}
        attemptedAt={attempt?.createdAt ?? null}
      />
    );
  } catch (error) {
    console.error('Error in StudyProblemReviewPage:', error);
    redirect(`/my/learning/${params.studyId}/problems?error=server-error`);
  }
}
