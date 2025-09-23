import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { ProblemDifficulty } from '@/types/domain/problem';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 문제 생성 요청 스키마
const GenerateQuestionSchema = z.object({
  textbookId: z.string().optional(),
  subject: z.string().min(1, '과목을 선택해주세요'),
  gradeLevel: z.string().min(1, '학년을 선택해주세요'),
  unit: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().min(1).max(20).default(5),
  contextChunks: z.array(z.string()).optional(), // 참조할 청크 ID들
});

// 문제 목록 조회 스키마
const QuestionListSchema = z.object({
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  difficulty: z.string().optional(),
  textbookId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * AI 문제 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 선생님 또는 관리자만 문제 생성 가능
    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = GenerateQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { textbookId, subject, gradeLevel, unit, difficulty, count, contextChunks } = parsed.data;

    // 교과서 존재 확인 (교과서 ID가 제공된 경우)
    let textbook = null;
    if (textbookId) {
      textbook = await prisma.textbook.findUnique({
        where: { id: textbookId },
        include: {
          chunks: contextChunks
            ? {
                where: { id: { in: contextChunks } },
              }
            : {
                take: 5, // 기본적으로 처음 5개 청크 사용
                orderBy: { chunkIndex: 'asc' },
              },
        },
      });

      if (!textbook) {
        return NextResponse.json({ error: '교과서를 찾을 수 없습니다.' }, { status: 404 });
      }

      // 권한 확인: 관리자가 아니고 자신이 업로드한 교과서가 아닌 경우
      if (session.user.role !== 'ADMIN' && textbook.uploadedBy !== session.user.id) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
      }
    }

    // AI 서버에 문제 생성 요청 (실제 구현에서는 AI 서버 호출)
    const startTime = Date.now();

    // 임시로 더미 데이터 생성 (실제로는 AI 서버 호출)
    const generatedQuestions = Array.from({ length: count }, (_, index) => ({
      id: `ai-q-${Date.now()}-${index}`,
      questionText: `${subject} ${gradeLevel} ${difficulty} 난이도 문제 ${index + 1}`,
      subject,
      gradeLevel,
      unit: unit || '기본 단원',
      difficulty: difficulty.toUpperCase(),
      correctAnswer: Math.floor(Math.random() * 5) + 1,
      explanation: `이 문제의 정답은 ${Math.floor(Math.random() * 5) + 1}번입니다.`,
      generationPrompt: `Generate ${difficulty} level question for ${subject} ${gradeLevel}`,
      contextChunkIds: textbook?.chunks.map((chunk) => chunk.id) || [],
      qualityScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      generationTimeMs: Math.floor(Math.random() * 5000) + 1000,
      modelName: 'gpt-4',
      tokensUsed: Math.floor(Math.random() * 1000) + 500,
      costUsd: Math.random() * 0.1 + 0.05,
      options: Array.from({ length: 5 }, (_, optIndex) => ({
        optionNumber: optIndex + 1,
        optionText: `선택지 ${optIndex + 1}`,
        isCorrect: optIndex + 1 === Math.floor(Math.random() * 5) + 1,
      })),
      tags: ['AI생성', difficulty, subject],
    }));

    const generationTime = Date.now() - startTime;

    // 생성된 문제들을 데이터베이스에 저장
    const savedQuestions = [];
    for (const questionData of generatedQuestions) {
      const question = await prisma.problem.create({
        data: {
          title: questionData.questionText,
          content: questionData.questionText,
          type: 'MULTIPLE_CHOICE',
          subject: questionData.subject,
          gradeLevel: questionData.gradeLevel,
          unit: questionData.unit,
          difficulty: questionData.difficulty as ProblemDifficulty,
          correctAnswer: questionData.correctAnswer.toString(),
          explanation: questionData.explanation,
          generationPrompt: questionData.generationPrompt,
          contextChunkIds: JSON.stringify(questionData.contextChunkIds),
          qualityScore: questionData.qualityScore,
          generationTimeMs: questionData.generationTimeMs,
          modelName: questionData.modelName,
          tokensUsed: questionData.tokensUsed,
          costUsd: questionData.costUsd,
          createdBy: session.user.id,
          textbookId: textbookId || null,
        },
        include: {
          questionOptions: true,
          questionTags: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          textbook: {
            select: {
              id: true,
              title: true,
              subject: true,
              gradeLevel: true,
            },
          },
        },
      });

      // 선택지 저장
      for (const optionData of questionData.options) {
        await prisma.questionOption.create({
          data: {
            problemId: question.id,
            optionNumber: optionData.optionNumber,
            optionText: optionData.optionText,
            isCorrect: optionData.isCorrect,
          },
        });
      }

      // 태그 저장
      for (const tagName of questionData.tags) {
        await prisma.questionTag.create({
          data: {
            problemId: question.id,
            tagName,
          },
        });
      }

      savedQuestions.push(question);
    }

    // API 사용량 기록
    await prisma.aIApiUsage.create({
      data: {
        userId: session.user.id,
        apiType: 'question_generation',
        modelName: 'gpt-4',
        tokensUsed: generatedQuestions.reduce((sum, q) => sum + q.tokensUsed, 0),
        costUsd: generatedQuestions.reduce((sum, q) => sum + q.costUsd, 0),
        requestCount: 1,
        responseTimeMs: generationTime,
        success: true,
      },
    });

    // 성능 지표 기록
    await prisma.aIPerformanceMetric.create({
      data: {
        operationType: 'question_generation',
        durationMs: generationTime,
        success: true,
        metadata: JSON.stringify({
          questionsGenerated: count,
          textbookId,
          subject,
          gradeLevel,
          difficulty,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${count}개의 문제가 성공적으로 생성되었습니다.`,
      questions: savedQuestions,
      metadata: {
        totalCost: generatedQuestions.reduce((sum, q) => sum + q.costUsd, 0),
        totalTokens: generatedQuestions.reduce((sum, q) => sum + q.tokensUsed, 0),
        generationTime,
        averageQualityScore: generatedQuestions.reduce((sum, q) => sum + q.qualityScore, 0) / count,
      },
    });
  } catch (error) {
    console.error('문제 생성 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 생성된 문제 목록 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      textbookId: searchParams.get('textbookId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const parsed = QuestionListSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { subject, gradeLevel, difficulty, textbookId, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    // 관리자가 아닌 경우 자신이 생성한 문제만 조회
    if (session.user.role !== 'ADMIN') {
      where.createdBy = session.user.id;
    }

    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (difficulty) where.difficulty = difficulty;
    if (textbookId) where.textbookId = textbookId;

    // 문제 목록 조회
    const [questions, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          questionOptions: true,
          questionTags: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          textbook: {
            select: {
              id: true,
              title: true,
              subject: true,
              gradeLevel: true,
            },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('문제 목록 조회 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '문제 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
