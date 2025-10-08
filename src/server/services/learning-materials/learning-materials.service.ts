import { prisma } from '@/lib/core/prisma';
import {
  CreateLearningMaterialSchema,
  LearningMaterialsQuerySchema,
  UpdateLearningMaterialSchema,
} from '@/lib/validation/schemas';
import { z } from 'zod';

export class LearningMaterialsService {
  async getLearningMaterials(_query: z.infer<typeof LearningMaterialsQuerySchema>) {
    try {
      // 테스트 API에서 성공한 쿼리와 동일하게 사용
      const materials = await prisma.learningMaterial.findMany({
        take: 20,
        select: {
          id: true,
          title: true,
          subject: true,
          difficulty: true,
          isActive: true,
          description: true,
          content: true,
          estimatedTime: true,
          files: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      const total = await prisma.learningMaterial.count();

      return {
        materials: materials.map((material) => ({
          ...material,
          problemCount: 0, // 임시로 0으로 설정
        })),
        pagination: {
          page: 1,
          limit: 20,
          total,
          totalPages: Math.ceil(total / 20),
        },
        total,
      };
    } catch (error) {
      console.error('Prisma query error:', error);
      throw error;
    }
  }

  async getLearningMaterialById(id: string) {
    const material = await prisma.learningMaterial.findUnique({
      where: { id },
      include: {
        materialProblems: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                type: true,
                difficulty: true,
                subject: true,
                points: true,
              },
            },
          },
        },
        _count: {
          select: {
            materialProblems: true,
          },
        },
      },
    });

    if (!material) {
      return null;
    }

    return {
      ...material,
      problems: material.materialProblems.map((mp) => mp.problem),
      problemCount: material._count?.materialProblems || 0,
    };
  }

  async createLearningMaterial(
    _userId: string,
    data: z.infer<typeof CreateLearningMaterialSchema>,
  ) {
    const material = await prisma.learningMaterial.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        content: data.content,
        subject: data.subject,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime ?? null,
        files: data.files ?? null,
        status: 'PUBLISHED',
        isActive: true,
      },
      include: {
        _count: {
          select: {
            materialProblems: true,
          },
        },
      },
    });

    return {
      ...material,
      problemCount: material._count?.materialProblems || 0,
    };
  }

  async updateLearningMaterial(id: string, data: z.infer<typeof UpdateLearningMaterialSchema>) {
    const material = await prisma.learningMaterial.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.estimatedTime !== undefined && { estimatedTime: data.estimatedTime ?? null }),
        ...(data.files !== undefined && { files: data.files ?? null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        _count: {
          select: {
            materialProblems: true,
          },
        },
      },
    });

    return {
      ...material,
      problemCount: material._count?.materialProblems || 0,
    };
  }

  async deleteLearningMaterial(id: string) {
    await prisma.learningMaterial.delete({
      where: { id },
    });

    return { success: true };
  }

  async getLearningMaterialStats() {
    const [total, bySubject, byDifficulty] = await Promise.all([
      prisma.learningMaterial.count(),
      prisma.learningMaterial.groupBy({
        by: ['subject'],
        _count: true,
      }),
      prisma.learningMaterial.groupBy({
        by: ['difficulty'],
        _count: true,
      }),
    ]);

    return {
      total,
      bySubject: bySubject.map((item) => ({
        subject: item.subject,
        count: item._count,
      })),
      byDifficulty: byDifficulty.map((item) => ({
        difficulty: item.difficulty,
        count: item._count,
      })),
    };
  }
}

export const learningMaterialsService = new LearningMaterialsService();
