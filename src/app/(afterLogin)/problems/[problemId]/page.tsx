import ProblemDetailClient from '@/app/(afterLogin)/my/learning/[studyId]/problems/[problemId]/problem-detail-client';
import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
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
      title: `${problem.title} - 문제 풀기 | EduBridge`,
      description: `${problem.subject} 과목의 ${problem.title} 문제를 풀어보세요.`,
      robots: 'noindex, nofollow',
    };
  } catch {
    return {
      title: '문제 풀기 | EduBridge',
    };
  }
}

export default async function ProblemDetailPage({ params }: { params: { problemId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/login');
    }

    // 학생만 문제 풀이 가능
    if (session.user.role !== 'STUDENT') {
      redirect('/dashboard');
    }

    const problem = await prisma.problem.findUnique({
      where: { id: params.problemId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        hints: true,
      },
    });

    if (!problem) {
      notFound();
    }

    const problemData = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      type: problem.type,
      options: parseJsonArray(problem.options as string),
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation ?? null,
      hints: parseJsonArray(problem.hints as string),
    };

    return (
      <ProblemDetailClient
        studyId=""
        problemId={problem.id}
        initialProblem={problemData}
        currentIndex={1}
        totalCount={1}
      />
    );
  } catch (error) {
    console.error('Error in ProblemDetailPage:', error);
    redirect('/my/learning?error=server-error');
  }
}
