import { prisma } from '@/lib/core/prisma';
import { NextResponse } from 'next/server';

/**
 * Demo 페이지용 학생 풀이 로그 조회 (인증 불필요)
 */
export async function GET(
  _request: Request,
  context: { params: { userId: string } },
): Promise<NextResponse> {
  try {
    const { userId } = context.params;

    // 실제 DB에서 학생의 시도 기록 가져오기
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            subject: true,
            unit: true,
            difficulty: true,
            correctAnswer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // 최근 20개만
    });

    // 로그 형식으로 변환
    const logs = attempts.map((attempt) => ({
      problem_id: attempt.problemId,
      subject: attempt.problem?.subject || '수학',
      unit: attempt.problem?.unit || '',
      difficulty: attempt.problem?.difficulty?.toLowerCase() || 'medium',
      problem_content: attempt.problem?.title || '',
      selected_answer: attempt.selected,
      correct_answer: attempt.problem?.correctAnswer || '',
      is_correct: attempt.isCorrect,
      time_spent: attempt.timeSpent,
      attempts: attempt.attemptNumber,
      timestamp: attempt.completedAt || attempt.createdAt,
    }));

    return NextResponse.json({
      userId,
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching student attempts:', error);
    return NextResponse.json(
      {
        userId: context.params.userId,
        logs: [],
        total: 0,
        error: 'Failed to fetch attempts',
      },
      { status: 500 },
    );
  }
}
