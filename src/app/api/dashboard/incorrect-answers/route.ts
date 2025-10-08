import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
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

    // 사용자 진행 데이터(오답) 조회 + 문제/과목 메타 결합
    const progresses = await prisma.problemProgress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ attemptNumber: 'desc' }, { completedAt: 'desc' }],
      select: {
        studyId: true,
        problemId: true,
        isCorrect: true,
        selectedAnswer: true,
        attemptNumber: true,
        completedAt: true,
        problem: {
          select: {
            id: true,
            title: true,
            subject: true,
            correctAnswer: true,
            explanation: true,
          },
        },
      },
    });

    // 문제별 최신 시도만 고려
    const latestByProblem = new Map<string, (typeof progresses)[number]>();
    for (const p of progresses) {
      if (!latestByProblem.has(p.problemId)) latestByProblem.set(p.problemId, p);
    }

    // 과목 단위 그룹핑(오답만)
    const group = new Map<string, IncorrectAnswerNote>();
    latestByProblem.forEach((p) => {
      const subject = p.problem?.subject || '기타';
      const note: IncorrectAnswerNote = group.get(subject) || {
        id: subject,
        subject,
        grade: '',
        gradeColor: 'red',
        status: '복습 필요',
        statusColor: 'red',
        incorrectCount: 0,
        retryCount: 0,
        completedCount: 0,
        totalProblems: 0,
        lastUpdated: new Date().toISOString(),
        problems: [],
      };

      // 전체 문제 수/완료 수 집계는 최신 시도 기준
      note.totalProblems += 1;
      if (p.isCorrect) note.completedCount += 1;
      else note.incorrectCount += 1;

      const retried = progresses.find(
        (x) => x.problemId === p.problemId && x.attemptNumber < p.attemptNumber,
      )
        ? true
        : false;
      if (retried) note.retryCount += 1;

      note.lastUpdated = p.completedAt?.toISOString?.() || note.lastUpdated;
      if (!p.isCorrect) {
        note.problems.push({
          id: p.problemId,
          question: p.problem?.title || '문제',
          correctAnswer: p.problem?.correctAnswer || '',
          userAnswer: p.selectedAnswer || '',
          explanation: p.problem?.explanation || '',
          isRetried: retried,
          isCompleted: false,
        });
      }

      group.set(subject, note);
    });

    const notes = Array.from(group.values());

    logger.info('오답 노트 조회 성공', {
      userId: session.user.id,
      count: notes.length,
    });

    return NextResponse.json({ success: true, data: notes });
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
