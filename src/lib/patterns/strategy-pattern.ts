/**
 * 검색 및 필터링을 위한 간소화된 Strategy Pattern
 */

import type { Problem } from '@/types/domain/problem';

// 필터링 기준 타입 정의
export interface FilterCriteria {
  difficulty?: string | undefined;
  subject?: string | undefined;
  type?: string | undefined;
  gradeLevel?: string | undefined;
  status?: string | undefined;
  isAIGenerated?: boolean | undefined;
}

// 정렬 기준 타입 정의
export interface SortCriteria {
  order?: 'asc' | 'desc';
  field?: 'createdAt' | 'updatedAt' | 'title' | 'difficulty' | 'points';
}

// 검색 전략 인터페이스
export interface SearchStrategy {
  search(problems: Problem[], query: string): Problem[];
  getStrategyName(): string;
}

// 필터링 전략 인터페이스
export interface FilterStrategy {
  filter(problems: Problem[], criteria: FilterCriteria): Problem[];
  getStrategyName(): string;
}

// 정렬 전략 인터페이스
export interface SortStrategy {
  sort(problems: Problem[], criteria: SortCriteria): Problem[];
  getStrategyName(): string;
}

// 텍스트 검색 전략
export class TextSearchStrategy implements SearchStrategy {
  getStrategyName(): string {
    return 'text-search';
  }

  search(problems: Problem[], query: string): Problem[] {
    const queryLower = query.toLowerCase();
    return problems.filter(
      (problem) =>
        problem.title.toLowerCase().includes(queryLower) ||
        problem.content.toLowerCase().includes(queryLower) ||
        problem.description?.toLowerCase().includes(queryLower) ||
        problem.tags?.some((tag) => tag.toLowerCase().includes(queryLower)),
    );
  }
}

// 태그 검색 전략
export class TagSearchStrategy implements SearchStrategy {
  getStrategyName(): string {
    return 'tag-search';
  }

  search(problems: Problem[], query: string): Problem[] {
    const tags = query.split(',').map((tag) => tag.trim().toLowerCase());
    return problems.filter((problem) =>
      tags.some((tag) =>
        problem.tags?.some((problemTag) => problemTag.toLowerCase().includes(tag)),
      ),
    );
  }
}

// 난이도 필터링 전략
export class DifficultyFilterStrategy implements FilterStrategy {
  getStrategyName(): string {
    return 'difficulty-filter';
  }

  filter(problems: Problem[], criteria: { difficulty: string }): Problem[] {
    return problems.filter((problem) => problem.difficulty === criteria.difficulty);
  }
}

// 과목 필터링 전략
export class SubjectFilterStrategy implements FilterStrategy {
  getStrategyName(): string {
    return 'subject-filter';
  }

  filter(problems: Problem[], criteria: { subject: string }): Problem[] {
    return problems.filter((problem) => problem.subject === criteria.subject);
  }

  filterMultiple(problems: Problem[], criteria: { subjects: string[] }): Problem[] {
    return problems.filter((problem) => criteria.subjects.includes(problem.subject));
  }
}

// 타입 필터링 전략
export class TypeFilterStrategy implements FilterStrategy {
  getStrategyName(): string {
    return 'type-filter';
  }

  filter(problems: Problem[], criteria: FilterCriteria): Problem[] {
    if (!criteria.type) return problems;
    return problems.filter((problem) => problem.type === criteria.type);
  }
}

// 복합 필터링 전략
export class CompositeFilterStrategy implements FilterStrategy {
  constructor(private strategies: FilterStrategy[]) {}

  getStrategyName(): string {
    return 'composite-filter';
  }

  filter(problems: Problem[], criteria: FilterCriteria): Problem[] {
    return this.strategies.reduce(
      (filteredProblems, strategy) => strategy.filter(filteredProblems, criteria),
      problems,
    );
  }
}

// 제목 정렬 전략
export class TitleSortStrategy implements SortStrategy {
  getStrategyName(): string {
    return 'title-sort';
  }

  sort(problems: Problem[], criteria: SortCriteria = { order: 'asc' }): Problem[] {
    return [...problems].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return criteria.order === 'asc' ? comparison : -comparison;
    });
  }
}

// 난이도 정렬 전략
export class DifficultySortStrategy implements SortStrategy {
  getStrategyName(): string {
    return 'difficulty-sort';
  }

  sort(problems: Problem[], criteria: SortCriteria = { order: 'asc' }): Problem[] {
    const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3, EXPERT: 4 };
    return [...problems].sort((a, b) => {
      const aOrder = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
      const bOrder = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
      const comparison = aOrder - bOrder;
      return criteria.order === 'asc' ? comparison : -comparison;
    });
  }
}

// 생성일 정렬 전략
export class CreatedAtSortStrategy implements SortStrategy {
  getStrategyName(): string {
    return 'created-at-sort';
  }

  sort(problems: Problem[], criteria: SortCriteria = { order: 'desc' }): Problem[] {
    return [...problems].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      const comparison = aDate - bDate;
      return criteria.order === 'asc' ? comparison : -comparison;
    });
  }
}

// 문제 검색 컨텍스트
export class ProblemSearchContext {
  constructor(
    private searchStrategy: SearchStrategy,
    private filterStrategy: FilterStrategy,
    private sortStrategy: SortStrategy,
  ) {}

  setSearchStrategy(strategy: SearchStrategy): void {
    this.searchStrategy = strategy;
  }

  setFilterStrategy(strategy: FilterStrategy): void {
    this.filterStrategy = strategy;
  }

  setSortStrategy(strategy: SortStrategy): void {
    this.sortStrategy = strategy;
  }

  search(
    problems: Problem[],
    query: string,
    filterCriteria: FilterCriteria,
    sortCriteria: SortCriteria,
  ): Problem[] {
    let result = problems;

    // 검색
    if (query) {
      result = this.searchStrategy.search(result, query);
    }

    // 필터링
    if (filterCriteria) {
      result = this.filterStrategy.filter(result, filterCriteria);
    }

    // 정렬
    if (sortCriteria) {
      result = this.sortStrategy.sort(result, sortCriteria);
    }

    return result;
  }
}

// 전략 팩토리
export class StrategyFactory {
  static createSearchStrategy(type: 'text' | 'tag'): SearchStrategy {
    switch (type) {
      case 'text':
        return new TextSearchStrategy();
      case 'tag':
        return new TagSearchStrategy();
      default:
        return new TextSearchStrategy();
    }
  }

  static createFilterStrategy(type: 'difficulty' | 'subject' | 'type'): FilterStrategy {
    switch (type) {
      case 'difficulty':
        return new DifficultyFilterStrategy();
      case 'subject':
        return new SubjectFilterStrategy();
      case 'type':
        return new TypeFilterStrategy();
      default:
        return new DifficultyFilterStrategy();
    }
  }

  static createSortStrategy(type: 'title' | 'difficulty' | 'createdAt'): SortStrategy {
    switch (type) {
      case 'title':
        return new TitleSortStrategy();
      case 'difficulty':
        return new DifficultySortStrategy();
      case 'createdAt':
        return new CreatedAtSortStrategy();
      default:
        return new CreatedAtSortStrategy();
    }
  }

  static createCompositeFilter(strategies: FilterStrategy[]): FilterStrategy {
    return new CompositeFilterStrategy(strategies);
  }
}

// 전역 검색 컨텍스트 인스턴스
export const problemSearchContext = new ProblemSearchContext(
  StrategyFactory.createSearchStrategy('text'),
  StrategyFactory.createFilterStrategy('difficulty'),
  StrategyFactory.createSortStrategy('createdAt'),
);
