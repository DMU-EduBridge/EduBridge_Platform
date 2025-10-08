import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { IncorrectAnswersDetailClient } from './incorrect-answers-detail-client';

export const metadata: Metadata = {
  title: '오답 노트 - EduBridge',
  description: '틀린 문제들을 다시 풀어보고 복습하세요',
  robots: 'noindex, nofollow',
};

// 항상 최신 DB 상태를 반영하도록 캐시 비활성화
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// 서버에서 오답 노트 데이터를 DB에서 가져오는 함수
async function getIncorrectAnswersData(userId: string) {
  try {
    // 사용자의 오답(progress) 수집 (최신 시도 우선)
    const progresses = await prisma.problemProgress.findMany({
      where: { userId, isCorrect: false },
      orderBy: [{ completedAt: 'desc' }],
      select: {
        problemId: true,
        selectedAnswer: true,
        isCorrect: true,
        completedAt: true,
        attemptNumber: true,
        timeSpent: true,
        problem: {
          select: {
            id: true,
            title: true,
            content: true,
            subject: true,
            difficulty: true,
            explanation: true,
            correctAnswer: true,
            materialProblems: {
              select: { learningMaterialId: true },
              take: 1,
            },
          },
        },
      },
    });

    // 문제별 최신 오답만 유지
    const latestByProblem = new Map<string, (typeof progresses)[number]>();
    for (const p of progresses) {
      if (!latestByProblem.has(p.problemId)) latestByProblem.set(p.problemId, p);
    }

    // 과목(또는 학습자료) 단위로 그룹핑
    const groups = new Map<string, any>();
    latestByProblem.forEach((p) => {
      const subject = p.problem.subject || '기타';
      const key = subject;
      const entry = groups.get(key) || {
        id: key,
        subject,
        grade: '',
        gradeColor: 'red' as const,
        status: '복습 필요',
        statusColor: 'red' as const,
        incorrectCount: 0,
        retryCount: 0,
        completedCount: 0,
        totalProblems: 0,
        lastUpdated: p.completedAt?.toISOString?.() || new Date().toISOString(),
        problems: [] as any[],
      };

      entry.incorrectCount += 1;
      entry.lastUpdated =
        entry.lastUpdated && p.completedAt && p.completedAt > new Date(entry.lastUpdated)
          ? p.completedAt.toISOString()
          : entry.lastUpdated;

      entry.problems.push({
        id: p.problemId,
        question: p.problem.title || p.problem.content?.slice(0, 80) || '문제',
        myAnswer: p.selectedAnswer || '',
        correctAnswer: p.problem.correctAnswer,
        explanation: p.problem.explanation || '',
        difficulty: (p.problem.difficulty || 'MEDIUM').toLowerCase(),
        topic: subject,
        attempts: p.attemptNumber || 1,
        lastAttempt: p.completedAt?.toISOString?.() || new Date().toISOString(),
      });

      groups.set(key, entry);
    });

    const incorrectAnswers = Array.from(groups.values());
    const subjects = incorrectAnswers.map((g: any) => g.subject);

    const stats = {
      totalIncorrect: incorrectAnswers.reduce((s: number, g: any) => s + g.incorrectCount, 0),
      totalRetry: 0,
      totalCompleted: 0,
      averageAttempts:
        incorrectAnswers.length > 0
          ? Number(
              (
                incorrectAnswers.reduce(
                  (s: number, g: any) =>
                    s + g.problems.reduce((ps: number, pr: any) => ps + (pr.attempts || 1), 0),
                  0,
                ) / incorrectAnswers.reduce((s: number, g: any) => s + g.problems.length, 0)
              ).toFixed(1),
            )
          : 0,
      mostDifficultSubject:
        incorrectAnswers.sort((a: any, b: any) => b.incorrectCount - a.incorrectCount)[0]
          ?.subject || '',
    };

    return { incorrectAnswers, subjects, stats };
  } catch (error) {
    console.error('오답 노트 데이터 로드 실패:', error);
    return null;
  }
}

export default async function IncorrectAnswersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const incorrectAnswersData = await getIncorrectAnswersData(session.user.id);

  return <IncorrectAnswersDetailClient session={session} initialData={incorrectAnswersData} />;
}
