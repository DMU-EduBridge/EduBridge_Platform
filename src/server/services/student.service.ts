import { serializeArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';
import { studentRepository } from '../repositories/student.repository';

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
    if (params.grade && params.grade !== 'all') where.grade = params.grade;
    if (params.status && params.status !== 'all') where.status = params.status;

    const { items, total } = await studentRepository.findMany(where, params.page, params.limit);
    const students = items.map((student) => {
      const completedProblems = student.progress.filter((p) => p.status === 'COMPLETED').length;
      const totalProblems = student.progress.length;
      const averageScore =
        student.progress.length > 0
          ? Math.round(
              student.progress.reduce((sum, p) => sum + (p.score || 0), 0) /
                student.progress.length,
            )
          : 0;
      const progress =
        totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
      const interests = student.preferences?.interests
        ? JSON.parse(student.preferences.interests)
        : [];

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        status: student.status,
        progress,
        completedProblems,
        totalProblems,
        averageScore,
        subjects: interests,
        joinDate: new Date(student.createdAt).toLocaleDateString('ko-KR'),
        lastActivity: new Date(student.updatedAt).toLocaleDateString('ko-KR'),
        preferences: student.preferences,
        rawProgress: student.progress,
      };
    });
    return { students, total };
  }

  async create(input: {
    name: string;
    email: string;
    grade: string;
    learningStyle?: string[];
    interests?: string[];
  }) {
    const data: Prisma.UserCreateInput = {
      name: input.name,
      email: input.email,
      role: 'STUDENT',
      grade: input.grade,
      status: 'ACTIVE',
      preferences: {
        create: {
          learningStyle: serializeArray(input.learningStyle) ?? '[]',
          interests: serializeArray(input.interests) ?? '[]',
          preferredDifficulty: 'MEDIUM',
        },
      },
    };
    return studentRepository.create(data);
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const studentService = wrapService(new StudentService(), 'StudentService');
