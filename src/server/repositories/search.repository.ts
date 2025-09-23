import { prisma } from '@/lib/core/prisma';
import { Prisma, SearchQuery, SearchResult } from '@prisma/client';
import {
  CreateSearchQueryDtoType,
  CreateSearchResultDtoType,
  SearchQueryListQueryDtoType,
  SearchResultListQueryDtoType,
} from '../dto/search';

export class SearchRepository {
  async findSearchQueryById(id: string): Promise<SearchQuery | null> {
    return prisma.searchQuery.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        results: {
          include: {
            chunk: {
              select: {
                id: true,
                content: true,
                chunkIndex: true,
              },
            },
          },
          orderBy: { rankPosition: 'asc' },
        },
      },
    });
  }

  async findSearchQueries(
    query: SearchQueryListQueryDtoType,
  ): Promise<{ queries: SearchQuery[]; total: number }> {
    const { page, limit, userId, subject, gradeLevel, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SearchQueryWhereInput = {};

    if (userId) where.userId = userId;
    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (search) {
      where.queryText = { contains: search };
    }

    const [queries, total] = await Promise.all([
      prisma.searchQuery.findMany({
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
          results: {
            include: {
              chunk: {
                select: {
                  id: true,
                  content: true,
                  chunkIndex: true,
                },
              },
            },
            orderBy: { rankPosition: 'asc' },
            take: 5, // 목록에서는 최대 5개 결과만
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.searchQuery.count({ where }),
    ]);

    return { queries, total };
  }

  async createSearchQuery(data: CreateSearchQueryDtoType, userId: string): Promise<SearchQuery> {
    return prisma.searchQuery.create({
      data: {
        queryText: data.queryText,
        subject: data.subject,
        gradeLevel: data.gradeLevel,
        unit: data.unit,
        searchTimeMs: data.searchTimeMs || 0,
        resultsCount: 0, // 기본값
        userId,
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

  async findSearchResults(
    query: SearchResultListQueryDtoType,
  ): Promise<{ results: SearchResult[]; total: number }> {
    const { page, limit, queryId, chunkId, minSimilarityScore } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SearchResultWhereInput = {};

    if (queryId) where.queryId = queryId;
    if (chunkId) where.chunkId = chunkId;
    if (minSimilarityScore !== undefined) {
      where.similarityScore = { gte: minSimilarityScore };
    }

    const [results, total] = await Promise.all([
      prisma.searchResult.findMany({
        where,
        skip,
        take: limit,
        include: {
          query: {
            select: {
              id: true,
              queryText: true,
              userId: true,
            },
          },
          chunk: {
            select: {
              id: true,
              content: true,
              chunkIndex: true,
              textbook: {
                select: {
                  id: true,
                  title: true,
                  subject: true,
                },
              },
            },
          },
        },
        orderBy: { similarityScore: 'desc' },
      }),
      prisma.searchResult.count({ where }),
    ]);

    return { results, total };
  }

  async createSearchResult(data: CreateSearchResultDtoType): Promise<SearchResult> {
    return prisma.searchResult.create({
      data: {
        queryId: data.queryId,
        chunkId: data.chunkId,
        similarityScore: data.similarityScore,
        rankPosition: data.rankPosition,
      },
      include: {
        query: {
          select: {
            id: true,
            queryText: true,
            userId: true,
          },
        },
        chunk: {
          select: {
            id: true,
            content: true,
            chunkIndex: true,
            textbook: {
              select: {
                id: true,
                title: true,
                subject: true,
              },
            },
          },
        },
      },
    });
  }

  async getSearchStats(): Promise<{
    totalQueries: number;
    totalResults: number;
    averageSearchTime: number;
    topSubjects: Record<string, number>;
  }> {
    const [totalQueries, totalResults, avgSearchTime, topSubjects] = await Promise.all([
      prisma.searchQuery.count(),
      prisma.searchResult.count(),
      prisma.searchQuery.aggregate({
        _avg: { searchTimeMs: true },
      }),
      prisma.searchQuery.groupBy({
        by: ['subject'],
        _count: { subject: true },
        where: { subject: { not: null } },
        orderBy: { _count: { subject: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalQueries,
      totalResults,
      averageSearchTime: avgSearchTime._avg.searchTimeMs || 0,
      topSubjects: topSubjects.reduce(
        (acc, item) => ({ ...acc, [item.subject || 'Unknown']: item._count.subject }),
        {},
      ),
    };
  }

  async getSearchHistoryByUserId(userId: string, limit: number = 20): Promise<SearchQuery[]> {
    return prisma.searchQuery.findMany({
      where: { userId },
      include: {
        results: {
          include: {
            chunk: {
              select: {
                id: true,
                content: true,
                chunkIndex: true,
              },
            },
          },
          orderBy: { rankPosition: 'asc' },
          take: 3, // 최근 검색에서는 최대 3개 결과만
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
