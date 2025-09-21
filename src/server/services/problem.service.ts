import { Problem } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import {
  CreateProblemDtoType,
  ProblemListQueryDtoType,
  UpdateProblemDtoType,
} from '../dto/problem';
import { ProblemRepository } from '../repositories/problem.repository';

export class ProblemService {
  private problemRepository = new ProblemRepository();

  async getProblemById(id: string): Promise<Problem | null> {
    try {
      return await this.problemRepository.findById(id);
    } catch (error) {
      logger.error('문제 조회 실패', undefined, {
        problemId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문제 조회에 실패했습니다.');
    }
  }

  async getProblems(
    query: ProblemListQueryDtoType,
  ): Promise<{ problems: Problem[]; total: number; pagination: any }> {
    try {
      const { problems, total } = await this.problemRepository.findMany(query);
      const { page, limit } = query;

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      return { problems, total, pagination };
    } catch (error) {
      logger.error('문제 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문제 목록 조회에 실패했습니다.');
    }
  }

  async createProblem(data: CreateProblemDtoType, createdBy: string): Promise<Problem> {
    try {
      const problem = await this.problemRepository.create(data, createdBy);
      logger.info('문제 생성 성공', { problemId: problem.id, createdBy });
      return problem;
    } catch (error) {
      logger.error('문제 생성 실패', undefined, {
        data,
        createdBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('문제 생성에 실패했습니다.');
    }
  }

  async updateProblem(id: string, data: UpdateProblemDtoType): Promise<Problem> {
    try {
      const existingProblem = await this.problemRepository.findById(id);
      if (!existingProblem) {
        throw new Error('문제를 찾을 수 없습니다.');
      }

      const problem = await this.problemRepository.update(id, data);
      logger.info('문제 업데이트 성공', { problemId: id });
      return problem;
    } catch (error) {
      logger.error('문제 업데이트 실패', undefined, {
        problemId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('문제 업데이트에 실패했습니다.');
    }
  }

  async deleteProblem(id: string): Promise<Problem> {
    try {
      const existingProblem = await this.problemRepository.findById(id);
      if (!existingProblem) {
        throw new Error('문제를 찾을 수 없습니다.');
      }

      const problem = await this.problemRepository.softDelete(id);
      logger.info('문제 삭제 성공', { problemId: id });
      return problem;
    } catch (error) {
      logger.error('문제 삭제 실패', undefined, {
        problemId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('문제 삭제에 실패했습니다.');
    }
  }

  async getProblemStats(): Promise<any> {
    try {
      return await this.problemRepository.getStats();
    } catch (error) {
      logger.error('문제 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문제 통계 조회에 실패했습니다.');
    }
  }

  async getProblemsByCreator(
    createdBy: string,
    query: Omit<ProblemListQueryDtoType, 'page' | 'limit'>,
  ): Promise<Problem[]> {
    try {
      return await this.problemRepository.findByCreator(createdBy, query);
    } catch (error) {
      logger.error('생성자별 문제 조회 실패', undefined, {
        createdBy,
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('생성자별 문제 조회에 실패했습니다.');
    }
  }

  async reviewProblem(
    id: string,
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION',
    reviewedBy: string,
  ): Promise<Problem> {
    try {
      const existingProblem = await this.problemRepository.findById(id);
      if (!existingProblem) {
        throw new Error('문제를 찾을 수 없습니다.');
      }

      const problem = await this.problemRepository.updateReviewStatus(id, reviewStatus, reviewedBy);
      logger.info('문제 리뷰 업데이트 성공', { problemId: id, reviewStatus, reviewedBy });
      return problem;
    } catch (error) {
      logger.error('문제 리뷰 업데이트 실패', undefined, {
        problemId: id,
        reviewStatus,
        reviewedBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('문제 리뷰 업데이트에 실패했습니다.');
    }
  }

  async getPendingReviewProblems(): Promise<Problem[]> {
    try {
      return await this.problemRepository.findPendingReview();
    } catch (error) {
      logger.error('리뷰 대기 문제 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('리뷰 대기 문제 조회에 실패했습니다.');
    }
  }

  async generateAIProblem(prompt: string, context: any, createdBy: string): Promise<Problem> {
    try {
      // AI 문제 생성 로직 (실제로는 AI 서버와 연동)
      const aiProblemData: CreateProblemDtoType = {
        title: `AI 생성 문제 - ${new Date().toLocaleDateString()}`,
        description: 'AI가 생성한 문제입니다.',
        content: prompt,
        subject: context.subject || '수학',
        type: 'MULTIPLE_CHOICE',
        difficulty: context.difficulty || 'MEDIUM',
        gradeLevel: context.gradeLevel,
        unit: context.unit,
        correctAnswer: '정답을 확인하세요',
        explanation: 'AI가 생성한 문제입니다.',
        points: 5,
        textbookId: context.textbookId,
      };

      const problem = await this.problemRepository.create(
        {
          ...aiProblemData,
          generationPrompt: prompt,
          contextChunkIds: JSON.stringify(context.chunkIds || []),
          generationTimeMs: Date.now(),
          modelName: 'gpt-4',
          tokensUsed: 1000,
          costUsd: 0.05,
        },
        createdBy,
      );

      logger.info('AI 문제 생성 성공', { problemId: problem.id, createdBy });
      return problem;
    } catch (error) {
      logger.error('AI 문제 생성 실패', undefined, {
        prompt,
        context,
        createdBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('AI 문제 생성에 실패했습니다.');
    }
  }
}
