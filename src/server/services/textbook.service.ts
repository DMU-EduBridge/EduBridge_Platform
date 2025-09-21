import { Textbook } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import {
  CreateTextbookDtoType,
  TextbookListQueryDtoType,
  UpdateTextbookDtoType,
} from '../dto/textbook';
import { TextbookRepository } from '../repositories/textbook.repository';

export class TextbookService {
  private textbookRepository = new TextbookRepository();

  async getTextbookById(id: string): Promise<Textbook | null> {
    try {
      return await this.textbookRepository.findById(id);
    } catch (error) {
      logger.error('교과서 조회 실패', undefined, {
        textbookId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교과서 조회에 실패했습니다.');
    }
  }

  async getTextbooks(query: TextbookListQueryDtoType): Promise<{
    textbooks: Textbook[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { textbooks, total } = await this.textbookRepository.findMany(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        textbooks,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('교과서 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교과서 목록 조회에 실패했습니다.');
    }
  }

  async createTextbook(data: CreateTextbookDtoType, userId: string): Promise<Textbook> {
    try {
      return await this.textbookRepository.create(data, userId);
    } catch (error) {
      logger.error('교과서 생성 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교과서 생성에 실패했습니다.');
    }
  }

  async updateTextbook(id: string, data: UpdateTextbookDtoType): Promise<Textbook> {
    try {
      const existingTextbook = await this.textbookRepository.findById(id);
      if (!existingTextbook) {
        throw new Error('교과서를 찾을 수 없습니다.');
      }

      return await this.textbookRepository.update(id, data);
    } catch (error) {
      logger.error('교과서 업데이트 실패', undefined, {
        textbookId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async deleteTextbook(id: string): Promise<Textbook> {
    try {
      const existingTextbook = await this.textbookRepository.findById(id);
      if (!existingTextbook) {
        throw new Error('교과서를 찾을 수 없습니다.');
      }

      return await this.textbookRepository.delete(id);
    } catch (error) {
      logger.error('교과서 삭제 실패', undefined, {
        textbookId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getTextbooksByUserId(userId: string): Promise<Textbook[]> {
    try {
      return await this.textbookRepository.findByUserId(userId);
    } catch (error) {
      logger.error('사용자 교과서 목록 조회 실패', undefined, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 교과서 목록 조회에 실패했습니다.');
    }
  }

  async getTextbookStats(): Promise<{
    totalTextbooks: number;
    bySubject: Record<string, number>;
    byGradeLevel: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      return await this.textbookRepository.getTextbookStats();
    } catch (error) {
      logger.error('교과서 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교과서 통계 조회에 실패했습니다.');
    }
  }
}
