import { SearchQuery, SearchResult } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import {
  CreateSearchQueryDtoType,
  CreateSearchResultDtoType,
  SearchQueryListQueryDtoType,
  SearchResultListQueryDtoType,
} from '../dto/search';
import { SearchRepository } from '../repositories/search.repository';

export class SearchService {
  private searchRepository = new SearchRepository();

  async getSearchQueryById(id: string): Promise<SearchQuery | null> {
    try {
      return await this.searchRepository.findSearchQueryById(id);
    } catch (error) {
      logger.error('검색 쿼리 조회 실패', undefined, {
        queryId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('검색 쿼리 조회에 실패했습니다.');
    }
  }

  async getSearchQueries(query: SearchQueryListQueryDtoType): Promise<{
    queries: SearchQuery[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { queries, total } = await this.searchRepository.findSearchQueries(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        queries,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('검색 쿼리 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('검색 쿼리 목록 조회에 실패했습니다.');
    }
  }

  async createSearchQuery(data: CreateSearchQueryDtoType, userId: string): Promise<SearchQuery> {
    try {
      return await this.searchRepository.createSearchQuery(data, userId);
    } catch (error) {
      logger.error('검색 쿼리 생성 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('검색 쿼리 생성에 실패했습니다.');
    }
  }

  async getSearchResults(query: SearchResultListQueryDtoType): Promise<{
    results: SearchResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { results, total } = await this.searchRepository.findSearchResults(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        results,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('검색 결과 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('검색 결과 목록 조회에 실패했습니다.');
    }
  }

  async createSearchResult(data: CreateSearchResultDtoType): Promise<SearchResult> {
    try {
      return await this.searchRepository.createSearchResult(data);
    } catch (error) {
      logger.error('검색 결과 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('검색 결과 생성에 실패했습니다.');
    }
  }

  async getSearchStats(): Promise<{
    totalQueries: number;
    totalResults: number;
    averageSearchTime: number;
    topSubjects: Record<string, number>;
  }> {
    try {
      return await this.searchRepository.getSearchStats();
    } catch (error) {
      logger.error('검색 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('검색 통계 조회에 실패했습니다.');
    }
  }

  async getSearchHistoryByUserId(userId: string, limit: number = 20): Promise<SearchQuery[]> {
    try {
      return await this.searchRepository.getSearchHistoryByUserId(userId, limit);
    } catch (error) {
      logger.error('사용자 검색 히스토리 조회 실패', undefined, {
        userId,
        limit,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 검색 히스토리 조회에 실패했습니다.');
    }
  }
}
