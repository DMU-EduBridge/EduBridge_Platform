import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface IncorrectAnswerNote {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  status: string;
  statusColor: 'red' | 'yellow' | 'green';
  incorrectCount: number;
  retryCount: number;
  completedCount: number;
  totalProblems: number;
  lastUpdated: string;
  problems: {
    id: string;
    question: string;
    correctAnswer: string;
    userAnswer: string;
    explanation: string;
    isRetried: boolean;
    isCompleted: boolean;
  }[];
}

const IncorrectAnswerUpdateSchema = z.object({
  id: z.string(),
  problemId: z.string(),
  isRetried: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 실제 데이터베이스에서 가져올 데이터 (현재는 시뮬레이션)
    const incorrectAnswerNotes: IncorrectAnswerNote[] = [
      {
        id: '1',
        subject: '한국의 역사',
        grade: '중학교 3학년',
        gradeColor: 'green',
        status: '노력 필요',
        statusColor: 'red',
        incorrectCount: 10,
        retryCount: 5,
        completedCount: 5,
        totalProblems: 100,
        lastUpdated: '2024-01-20T16:30:00Z',
        problems: [
          {
            id: 'p1',
            question: '한국 전쟁이 일어난 연도는?',
            correctAnswer: '1950년',
            userAnswer: '1945년',
            explanation: '한국 전쟁은 1950년 6월 25일에 시작되었습니다.',
            isRetried: true,
            isCompleted: true,
          },
          {
            id: 'p2',
            question: '한국 전쟁의 원인은?',
            correctAnswer: '이데올로기 갈등',
            userAnswer: '경제적 갈등',
            explanation: '한국 전쟁은 자본주의와 공산주의의 이데올로기 갈등이 주된 원인입니다.',
            isRetried: false,
            isCompleted: false,
          },
        ],
      },
      {
        id: '2',
        subject: '알쏭달쏭 수학',
        grade: '중학교 3학년',
        gradeColor: 'green',
        status: '보통 수준',
        statusColor: 'yellow',
        incorrectCount: 20,
        retryCount: 5,
        completedCount: 15,
        totalProblems: 80,
        lastUpdated: '2024-01-20T15:45:00Z',
        problems: [
          {
            id: 'p3',
            question: '2x + 5 = 13일 때 x의 값은?',
            correctAnswer: '4',
            userAnswer: '3',
            explanation: '2x = 13 - 5 = 8, 따라서 x = 4입니다.',
            isRetried: true,
            isCompleted: true,
          },
        ],
      },
      {
        id: '3',
        subject: '확률과 통계',
        grade: '고등학교 1학년',
        gradeColor: 'red',
        status: '완벽함',
        statusColor: 'green',
        incorrectCount: 1,
        retryCount: 0,
        completedCount: 1,
        totalProblems: 120,
        lastUpdated: '2024-01-19T14:20:00Z',
        problems: [
          {
            id: 'p4',
            question: '주사위를 던져서 6이 나올 확률은?',
            correctAnswer: '1/6',
            userAnswer: '1/5',
            explanation: '주사위는 6면이므로 6이 나올 확률은 1/6입니다.',
            isRetried: false,
            isCompleted: true,
          },
        ],
      },
    ];

    logger.info('오답 노트 조회 성공', {
      userId: session.user.id,
      count: incorrectAnswerNotes.length,
    });

    return NextResponse.json({
      success: true,
      data: incorrectAnswerNotes,
    });
  } catch (error) {
    logger.error('오답 노트 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '오답 노트 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = IncorrectAnswerUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { id, problemId, isRetried, isCompleted } = parsed.data;

    // 실제 데이터베이스에서 업데이트할 데이터
    const updatedNote: IncorrectAnswerNote = {
      id,
      subject: '업데이트된 과목',
      grade: '업데이트된 학년',
      gradeColor: 'green',
      status: '업데이트됨',
      statusColor: 'green',
      incorrectCount: 5,
      retryCount: 3,
      completedCount: 2,
      totalProblems: 50,
      lastUpdated: new Date().toISOString(),
      problems: [
        {
          id: problemId,
          question: '업데이트된 문제',
          correctAnswer: '정답',
          userAnswer: '사용자 답',
          explanation: '해설',
          isRetried: isRetried ?? false,
          isCompleted: isCompleted ?? false,
        },
      ],
    };

    logger.info('오답 노트 업데이트 성공', {
      userId: session.user.id,
      noteId: id,
      problemId,
      isRetried,
      isCompleted,
    });

    return NextResponse.json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    logger.error('오답 노트 업데이트 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '오답 노트 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
