import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

interface LearningProgress {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  currentUnit: string;
  progress: number;
  totalProblems: number;
  completedProblems: number;
  lastStudiedAt: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 실제 데이터베이스에서 가져올 데이터 (현재는 시뮬레이션)
    const learningProgress: LearningProgress[] = [
      {
        id: '1',
        subject: '한국의 역사',
        grade: '중학교 3학년',
        gradeColor: 'green',
        currentUnit: '한국 전쟁의 시작',
        progress: 50,
        totalProblems: 100,
        completedProblems: 50,
        lastStudiedAt: '2024-01-20T10:30:00Z',
      },
      {
        id: '2',
        subject: '알쏭달쏭 수학',
        grade: '중학교 3학년',
        gradeColor: 'green',
        currentUnit: '일차방정식',
        progress: 75,
        totalProblems: 80,
        completedProblems: 60,
        lastStudiedAt: '2024-01-20T14:15:00Z',
      },
      {
        id: '3',
        subject: '고등 영어',
        grade: '고등학교 1학년',
        gradeColor: 'red',
        currentUnit: 'Hello, everyone',
        progress: 30,
        totalProblems: 120,
        completedProblems: 36,
        lastStudiedAt: '2024-01-19T16:45:00Z',
      },
    ];

    logger.info('학습 진도 조회 성공', { userId: session.user.id, count: learningProgress.length });

    return NextResponse.json({
      success: true,
      data: learningProgress,
    });
  } catch (error) {
    logger.error('학습 진도 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 진도 조회에 실패했습니다.' }, { status: 500 });
  }
}
