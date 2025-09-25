import { LearningMaterial, Prisma } from '@prisma/client';
import { prisma } from '../../lib/core/prisma';
import { logger } from '../../lib/monitoring';

export interface CreateMaterialRequest {
  title: string;
  description?: string;
  content: string;
  subject: string;
  difficulty: string;
  status: string;
  estimatedTime?: number;
  files?: string;
}

export interface UpdateMaterialRequest {
  title?: string;
  description?: string;
  content?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
  estimatedTime?: number;
  files?: string;
}

export interface MaterialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
}

export class MaterialService {
  async getMaterialById(id: string): Promise<LearningMaterial | null> {
    try {
      return await prisma.learningMaterial.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('학습 자료 조회 실패', undefined, {
        materialId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('학습 자료 조회에 실패했습니다.');
    }
  }

  async getMaterials(
    query: MaterialQueryParams,
  ): Promise<{ materials: LearningMaterial[]; total: number; pagination: any }> {
    try {
      const { page = 1, limit = 10, search, subject, difficulty, status } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.LearningMaterialWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { content: { contains: search } },
          ],
        }),
        ...(subject && { subject }),
        ...(difficulty && { difficulty }),
        ...(status && { status }),
        isActive: true,
      };

      const [materials, total] = await Promise.all([
        prisma.learningMaterial.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.learningMaterial.count({ where }),
      ]);

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      return { materials, total, pagination };
    } catch (error) {
      logger.error('학습 자료 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('학습 자료 목록 조회에 실패했습니다.');
    }
  }

  async createMaterial(data: CreateMaterialRequest): Promise<LearningMaterial> {
    try {
      const material = await prisma.learningMaterial.create({
        data: {
          title: data.title,
          description: data.description || null,
          content: data.content,
          subject: data.subject,
          difficulty: data.difficulty,
          status: data.status,
          estimatedTime: data.estimatedTime || null,
          files: data.files || null,
        },
      });
      logger.info('학습 자료 생성 성공', { materialId: material.id });
      return material;
    } catch (error) {
      logger.error('학습 자료 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('학습 자료 생성에 실패했습니다.');
    }
  }

  async updateMaterial(id: string, data: UpdateMaterialRequest): Promise<LearningMaterial> {
    try {
      const existingMaterial = await prisma.learningMaterial.findUnique({ where: { id } });
      if (!existingMaterial) {
        throw new Error('학습 자료를 찾을 수 없습니다.');
      }

      const material = await prisma.learningMaterial.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description || null }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.subject !== undefined && { subject: data.subject }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.estimatedTime !== undefined && { estimatedTime: data.estimatedTime || null }),
          ...(data.files !== undefined && { files: data.files || null }),
        },
      });
      logger.info('학습 자료 수정 성공', { materialId: id });
      return material;
    } catch (error) {
      logger.error('학습 자료 수정 실패', undefined, {
        materialId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('학습 자료 수정에 실패했습니다.');
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      const existingMaterial = await prisma.learningMaterial.findUnique({ where: { id } });
      if (!existingMaterial) {
        throw new Error('학습 자료를 찾을 수 없습니다.');
      }

      await prisma.learningMaterial.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
      logger.info('학습 자료 삭제 성공', { materialId: id });
    } catch (error) {
      logger.error('학습 자료 삭제 실패', undefined, {
        materialId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('학습 자료 삭제에 실패했습니다.');
    }
  }

  async getMaterialStats(): Promise<{
    total: number;
    bySubject: Record<string, number>;
    byDifficulty: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const [total, subjectStats, difficultyStats, statusStats] = await Promise.all([
        prisma.learningMaterial.count({ where: { isActive: true } }),
        prisma.learningMaterial.groupBy({
          by: ['subject'],
          _count: { subject: true },
          where: { isActive: true },
        }),
        prisma.learningMaterial.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
          where: { isActive: true },
        }),
        prisma.learningMaterial.groupBy({
          by: ['status'],
          _count: { status: true },
          where: { isActive: true },
        }),
      ]);

      const bySubject = subjectStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat.subject] = stat._count.subject;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byDifficulty = difficultyStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat.difficulty] = stat._count.difficulty;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byStatus = statusStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat.status] = stat._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        total,
        bySubject,
        byDifficulty,
        byStatus,
      };
    } catch (error) {
      logger.error('학습 자료 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('학습 자료 통계 조회에 실패했습니다.');
    }
  }

  async getMaterialsBySubject(subject: string): Promise<LearningMaterial[]> {
    try {
      return await prisma.learningMaterial.findMany({
        where: { subject, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('과목별 학습 자료 조회 실패', undefined, {
        subject,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과목별 학습 자료 조회에 실패했습니다.');
    }
  }

  async searchMaterials(query: string): Promise<LearningMaterial[]> {
    try {
      return await prisma.learningMaterial.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } },
            { subject: { contains: query } },
          ],
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('학습 자료 검색 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('학습 자료 검색에 실패했습니다.');
    }
  }
}

export const materialService = new MaterialService();
