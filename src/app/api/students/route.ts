import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/prisma';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/config/validation';
import { Prisma } from '@prisma/client';
import { withErrorHandler, ValidationError, logger } from '@/lib/utils/error-handler';

const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  grade: z.string().min(1),
  subjects: z.array(z.string()).optional(),
  learningStyle: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

// 학생 목록 조회
async function getStudents(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const grade = searchParams.get('grade');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where: Prisma.UserWhereInput = {
    role: 'STUDENT',
  };

  if (search) {
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
  }

  if (grade && grade !== 'all') {
    where.grade = grade;
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  const [rawStudents, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        preferences: true,
        progress: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const students = rawStudents.map((student) => {
    const completedProblems = student.progress.filter((p) => p.status === 'COMPLETED').length;
    const totalProblems = student.progress.length;
    const averageScore =
      student.progress.length > 0
        ? Math.round(
            student.progress.reduce((sum, p) => sum + (p.score || 0), 0) / student.progress.length,
          )
        : 0;
    const progress = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

    // preferences에서 interests를 파싱
    const interests = student.preferences?.interests
      ? JSON.parse(student.preferences.interests)
      : [];

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      status: student.status,
      progress: progress,
      completedProblems: completedProblems,
      totalProblems: totalProblems,
      averageScore: averageScore,
      subjects: interests, // interests를 subjects로 매핑
      joinDate: new Date(student.createdAt).toLocaleDateString('ko-KR'),
      lastActivity: new Date(student.updatedAt).toLocaleDateString('ko-KR'),
      preferences: student.preferences,
      rawProgress: student.progress, // 원본 데이터도 포함
    };
  });

  logger.info('Students fetched successfully', { count: students.length, page, limit });

  return NextResponse.json({
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// 새 학생 생성
async function createStudent(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createStudentSchema);

  if (!parsed.success) {
    throw new ValidationError('잘못된 요청 데이터입니다.');
  }

  const { name, email, grade, learningStyle, interests } = parsed.data;

  const student = await prisma.user.create({
    data: {
      name,
      email,
      role: 'STUDENT',
      grade,
      status: 'ACTIVE',
      preferences: {
        create: {
          learningStyle: JSON.stringify(learningStyle || []),
          interests: JSON.stringify(interests || []),
          preferredDifficulty: 'MEDIUM',
        },
      },
    },
    include: {
      preferences: true,
    },
  });

  logger.info('Student created successfully', { studentId: student.id });

  return NextResponse.json(student, { status: 201 });
}

export const GET = withErrorHandler(getStudents);
export const POST = withErrorHandler(createStudent);
