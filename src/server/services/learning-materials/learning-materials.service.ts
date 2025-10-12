import { CacheKeyGenerator, cacheInvalidator, withCache } from '@/lib/cache/cache-manager';
import { prisma } from '@/lib/core/prisma';
import {
  CreateLearningMaterialSchema,
  LearningMaterialsQuerySchema,
  UpdateLearningMaterialSchema,
} from '@/lib/validation/schemas';
import { z } from 'zod';

export class LearningMaterialsService {
  async getLearningMaterials(query: z.infer<typeof LearningMaterialsQuerySchema>) {
    try {
      // 캐시 우선 조회
      const cacheKey = CacheKeyGenerator.classes({
        resource: 'learning-materials',
        page: query.page,
        limit: query.limit,
      });
      const fetcher = async () => {
        const where: any = {};

        // 검색 조건 추가
        if (query.search) {
          where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ];
        }

        if (query.subject) {
          where.subject = query.subject;
        }

        if (query.difficulty) {
          where.difficulty = query.difficulty;
        }

        if (query.isActive !== undefined) {
          where.isActive = query.isActive;
        }

        const materials = await prisma.learningMaterial.findMany({
          where,
          take: query.limit,
          skip: (query.page - 1) * query.limit,
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

        const total = await prisma.learningMaterial.count({ where });

        // 각 학습자료의 문제 수 계산
        const materialsWithProblemCount = await Promise.all(
          materials.map(async (material) => {
            const problemCount = await prisma.learningMaterialProblem.count({
              where: { learningMaterialId: material.id },
            });
            return {
              ...material,
              problemCount,
            };
          }),
        );

        return {
          materials: materialsWithProblemCount,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
          total,
        };
      };

      const cachedFetch = withCache(cacheKey, 60); // 1분 캐시로 시작
      const result = await cachedFetch(fetcher);
      return result;
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
      problemCount: material._count.materialProblems,
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
        subject: data.subject as any,
        difficulty: data.difficulty as any,
        estimatedTime: data.estimatedTime ?? null,
        files: (data.files as any) ?? undefined,
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

    // 캐시 무효화: 학습자료 목록 관련 키 삭제
    await cacheInvalidator.invalidateClass('learning-materials');

    return {
      ...material,
      problemCount: material._count.materialProblems,
    };
  }

  async updateLearningMaterial(id: string, data: z.infer<typeof UpdateLearningMaterialSchema>) {
    const material = await prisma.learningMaterial.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.subject !== undefined && { subject: data.subject as any }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty as any }),
        ...(data.estimatedTime !== undefined && { estimatedTime: data.estimatedTime ?? null }),
        ...(data.files !== undefined && { files: (data.files as any) ?? undefined }),
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

    // 캐시 무효화: 단일 및 목록 캐시
    await Promise.all([
      cacheInvalidator.invalidateClass('learning-materials'),
      cacheInvalidator.invalidateClass(id),
    ]);

    return {
      ...material,
      problemCount: material._count.materialProblems,
    };
  }

  async deleteLearningMaterial(id: string) {
    await prisma.learningMaterial.delete({
      where: { id },
    });

    // 캐시 무효화
    await Promise.all([
      cacheInvalidator.invalidateClass('learning-materials'),
      cacheInvalidator.invalidateClass(id),
    ]);

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
