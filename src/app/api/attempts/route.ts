import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 시도 기록 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { problemId, selectedAnswer, isCorrect, timeSpent, startTime } = body;

    logger.info(
      '시도 기록 생성 요청',
      {
        problemId,
        selectedAnswer,
        isCorrect,
        timeSpent,
        userId: session.user.id,
      },
      'ATTEMPTS_API',
    );

    if (!problemId || !selectedAnswer) {
      logger.warn('필수 필드 누락', { problemId, selectedAnswer }, 'ATTEMPTS_API');
      return NextResponse.json(
        {
          error: '필수 필드가 누락되었습니다.',
          code: 'MISSING_REQUIRED_FIELDS',
          details: { problemId: !!problemId, selectedAnswer: !!selectedAnswer },
        },
        { status: 400 },
      );
    }

    // 문제 존재 여부 확인
    const problemExists = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { id: true },
    });

    if (!problemExists) {
      logger.error('문제를 찾을 수 없음', { problemId }, 'ATTEMPTS_API');
      return NextResponse.json(
        {
          error: '문제를 찾을 수 없습니다.',
          code: 'PROBLEM_NOT_FOUND',
          details: { problemId },
        },
        { status: 404 },
      );
    }

    // 사용자 존재 여부 확인
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      logger.error('사용자를 찾을 수 없음', { userId: session.user.id }, 'ATTEMPTS_API');
      return NextResponse.json(
        {
          error: '사용자를 찾을 수 없습니다.',
          code: 'USER_NOT_FOUND',
          details: { userId: session.user.id },
        },
        { status: 404 },
      );
    }

    // 시도 기록 생성
    logger.info(
      'Prisma 시도 기록 생성 시작',
      { problemId, userId: session.user.id },
      'ATTEMPTS_API',
    );
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        problemId,
        selected: selectedAnswer, // 스키마에 맞게 수정
        isCorrect: isCorrect || false,
        timeSpent: timeSpent || 0,
        startedAt: startTime ? new Date(startTime) : new Date(), // 시작 시간 설정
        completedAt: new Date(), // 완료 시간 설정
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            correctAnswer: true,
            points: true,
          },
        },
      },
    });

    logger.info(
      '시도 기록 생성 성공',
      { attemptId: attempt.id, problemId, userId: session.user.id },
      'ATTEMPTS_API',
    );
    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      '시도 기록 생성 실패',
      {
        message: errorMessage,
        stack: errorStack,
      },
      'ATTEMPTS_API',
    );

    return NextResponse.json(
      {
        error: '시도 기록 생성에 실패했습니다.',
        code: 'ATTEMPT_CREATION_FAILED',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

// 사용자의 시도 기록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const problemId = searchParams.get('problemId');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (studyId) {
      // 특정 학습 자료의 모든 문제에 대한 시도 기록
      whereClause.problem = {
        materialProblems: {
          some: {
            learningMaterialId: studyId,
          },
        },
      };
    } else if (problemId) {
      // 특정 문제에 대한 시도 기록
      whereClause.problemId = problemId;
    }

    const attempts = await prisma.attempt.findMany({
      where: whereClause,
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            correctAnswer: true,
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, attempts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('시도 기록 조회 실패', { message: errorMessage }, 'ATTEMPTS_API');
    return NextResponse.json(
      {
        error: '시도 기록 조회에 실패했습니다.',
        code: 'ATTEMPTS_FETCH_FAILED',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

// 특정 문제의 시도 기록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json({ error: 'problemId가 필요합니다.' }, { status: 400 });
    }

    logger.info('시도 기록 삭제 요청', { problemId, userId: session.user.id }, 'ATTEMPTS_API');

    // 모든 시도 기록을 보존하여 완전한 학습 분석 데이터 유지
    // "다시 풀기"는 시도 기록을 삭제하지 않고, 새로운 시도로 기록
    // 삭제 기능은 더 이상 제공하지 않음
    logger.info(
      '시도 기록 삭제 요청 무시 - 모든 기록 보존',
      { problemId, userId: session.user.id },
      'ATTEMPTS_API',
    );

    return NextResponse.json({
      success: true,
      message: '모든 시도 기록은 보존됩니다. 새로운 시도로 문제를 다시 풀어주세요.',
      deletedCount: 0,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      '시도 기록 삭제 실패',
      {
        message: errorMessage,
      },
      'ATTEMPTS_API',
    );

    return NextResponse.json(
      {
        error: '시도 기록 삭제에 실패했습니다.',
        code: 'ATTEMPT_DELETE_FAILED',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
