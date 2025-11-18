import { cacheInvalidator } from '@/lib/cache/cache-manager';
import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { LearningMaterialVectorIntegration } from '@/lib/vector/integration';
import { GradeLevel, ProblemDifficulty, ProblemType, Subject } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

const GenerateLearningRequestSchema = z.object({
  unit: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().int().min(1).max(5),
});

const difficultyEnumMap: Record<'easy' | 'medium' | 'hard', ProblemDifficulty> = {
  easy: ProblemDifficulty.EASY,
  medium: ProblemDifficulty.MEDIUM,
  hard: ProblemDifficulty.HARD,
};

const difficultyLabelMap: Record<'easy' | 'medium' | 'hard', string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

function mapProblemType(type?: string | null): ProblemType {
  if (!type) return ProblemType.MULTIPLE_CHOICE;
  const normalized = type.toUpperCase();

  if (normalized.includes('SHORT')) return ProblemType.SHORT_ANSWER;
  if (normalized.includes('ESSAY')) return ProblemType.ESSAY;
  if (normalized.includes('TRUE_FALSE') || normalized.includes('TRUEFALSE')) {
    return ProblemType.TRUE_FALSE;
  }
  if (normalized.includes('CODING')) return ProblemType.CODING;
  if (normalized.includes('MATH')) return ProblemType.MATH;

  return ProblemType.MULTIPLE_CHOICE;
}

function mapGradeLevel(level?: string | null): GradeLevel | null {
  if (!level) return null;
  const upperLevel = level.toUpperCase();
  const gradeLevels = Object.values(GradeLevel);
  if (gradeLevels.includes(upperLevel as GradeLevel)) {
    return upperLevel as GradeLevel;
  }

  const normalized = level.replace(/\s+/g, '').toLowerCase();
  if (normalized.includes('middle') || normalized.startsWith('중')) {
    if (normalized.includes('1') || normalized.includes('one')) return GradeLevel.GRADE_7;
    if (normalized.includes('2') || normalized.includes('two')) return GradeLevel.GRADE_8;
    if (normalized.includes('3') || normalized.includes('three')) return GradeLevel.GRADE_9;
  }
  if (normalized.includes('high') || normalized.startsWith('고')) {
    if (normalized.includes('1') || normalized.includes('one')) return GradeLevel.GRADE_10;
    if (normalized.includes('2') || normalized.includes('two')) return GradeLevel.GRADE_11;
    if (normalized.includes('3') || normalized.includes('three')) return GradeLevel.GRADE_12;
  }
  if (normalized.includes('elementary') || normalized.startsWith('초')) {
    if (normalized.includes('1')) return GradeLevel.GRADE_1;
    if (normalized.includes('2')) return GradeLevel.GRADE_2;
    if (normalized.includes('3')) return GradeLevel.GRADE_3;
    if (normalized.includes('4')) return GradeLevel.GRADE_4;
    if (normalized.includes('5')) return GradeLevel.GRADE_5;
    if (normalized.includes('6')) return GradeLevel.GRADE_6;
  }

  return null;
}

type GeneratedQuestion = {
  id?: string;
  title?: string;
  description?: string | null;
  content?: string;
  type?: string;
  difficulty?: string;
  subject?: string;
  gradeLevel?: string;
  unit?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  hints?: string[];
  tags?: string[];
  points?: number;
  timeLimit?: number;
  isActive?: boolean;
  isAIGenerated?: boolean;
  aiGenerationId?: string;
  qualityScore?: number;
  reviewStatus?: string;
  status?: string;
  modelName?: string;
  tokensUsed?: number;
  costUsd?: number;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeCorrectAnswer(question: GeneratedQuestion, options: string[]): string {
  if (!question.correctAnswer) {
    return options[0] || '정답';
  }

  const numericAnswer = Number(question.correctAnswer);
  if (!Number.isNaN(numericAnswer) && numericAnswer > 0 && numericAnswer <= options.length) {
    return options[numericAnswer - 1] || question.correctAnswer;
  }

  return question.correctAnswer;
}

async function callFastApi(payload: { unit: string; difficulty: string; count: number }) {
  const response = await fetch(`${FASTAPI_BASE_URL}/generate-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: '수학',
      unit: payload.unit,
      difficulty: payload.difficulty,
      count: payload.count,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'AI 문제 생성 요청에 실패했습니다.');
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as GeneratedQuestion[];
  if (Array.isArray(data?.questions)) return data.questions as GeneratedQuestion[];
  if (Array.isArray(data?.data)) return data.data as GeneratedQuestion[];

  throw new Error('AI 문제 생성 결과가 올바르지 않습니다.');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { unit, difficulty, count } = GenerateLearningRequestSchema.parse(body);

    const generatedQuestions = await callFastApi({ unit, difficulty, count });

    if (generatedQuestions.length === 0) {
      throw new Error('생성된 문제가 없습니다.');
    }

    const difficultyEnum = difficultyEnumMap[difficulty];
    const difficultyLabel = difficultyLabelMap[difficulty];

    const { material, problems } = await prisma.$transaction(async (tx) => {
      const createdProblems = [];
      for (const [index, question] of generatedQuestions.entries()) {
        const options = Array.isArray(question.options) ? question.options : [];
        const problem = await tx.problem.create({
          data: {
            title: question.title || `${unit} 문제 ${index + 1}`,
            description: question.description || null,
            content: question.content || question.description || question.title || '문제',
            type: mapProblemType(question.type),
            difficulty: difficultyEnum,
            subject: Subject.MATH,
            gradeLevel: mapGradeLevel(question.gradeLevel),
            unit: question.unit || unit,
            options,
            correctAnswer: normalizeCorrectAnswer(question, options),
            explanation: question.explanation || null,
            hints: Array.isArray(question.hints) ? question.hints : [],
            tags: Array.isArray(question.tags) ? question.tags : [],
            points: typeof question.points === 'number' ? question.points : 10,
            timeLimit:
              typeof question.timeLimit === 'number' && question.timeLimit > 0
                ? question.timeLimit
                : 60,
            isAIGenerated: true,
            aiGenerationId: question.aiGenerationId || question.id || undefined,
            modelName: question.modelName,
          },
        });
        createdProblems.push(problem);
      }

      const learningMaterial = await tx.learningMaterial.create({
        data: {
          title: `${unit} - ${difficultyLabel} 문제 세트`,
          description: `${unit} 단원 ${difficultyLabel} 난이도 문제 ${createdProblems.length}개`,
          content: createdProblems
            .map((problem, idx) => `${idx + 1}. ${problem.title}\n${problem.content}`)
            .join('\n\n'),
          subject: Subject.MATH,
          difficulty: difficultyEnum,
          estimatedTime: createdProblems.length * 5,
          status: 'PUBLISHED',
          isActive: true,
        },
      });

      await tx.learningMaterialProblem.createMany({
        data: createdProblems.map((problem, idx) => ({
          learningMaterialId: learningMaterial.id,
          problemId: problem.id,
          order: idx,
        })),
      });

      return { material: learningMaterial, problems: createdProblems };
    });

    await Promise.all([
      cacheInvalidator.invalidateClass('learning-materials'),
      LearningMaterialVectorIntegration.onLearningMaterialCreated({
        id: material.id,
        title: material.title,
        content: material.content,
        subject: material.subject,
        difficulty: material.difficulty,
        createdAt: material.createdAt,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        material: {
          ...material,
          problemCount: problems.length,
        },
        problems,
      },
    });
  } catch (error) {
    console.error('학습자료 생성 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '학습자료 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
