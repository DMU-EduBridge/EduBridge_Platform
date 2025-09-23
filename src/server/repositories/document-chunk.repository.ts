import { prisma } from '@/lib/core/prisma';
import { Prisma, DocumentChunk } from '@prisma/client';
import {
  CreateDocumentChunkDtoType,
  DocumentChunkListQueryDtoType,
  UpdateDocumentChunkDtoType,
  VectorSearchDtoType,
} from '../dto/document-chunk';

export class DocumentChunkRepository {
  async findById(id: string): Promise<DocumentChunk | null> {
    return prisma.documentChunk.findUnique({
      where: { id },
      include: {
        textbook: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
          },
        },
      },
    });
  }

  async findMany(
    query: DocumentChunkListQueryDtoType,
  ): Promise<{ chunks: DocumentChunk[]; total: number }> {
    const { page, limit, textbookId, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentChunkWhereInput = {};

    if (textbookId) where.textbookId = textbookId;
    if (search) {
      where.content = { contains: search };
    }

    const [chunks, total] = await Promise.all([
      prisma.documentChunk.findMany({
        where,
        skip,
        take: limit,
        include: {
          textbook: {
            select: {
              id: true,
              title: true,
              subject: true,
              gradeLevel: true,
            },
          },
        },
        orderBy: { chunkIndex: 'asc' },
      }),
      prisma.documentChunk.count({ where }),
    ]);

    return { chunks, total };
  }

  async create(data: CreateDocumentChunkDtoType): Promise<DocumentChunk> {
    return prisma.documentChunk.create({
      data: {
        textbookId: data.textbookId,
        chunkIndex: data.chunkIndex,
        content: data.content,
        contentLength: data.contentLength,
        embeddingId: data.embeddingId,
        metadata: data.metadata,
      },
      include: {
        textbook: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateDocumentChunkDtoType): Promise<DocumentChunk> {
    return prisma.documentChunk.update({
      where: { id },
      data: {
        chunkIndex: data.chunkIndex,
        content: data.content,
        contentLength: data.contentLength,
        embeddingId: data.embeddingId,
        metadata: data.metadata,
      },
      include: {
        textbook: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<DocumentChunk> {
    return prisma.documentChunk.delete({
      where: { id },
    });
  }

  async findByTextbookId(textbookId: string): Promise<DocumentChunk[]> {
    return prisma.documentChunk.findMany({
      where: { textbookId },
      include: {
        textbook: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
          },
        },
      },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  async vectorSearch(query: VectorSearchDtoType): Promise<DocumentChunk[]> {
    // 실제 벡터 검색은 ChromaDB에서 수행되므로, 여기서는 기본 텍스트 검색으로 대체
    const where: Prisma.DocumentChunkWhereInput = {
      content: { contains: query.query },
    };

    if (query.textbookId) {
      where.textbookId = query.textbookId;
    }

    return prisma.documentChunk.findMany({
      where,
      take: query.limit,
      include: {
        textbook: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
          },
        },
      },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  async getDocumentChunkStats(): Promise<{
    totalChunks: number;
    byTextbook: Record<string, number>;
    averageChunkLength: number;
  }> {
    const [totalChunks, byTextbook, avgLength] = await Promise.all([
      prisma.documentChunk.count(),
      prisma.documentChunk.groupBy({
        by: ['textbookId'],
        _count: { textbookId: true },
      }),
      prisma.documentChunk.aggregate({
        _avg: { contentLength: true },
      }),
    ]);

    return {
      totalChunks,
      byTextbook: byTextbook.reduce(
        (acc, item) => ({ ...acc, [item.textbookId]: item._count.textbookId }),
        {},
      ),
      averageChunkLength: avgLength._avg.contentLength || 0,
    };
  }
}
