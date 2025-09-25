import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { Problem } from '@/types/domain/problem';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 학생은 문제 생성할 수 없음
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const problems: Omit<Problem, 'id' | 'createdAt' | 'updatedAt' | 'attempts' | 'successRate'>[] =
      await request.json();

    // 요청 검증
    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json(
        { error: 'Problems array is required and must not be empty' },
        { status: 400 },
      );
    }

    // 각 문제 검증
    for (const problem of problems) {
      if (!problem.title || !problem.content || !problem.subject) {
        return NextResponse.json(
          { error: 'Each problem must have title, content, and subject' },
          { status: 400 },
        );
      }
    }

    // 데이터베이스에 문제들 일괄 생성
    const createdProblems = await prisma.problem.createMany({
      data: problems.map((problem) => ({
        title: problem.title,
        description: problem.description,
        content: problem.content,
        type: problem.type,
        difficulty: problem.difficulty,
        subject: problem.subject,
        options: problem.options ? JSON.stringify(problem.options) : null,
        correctAnswer: problem.correctAnswer,
        explanation: problem.explanation,
        hints: problem.hints ? JSON.stringify(problem.hints) : null,
        tags: problem.tags ? JSON.stringify(problem.tags) : null,
        points: problem.points,
        timeLimit: problem.timeLimit,
        isActive: problem.isActive,
        isAIGenerated: problem.isAIGenerated,
        aiGenerationId: problem.aiGenerationId,
        qualityScore: problem.qualityScore,
        reviewStatus: problem.reviewStatus,
        reviewedBy: problem.reviewedBy,
        reviewedAt: problem.reviewedAt,
        status: problem.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    // 생성된 문제들 조회
    const savedProblems = await prisma.problem.findMany({
      where: {
        title: {
          in: problems.map((p) => p.title),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: problems.length,
    });

    return NextResponse.json(savedProblems);
  } catch (error) {
    console.error('Error creating problems:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
