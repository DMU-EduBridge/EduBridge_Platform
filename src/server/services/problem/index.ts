// Problem 서비스들
export { ProblemCrudService } from './problem-crud.service';
export { ProblemReviewService } from './problem-review.service';
export { ProblemSearchService } from './problem-search.service';
export { ProblemStatsService } from './problem-stats.service';

// 통합 ProblemService (기존 호환성 유지)
import { ProblemCrudService } from './problem-crud.service';
import { ProblemReviewService } from './problem-review.service';
import { ProblemSearchService } from './problem-search.service';
import { ProblemStatsService } from './problem-stats.service';

export class ProblemService {
  public crud: ProblemCrudService;
  public stats: ProblemStatsService;
  public search: ProblemSearchService;
  public review: ProblemReviewService;

  constructor() {
    this.crud = new ProblemCrudService();
    this.stats = new ProblemStatsService();
    this.search = new ProblemSearchService();
    this.review = new ProblemReviewService();
  }

  // 기존 메서드들을 하위 서비스로 위임
  async getProblemById(id: string) {
    return this.crud.getProblemById(id);
  }

  async getProblems(query: any) {
    return this.search.getProblems(query);
  }

  async createProblem(data: any, createdBy: string) {
    return this.crud.createProblem(data, createdBy);
  }

  async updateProblem(id: string, data: any) {
    return this.crud.updateProblem(id, data);
  }

  async deleteProblem(id: string) {
    return this.crud.deleteProblem(id);
  }

  async getProblemStats() {
    return this.stats.getProblemStats();
  }

  async getUserProblemStats(userId: string) {
    return this.stats.getUserProblemStats(userId);
  }

  async getProblemAttemptStats(problemId: string) {
    return this.stats.getProblemAttemptStats(problemId);
  }

  async searchProblems(searchTerm: string, filters?: any) {
    return this.search.searchProblems(searchTerm, filters);
  }

  async getRecommendedProblems(userId: string, limit?: number) {
    return this.search.getRecommendedProblems(userId, limit);
  }

  async getPopularProblems(limit?: number, period?: any) {
    return this.search.getPopularProblems(limit, period);
  }

  async getFilterOptions() {
    return this.search.getFilterOptions();
  }

  async approveProblem(problemId: string, reviewerId: string) {
    return this.review.approveProblem(problemId, reviewerId);
  }

  async rejectProblem(problemId: string, reviewerId: string, reason?: string) {
    return this.review.rejectProblem(problemId, reviewerId, reason);
  }

  async getPendingReviewProblems(page?: number, limit?: number) {
    return this.review.getPendingReviewProblems(page, limit);
  }

  async getReviewedProblems(reviewerId?: string, page?: number, limit?: number) {
    return this.review.getReviewedProblems(reviewerId, page, limit);
  }

  async getReviewStats(reviewerId?: string) {
    return this.review.getReviewStats(reviewerId);
  }
}
