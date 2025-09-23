import { prisma } from '@/lib/core/prisma';
import { Prisma, Textbook } from '@prisma/client';
import {
  CreateTextbookDtoType,
  TextbookListQueryDtoType,
  UpdateTextbookDtoType,
} from '../dto/textbook';

export class TextbookRepository {
  async findById(id: string): Promise<Textbook | null> {
    return prisma.textbook.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chunks: {
          orderBy: { chunkIndex: 'asc' },
        },
      },
    });
  }

  async findMany(
    query: TextbookListQueryDtoType,
  ): Promise<{ textbooks: Textbook[]; total: number }> {
    const { page, limit, subject, gradeLevel, publisher, processingStatus, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TextbookWhereInput = {};

    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (publisher) where.publisher = { contains: publisher };
    if (processingStatus) where.processingStatus = processingStatus;
    if (search) {
      where.OR = [{ title: { contains: search } }, { subject: { contains: search } }];
    }

    const [textbooks, total] = await Promise.all([
      prisma.textbook.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          chunks: {
            orderBy: { chunkIndex: 'asc' },
            take: 5, // 목록에서는 처음 5개 청크만
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.textbook.count({ where }),
    ]);

    return { textbooks, total };
  }

  async create(data: CreateTextbookDtoType, userId: string): Promise<Textbook> {
    return prisma.textbook.create({
      data: {
        ...data,
        uploadedBy: userId,
        processingStatus: 'PENDING',
        fileName: 'unknown.pdf',
        filePath: '/uploads/unknown.pdf',
        fileSize: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTextbookDtoType): Promise<Textbook> {
    return prisma.textbook.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chunks: {
          orderBy: { chunkIndex: 'asc' },
        },
      },
    });
  }

  async delete(id: string): Promise<Textbook> {
    return prisma.textbook.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Textbook[]> {
    return prisma.textbook.findMany({
      where: { uploadedBy: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTextbookStats(): Promise<{
    totalTextbooks: number;
    bySubject: Record<string, number>;
    byGradeLevel: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [totalTextbooks, bySubject, byGradeLevel, byStatus] = await Promise.all([
      prisma.textbook.count(),
      prisma.textbook.groupBy({
        by: ['subject'],
        _count: { subject: true },
      }),
      prisma.textbook.groupBy({
        by: ['gradeLevel'],
        _count: { gradeLevel: true },
      }),
      prisma.textbook.groupBy({
        by: ['processingStatus'],
        _count: { processingStatus: true },
      }),
    ]);

    return {
      totalTextbooks,
      bySubject: bySubject.reduce(
        (acc, item) => ({ ...acc, [item.subject]: item._count.subject }),
        {},
      ),
      byGradeLevel: byGradeLevel.reduce(
        (acc, item) => ({ ...acc, [item.gradeLevel]: item._count.gradeLevel }),
        {},
      ),
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.processingStatus]: item._count.processingStatus }),
        {},
      ),
    };
  }
}
