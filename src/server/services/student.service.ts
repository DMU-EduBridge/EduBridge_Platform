import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/core/prisma';

export class StudentService {
  async list(params: {
    search?: string;
    grade?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.UserWhereInput = { role: 'STUDENT' };
    if (params.search)
      where.OR = [{ name: { contains: params.search } }, { email: { contains: params.search } }];
    if (params.grade && params.grade !== 'all') where.gradeLevel = params.grade;
    if (params.status && params.status !== 'all') where.status = params.status as any;

    const skip = (params.page - 1) * params.limit;
    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      students: students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.gradeLevel,
        status: student.status,
        progress: 0,
        completedProblems: 0,
        totalProblems: 0,
        averageScore: 0,
        subjects: [],
        joinDate: new Date(student.createdAt).toLocaleDateString('ko-KR'),
        lastActivity: new Date(student.updatedAt).toLocaleDateString('ko-KR'),
      })),
      total,
    };
  }

  async detail(id: string) {
    const student = await prisma.user.findUnique({
      where: { id },
    });
    if (!student || student.role !== 'STUDENT') return null;

    return {
      ...student,
      interests: [],
      learningStyle: [],
    };
  }

  async create(input: {
    name: string;
    email: string;
    grade: string;
    learningStyle?: string[];
    interests?: string[];
  }) {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: 'STUDENT',
        gradeLevel: input.grade,
        status: 'ACTIVE',
      },
    });
  }

  async update(
    id: string,
    input: {
      name?: string;
      email?: string;
      grade?: string;
      status?: string;
      learningStyle?: string[];
      interests?: string[];
    },
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        gradeLevel: input.grade,
        status: input.status as any,
      },
    });
  }

  async remove(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, byGrade, byStatus] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.groupBy({
        by: ['gradeLevel'],
        _count: { gradeLevel: true },
        where: { role: 'STUDENT' },
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { role: 'STUDENT' },
      }),
    ]);

    return {
      total,
      byGrade: byGrade.reduce(
        (acc, item) => {
          acc[item.gradeLevel || 'Unknown'] = item._count.gradeLevel;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getProgressStats(studentId: string) {
    const attempts = await prisma.attempt.findMany({
      where: { userId: studentId },
    });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const averageTimeSpent =
      totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAttempts
        : 0;

    return {
      totalAttempts,
      correctAttempts,
      averageTimeSpent,
      completionRate: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
    };
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const studentService = wrapService(new StudentService(), 'StudentService');
