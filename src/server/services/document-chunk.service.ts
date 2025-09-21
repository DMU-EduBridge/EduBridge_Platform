import { DocumentChunk } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import {
  CreateDocumentChunkDtoType,
  DocumentChunkListQueryDtoType,
  UpdateDocumentChunkDtoType,
  VectorSearchDtoType,
} from '../dto/document-chunk';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';

export class DocumentChunkService {
  private documentChunkRepository = new DocumentChunkRepository();

  async getDocumentChunkById(id: string): Promise<DocumentChunk | null> {
    try {
      return await this.documentChunkRepository.findById(id);
    } catch (error) {
      logger.error('문서 청크 조회 실패', undefined, {
        chunkId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문서 청크 조회에 실패했습니다.');
    }
  }

  async getDocumentChunks(query: DocumentChunkListQueryDtoType): Promise<{
    chunks: DocumentChunk[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { chunks, total } = await this.documentChunkRepository.findMany(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        chunks,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('문서 청크 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문서 청크 목록 조회에 실패했습니다.');
    }
  }

  async createDocumentChunk(data: CreateDocumentChunkDtoType): Promise<DocumentChunk> {
    try {
      return await this.documentChunkRepository.create(data);
    } catch (error) {
      logger.error('문서 청크 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문서 청크 생성에 실패했습니다.');
    }
  }

  async updateDocumentChunk(id: string, data: UpdateDocumentChunkDtoType): Promise<DocumentChunk> {
    try {
      const existingChunk = await this.documentChunkRepository.findById(id);
      if (!existingChunk) {
        throw new Error('문서 청크를 찾을 수 없습니다.');
      }

      return await this.documentChunkRepository.update(id, data);
    } catch (error) {
      logger.error('문서 청크 업데이트 실패', undefined, {
        chunkId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async deleteDocumentChunk(id: string): Promise<DocumentChunk> {
    try {
      const existingChunk = await this.documentChunkRepository.findById(id);
      if (!existingChunk) {
        throw new Error('문서 청크를 찾을 수 없습니다.');
      }

      return await this.documentChunkRepository.delete(id);
    } catch (error) {
      logger.error('문서 청크 삭제 실패', undefined, {
        chunkId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getDocumentChunksByTextbookId(textbookId: string): Promise<DocumentChunk[]> {
    try {
      return await this.documentChunkRepository.findByTextbookId(textbookId);
    } catch (error) {
      logger.error('교과서별 문서 청크 조회 실패', undefined, {
        textbookId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교과서별 문서 청크 조회에 실패했습니다.');
    }
  }

  async vectorSearch(query: VectorSearchDtoType): Promise<DocumentChunk[]> {
    try {
      return await this.documentChunkRepository.vectorSearch(query);
    } catch (error) {
      logger.error('벡터 검색 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('벡터 검색에 실패했습니다.');
    }
  }

  async getDocumentChunkStats(): Promise<{
    totalChunks: number;
    byTextbook: Record<string, number>;
    averageChunkLength: number;
  }> {
    try {
      return await this.documentChunkRepository.getDocumentChunkStats();
    } catch (error) {
      logger.error('문서 청크 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문서 청크 통계 조회에 실패했습니다.');
    }
  }
}
