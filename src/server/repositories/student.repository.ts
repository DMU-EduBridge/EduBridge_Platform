import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class StudentRepository {
  async findMany(where: Prisma.UserWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { preferences: true, progress: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { preferences: true, progress: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { preferences: true, progress: true },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, include: { preferences: true } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { preferences: true, progress: true },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async getStats() {
    const [totalStudents, activeStudents, byGrade, byStatus] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      prisma.user.groupBy({
        by: ['grade'],
        where: { role: 'STUDENT' },
        _count: { grade: true },
      }),
      prisma.user.groupBy({
        by: ['status'],
        where: { role: 'STUDENT' },
        _count: { status: true },
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      byGrade: byGrade.reduce(
        (acc, item) => {
          acc[item.grade || '미분류'] = item._count.grade;
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
    const progress = await prisma.studentProgress.findMany({
      where: { studentId },
      include: { problem: true },
    });

    const totalProblems = progress.length;
    const completedProblems = progress.filter((p) => p.status === 'COMPLETED').length;
    const averageScore =
      totalProblems > 0
        ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / totalProblems)
        : 0;
    const completionRate =
      totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

    return {
      totalProblems,
      completedProblems,
      averageScore,
      completionRate,
      progress,
    };
  }
}

export const studentRepository = new StudentRepository();
