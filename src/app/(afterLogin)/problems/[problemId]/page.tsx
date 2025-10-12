import ProblemDetailClient from '@/app/(afterLogin)/my/learning/[studyId]/problems/[problemId]/problem-detail-client';
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

    // 학생이 아닌 경우 문제 풀이는 불가하지만 문제 보기는 가능
    const isStudent = session.user.role === 'STUDENT';

    const problem = await problemService.getProblemById(params.problemId);

    if (!problem) {
      notFound();
    }

    // 문제와 연결된 학습 자료 조회
    const materialProblem = await prisma.learningMaterialProblem.findFirst({
      where: { problemId: params.problemId },
      select: { learningMaterialId: true },
    });

    const studyId = materialProblem?.learningMaterialId || problem.id;

    const problemData = {
      id: problem.id,
      title: problem.title,
      description: problem.description ?? undefined,
      content: problem.content,
      type: problem.type,
      options: problem.options, // 서버에서 이미 파싱된 배열
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation ?? undefined,
      difficulty: problem.difficulty,
      subject: problem.subject,
      points: problem.points,
      hints: problem.hints, // 서버에서 이미 파싱된 배열
    };

    return (
      <ProblemDetailClient
        studyId={studyId}
        problemId={problem.id}
        initialProblem={problemData}
        currentIndex={1}
        totalCount={1}
        isStudent={isStudent}
      />
    );
  } catch (error) {
    console.error('Error in ProblemDetailPage:', error);
    redirect('/my/learning?error=server-error');
  }
}
