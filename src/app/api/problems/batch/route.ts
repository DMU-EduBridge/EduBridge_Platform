import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import {
  GradeLevel,
  Prisma,
  ProblemDifficulty,
  ProblemStatus,
  ProblemType,
  Subject,
} from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BatchProblemSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().min(1, '내용은 필수입니다.'),
  type: z.nativeEnum(ProblemType),
  difficulty: z.nativeEnum(ProblemDifficulty),
  subject: z.nativeEnum(Subject),
  gradeLevel: z.nativeEnum(GradeLevel).optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, '정답은 필수입니다.'),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  points: z.number().min(0).default(10),
  timeLimit: z.number().min(0).default(60),
  isAIGenerated: z.boolean().default(false),
  aiGenerationId: z.string().optional(),
  modelName: z.string().optional(),
});

const BatchCreateProblemsSchema = z.object({
  problems: z.array(BatchProblemSchema),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Batch API received body:', JSON.stringify(body, null, 2));

    const data = BatchCreateProblemsSchema.parse(body);
    console.log('Parsed data:', JSON.stringify(data, null, 2));

    // 문제들을 일괄 생성
    const createdProblems = await prisma.problem.createMany({
      data: data.problems.map((problem) => ({
        title: problem.title,
        content: problem.content,
        type: problem.type,
        difficulty: problem.difficulty,
        subject: problem.subject,
        gradeLevel: problem.gradeLevel || null,
        options: problem.options ? problem.options : Prisma.JsonNull,
        correctAnswer: problem.correctAnswer,
        explanation: problem.explanation || null,
        hints: problem.hints ? problem.hints : Prisma.JsonNull,
        tags: problem.tags ? problem.tags : Prisma.JsonNull,
        points: problem.points,
        timeLimit: problem.timeLimit,
        status: ProblemStatus.DRAFT,
        isAIGenerated: problem.isAIGenerated,
        aiGenerationId: problem.aiGenerationId || null,
        modelName: problem.modelName || null,
      })),
    });

    logger.info('문제 일괄 생성 성공', {
      userId: session.user.id,
      count: createdProblems.count,
    });

    return NextResponse.json({
      success: true,
      data: {
        count: createdProblems.count,
        message: `${createdProblems.count}개의 문제가 성공적으로 생성되었습니다.`,
      },
    });
  } catch (error: any) {
    console.error('배치 API 에러 상세:', error);
    logger.error('문제 일괄 생성 실패', undefined, { error: error.message, stack: error.stack });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
