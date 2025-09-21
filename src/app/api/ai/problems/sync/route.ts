import { ProblemSyncService } from '@/lib/ai-server/sync-service';
import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const problemSyncService = new ProblemSyncService();

// 문제 동기화 요청 스키마
const SyncRequestSchema = z.object({
  subject: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']).optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

// 특정 주제 동기화 요청 스키마
const SubjectSyncSchema = z.object({
  subject: z.string().min(1),
  limit: z.number().min(1).max(1000).default(50),
});

// // 난이도별 동기화 요청 스키마
// const DifficultySyncSchema = z.object({
//   difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
//   limit: z.number().min(1).max(1000).default(50),
// });

/**
 * AI 서버에서 문제 동기화
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 선생님 또는 관리자만 동기화 가능
    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = SyncRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await problemSyncService.syncProblemsFromAI(parsed.data);

    return NextResponse.json({
      message: '문제 동기화가 완료되었습니다.',
      ...result,
    });
  } catch (error) {
    console.error('문제 동기화 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '문제 동기화 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 특정 주제의 문제 동기화
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = SubjectSyncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await problemSyncService.syncProblemsBySubject(
      parsed.data.subject,
      parsed.data.limit,
    );

    return NextResponse.json({
      message: `${parsed.data.subject} 주제 문제 동기화가 완료되었습니다.`,
      ...result,
    });
  } catch (error) {
    console.error('주제별 문제 동기화 오류:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '주제별 문제 동기화 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * AI 서버 상태 확인
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const status = await problemSyncService.getAIServerStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('AI 서버 상태 확인 오류:', error);
    return NextResponse.json(
      { error: 'AI 서버 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
