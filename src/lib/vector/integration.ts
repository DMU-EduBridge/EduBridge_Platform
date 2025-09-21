import { logger } from '@/lib/monitoring';
import { vectorService } from '@/lib/vector/embedding-service';

/**
 * 문제 서비스에 벡터 연동 기능 추가
 */
export class ProblemVectorIntegration {
  /**
   * 문제 생성 시 벡터 자동 저장
   */
  static async onProblemCreated(problem: {
    id: string;
    title: string;
    content: string;
    subject: string;
    difficulty: string;
    tags?: string[];
    createdAt: Date;
  }): Promise<void> {
    try {
      await vectorService.storeProblemVector(problem);
      logger.info('문제 벡터 자동 저장 완료', { problemId: problem.id });
    } catch (error) {
      logger.error('문제 벡터 자동 저장 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        problemId: problem.id,
      });
      // 벡터 저장 실패가 전체 프로세스를 중단시키지 않도록 에러를 던지지 않음
    }
  }

  /**
   * 문제 업데이트 시 벡터 자동 업데이트
   */
  static async onProblemUpdated(
    problemId: string,
    updates: {
      title?: string;
      content?: string;
      subject?: string;
      difficulty?: string;
      tags?: string[];
    },
  ): Promise<void> {
    try {
      // 기존 문제 정보 가져오기
      const { prisma } = await import('@/lib/core/prisma');
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: {
          title: true,
          content: true,
          subject: true,
          difficulty: true,
          tags: true,
          createdAt: true,
        },
      });

      if (!problem) {
        logger.warn('업데이트할 문제를 찾을 수 없습니다', { problemId });
        return;
      }

      // 업데이트된 정보로 벡터 업데이트
      const updatedProblem = {
        id: problemId,
        title: updates.title || problem.title,
        content: updates.content || problem.content,
        subject: updates.subject || problem.subject,
        difficulty: updates.difficulty || problem.difficulty,
        tags:
          updates.tags || (problem.tags ? problem.tags.split(',').map((tag) => tag.trim()) : []),
        createdAt: problem.createdAt,
      };

      await vectorService.updateVector(
        problemId,
        'problem',
        `${updatedProblem.title}\n${updatedProblem.content}`,
        {
          type: 'problem',
          subject: updatedProblem.subject,
          difficulty: updatedProblem.difficulty,
          tags: updatedProblem.tags,
          createdAt: updatedProblem.createdAt.toISOString(),
          title: updatedProblem.title,
        },
      );

      logger.info('문제 벡터 자동 업데이트 완료', { problemId });
    } catch (error) {
      logger.error('문제 벡터 자동 업데이트 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        problemId,
      });
    }
  }

  /**
   * 문제 삭제 시 벡터 자동 삭제
   */
  static async onProblemDeleted(problemId: string): Promise<void> {
    try {
      await vectorService.deleteVector(problemId, 'problem');
      logger.info('문제 벡터 자동 삭제 완료', { problemId });
    } catch (error) {
      logger.error('문제 벡터 자동 삭제 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        problemId,
      });
    }
  }
}

/**
 * 학습자료 서비스에 벡터 연동 기능 추가
 */
export class LearningMaterialVectorIntegration {
  /**
   * 학습자료 생성 시 벡터 자동 저장
   */
  static async onLearningMaterialCreated(material: {
    id: string;
    title: string;
    content: string;
    subject: string;
    difficulty: string;
    tags?: string[];
    createdAt: Date;
  }): Promise<void> {
    try {
      await vectorService.storeLearningMaterialVector(material);
      logger.info('학습자료 벡터 자동 저장 완료', { materialId: material.id });
    } catch (error) {
      logger.error('학습자료 벡터 자동 저장 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        materialId: material.id,
      });
    }
  }

  /**
   * 학습자료 업데이트 시 벡터 자동 업데이트
   */
  static async onLearningMaterialUpdated(
    materialId: string,
    updates: {
      title?: string;
      content?: string;
      subject?: string;
      difficulty?: string;
      tags?: string[];
    },
  ): Promise<void> {
    try {
      // 기존 학습자료 정보 가져오기
      const { prisma } = await import('@/lib/core/prisma');
      const material = await prisma.learningMaterial.findUnique({
        where: { id: materialId },
        select: {
          title: true,
          content: true,
          subject: true,
          difficulty: true,
          createdAt: true,
        },
      });

      if (!material) {
        logger.warn('업데이트할 학습자료를 찾을 수 없습니다', { materialId });
        return;
      }

      // 업데이트된 정보로 벡터 업데이트
      const updatedMaterial = {
        id: materialId,
        title: updates.title || material.title,
        content: updates.content || material.content,
        subject: updates.subject || material.subject,
        difficulty: updates.difficulty || material.difficulty,
        tags: updates.tags || [],
        createdAt: material.createdAt,
      };

      await vectorService.updateVector(
        materialId,
        'learning_material',
        `${updatedMaterial.title}\n${updatedMaterial.content}`,
        {
          type: 'learning_material',
          subject: updatedMaterial.subject,
          difficulty: updatedMaterial.difficulty,
          tags: updatedMaterial.tags,
          createdAt: updatedMaterial.createdAt.toISOString(),
          title: updatedMaterial.title,
        },
      );

      logger.info('학습자료 벡터 자동 업데이트 완료', { materialId });
    } catch (error) {
      logger.error('학습자료 벡터 자동 업데이트 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        materialId,
      });
    }
  }

  /**
   * 학습자료 삭제 시 벡터 자동 삭제
   */
  static async onLearningMaterialDeleted(materialId: string): Promise<void> {
    try {
      await vectorService.deleteVector(materialId, 'learning_material');
      logger.info('학습자료 벡터 자동 삭제 완료', { materialId });
    } catch (error) {
      logger.error('학습자료 벡터 자동 삭제 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        materialId,
      });
    }
  }
}

/**
 * 벡터 연동 유틸리티 함수들
 */
export class VectorIntegrationUtils {
  /**
   * 모든 문제를 벡터로 변환
   */
  static async syncAllProblems(): Promise<{ success: number; failed: number }> {
    try {
      const { prisma } = await import('@/lib/core/prisma');

      const problems = await prisma.problem.findMany({
        where: {
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          content: true,
          subject: true,
          difficulty: true,
          tags: true,
          createdAt: true,
        },
      });

      let success = 0;
      let failed = 0;

      for (const problem of problems) {
        try {
          await vectorService.storeProblemVector({
            id: problem.id,
            title: problem.title,
            content: problem.content,
            subject: problem.subject,
            difficulty: problem.difficulty,
            tags: problem.tags ? problem.tags.split(',').map((tag) => tag.trim()) : [],
            createdAt: problem.createdAt,
          });
          success++;
        } catch (error) {
          logger.error('문제 벡터 변환 실패', undefined, {
            error: error instanceof Error ? error.message : String(error),
            problemId: problem.id,
          });
          failed++;
        }
      }

      logger.info('모든 문제 벡터 동기화 완료', { success, failed });
      return { success, failed };
    } catch (error) {
      logger.error('문제 벡터 동기화 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 모든 학습자료를 벡터로 변환
   */
  static async syncAllLearningMaterials(): Promise<{ success: number; failed: number }> {
    try {
      const { prisma } = await import('@/lib/core/prisma');

      const materials = await prisma.learningMaterial.findMany({
        where: {
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          content: true,
          subject: true,
          difficulty: true,
          createdAt: true,
        },
      });

      let success = 0;
      let failed = 0;

      for (const material of materials) {
        try {
          await vectorService.storeLearningMaterialVector({
            id: material.id,
            title: material.title,
            content: material.content,
            subject: material.subject,
            difficulty: material.difficulty,
            createdAt: material.createdAt,
          });
          success++;
        } catch (error) {
          logger.error('학습자료 벡터 변환 실패', undefined, {
            error: error instanceof Error ? error.message : String(error),
            materialId: material.id,
          });
          failed++;
        }
      }

      logger.info('모든 학습자료 벡터 동기화 완료', { success, failed });
      return { success, failed };
    } catch (error) {
      logger.error('학습자료 벡터 동기화 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 벡터 데이터베이스 상태 확인
   */
  static async getVectorDatabaseStatus(): Promise<{
    healthy: boolean;
    problemsCount: number;
    materialsCount: number;
    totalCount: number;
  }> {
    try {
      const { chromaClient } = await import('@/lib/vector/chromadb');
      const stats = await vectorService.getCollectionStats();
      const healthy = await chromaClient.isHealthy();

      return {
        healthy,
        problemsCount: stats.problems,
        materialsCount: stats.learningMaterials,
        totalCount: stats.total,
      };
    } catch (error) {
      logger.error('벡터 데이터베이스 상태 확인 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        healthy: false,
        problemsCount: 0,
        materialsCount: 0,
        totalCount: 0,
      };
    }
  }
}
